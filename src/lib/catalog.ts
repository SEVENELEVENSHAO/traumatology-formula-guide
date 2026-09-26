import data from "@/data/catalog.json";
import type { Catalog, Formula, FormulaRelationship } from "@/types/catalog";

export const catalog = data as unknown as Catalog;

export const formulaById = new Map(catalog.formulas.map((formula) => [formula.id, formula]));

export function relationsFor(id: string): FormulaRelationship[] {
  return catalog.relationships.filter((relation) => relation.from === id || relation.to === id);
}

export function connectedFormula(relation: FormulaRelationship, id: string): Formula | undefined {
  return formulaById.get(relation.from === id ? relation.to : relation.from);
}

export function searchFormulas(query: string, formulas = catalog.formulas): Formula[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return formulas;
  return formulas.filter((formula) => {
    const sources = formula.sourceReferences.map((source) => source.text).join(" ");
    const haystack = `${formula.searchText} ${sources}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function formulaDiff(formulas: Formula[]) {
  const sets = formulas.map((formula) => new Set(formula.ingredients));
  const shared = sets.length
    ? [...sets[0]].filter((ingredient) => sets.every((set) => set.has(ingredient)))
    : [];
  return {
    shared,
    unique: formulas.map((formula, index) => ({
      formula,
      ingredients: [...sets[index]].filter((ingredient) => !shared.includes(ingredient)),
    })),
  };
}

export function relationLabel(type: FormulaRelationship["type"]): string {
  return type.replaceAll("_", " ");
}
