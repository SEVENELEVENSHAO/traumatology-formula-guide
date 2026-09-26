from __future__ import annotations

import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "src" / "data" / "raw-sources.json"
REVIEWED_PATH = ROOT / "src" / "data" / "reviewed-records.json"
OUTPUT_PATH = ROOT / "src" / "data" / "catalog.json"
REPORT_PATH = ROOT / "src" / "data" / "catalog-report.json"


def key(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).lower()
    return re.sub(r"[^a-z0-9]+", "", value)


def main() -> None:
    raw = json.loads(RAW_PATH.read_text(encoding="utf-8"))
    reviewed = json.loads(REVIEWED_PATH.read_text(encoding="utf-8"))
    raw_records = raw["records"]

    formulas = reviewed["formulas"]
    formula_ids = {item["id"] for item in formulas}
    if len(formula_ids) != len(formulas):
        raise ValueError("Duplicate formula IDs")

    for formula in formulas:
        queries = [formula["name"], *formula.get("aliases", [])]
        matches = []
        for record in raw_records:
            haystack = key(record["text"])
            if any(len(key(query)) >= 5 and key(query) in haystack for query in queries):
                matches.append(
                    {
                        "sourceId": record["sourceId"],
                        "locator": record["locator"],
                        "recordId": record["id"],
                        "text": record["text"],
                        "reviewStatus": "pending",
                    }
                )
        formula["sourceReferences"] = matches[:12]
        formula["ingredientCount"] = len(formula.get("ingredients", []))
        formula["searchText"] = " ".join(
            [
                formula["name"],
                *formula.get("aliases", []),
                *formula.get("ingredients", []),
                *formula.get("contexts", []),
                formula.get("family", ""),
            ]
        )

    relations = reviewed["relationships"]
    relation_keys = {(r["from"], r["to"], r["type"]) for r in relations}
    for relation in relations:
        if relation["from"] not in formula_ids or relation["to"] not in formula_ids:
            raise ValueError(f"Dangling relationship: {relation}")
        source_candidates = []
        for formula_id in (relation["from"], relation["to"]):
            formula = next(item for item in formulas if item["id"] == formula_id)
            for reference in formula["sourceReferences"]:
                compact = {
                    "sourceId": reference["sourceId"],
                    "locator": reference["locator"],
                    "recordId": reference["recordId"],
                }
                if compact not in source_candidates:
                    source_candidates.append(compact)
        relation["evidence"]["sourceReferences"] = source_candidates[:4]

    ingredient_sets = {
        item["id"]: {key(name) for name in item.get("ingredients", []) if key(name)}
        for item in formulas
    }
    for small in formulas:
        small_set = ingredient_sets[small["id"]]
        if len(small_set) < 2:
            continue
        for large in formulas:
            if small["id"] == large["id"]:
                continue
            large_set = ingredient_sets[large["id"]]
            relation_key = (large["id"], small["id"], "contains_formula")
            if small_set < large_set and relation_key not in relation_keys:
                relations.append(
                    {
                        "id": f"computed:{large['id']}:{small['id']}",
                        "from": large["id"],
                        "to": small["id"],
                        "type": "contains_formula",
                        "evidence": {
                            "kind": "computed",
                            "summary": f"All {len(small_set)} normalized ingredients occur in {large['name']}; dose is ignored.",
                            "sourceReferences": [
                                *[
                                    {"sourceId": ref["sourceId"], "locator": ref["locator"], "recordId": ref["recordId"]}
                                    for ref in large["sourceReferences"][:1]
                                ],
                                *[
                                    {"sourceId": ref["sourceId"], "locator": ref["locator"], "recordId": ref["recordId"]}
                                    for ref in small["sourceReferences"][:1]
                                ],
                            ],
                        },
                        "addedHerbs": sorted(large_set - small_set),
                        "removedHerbs": [],
                    }
                )
                relation_keys.add(relation_key)

    herbs: dict[str, dict] = {}
    for formula in formulas:
        for position, display_name in enumerate(formula.get("ingredients", []), start=1):
            herb_id = key(display_name)
            if not herb_id:
                continue
            herb = herbs.setdefault(
                herb_id,
                {"id": herb_id, "name": display_name, "aliases": [], "processingVariants": [], "formulaIds": []},
            )
            if formula["id"] not in herb["formulaIds"]:
                herb["formulaIds"].append(formula["id"])
        formula["ingredientRecords"] = [
            {"herbId": key(name), "name": name, "position": position}
            for position, name in enumerate(formula.get("ingredients", []), start=1)
        ]

    catalog = {
        "schemaVersion": 1,
        "generatedUtc": datetime.now(timezone.utc).isoformat(),
        "sources": raw["sources"],
        "formulas": formulas,
        "herbs": sorted(herbs.values(), key=lambda item: item["name"]),
        "relationships": relations,
        "quizPrompts": reviewed["quizPrompts"],
    }
    OUTPUT_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")

    exam_formulas = [item for item in formulas if item.get("exam")]
    report = {
        "formulaCount": len(formulas),
        "examFormulaCount": len(exam_formulas),
        "herbCount": len(herbs),
        "relationshipCount": len(relations),
        "formulaSourceCoverage": sum(bool(item["sourceReferences"]) for item in formulas),
        "formulasWithoutSourceMatch": [item["id"] for item in formulas if not item["sourceReferences"]],
        "examFormulaIds": [item["id"] for item in exam_formulas],
        "visualReviewSlides": raw.get("extractionReport", {}).get("external-medicine-414c", {}).get("visualReviewSlides", []),
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
