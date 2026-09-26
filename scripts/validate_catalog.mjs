import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../src/data/catalog.json", import.meta.url), "utf8"));
const report = JSON.parse(readFileSync(new URL("../src/data/catalog-report.json", import.meta.url), "utf8"));

const errors = [];
const ids = catalog.formulas.map((formula) => formula.id);
const idSet = new Set(ids);
if (ids.length !== idSet.size) errors.push("Duplicate formula IDs");
if (report.examFormulaCount !== 22) errors.push(`Expected 22 exam formulas, found ${report.examFormulaCount}`);
for (const formula of catalog.formulas) {
  if (!formula.name || !formula.category || !formula.reviewStatus) errors.push(`Malformed formula ${formula.id}`);
  if (!Array.isArray(formula.sourceReferences) || formula.sourceReferences.length === 0) errors.push(`Missing source locator: ${formula.id}`);
  for (const ingredient of formula.ingredientRecords ?? []) {
    if (!catalog.herbs.some((herb) => herb.id === ingredient.herbId)) errors.push(`Dangling herb ${ingredient.herbId}`);
  }
}
for (const relation of catalog.relationships) {
  if (!idSet.has(relation.from) || !idSet.has(relation.to)) errors.push(`Dangling relationship ${relation.id}`);
  if (!relation.evidence?.kind || !relation.evidence?.summary) errors.push(`Missing relationship evidence ${relation.id}`);
  if (!relation.evidence?.sourceReferences?.length) errors.push(`Missing relationship source locator ${relation.id}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({ formulas: ids.length, examFormulas: report.examFormulaCount, herbs: catalog.herbs.length, relationships: catalog.relationships.length }));
