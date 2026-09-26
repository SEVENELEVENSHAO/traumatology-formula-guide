"use client";

import { useMemo, useState } from "react";
import { catalog, formulaDiff } from "@/lib/catalog";

export function CompareView({ onOpen }: { onOpen: (id: string) => void }) {
  const defaults = ["si-wu-tang", "tao-hong-si-wu-tang", "xue-fu-zhu-yu-tang"];
  const [ids, setIds] = useState(defaults);
  const formulas = useMemo(() => ids.map((id) => catalog.formulas.find((item) => item.id === id)).filter(Boolean) as typeof catalog.formulas, [ids]);
  const diff = formulaDiff(formulas);
  return <><div className="section-head"><div><h2>Compare formulas</h2><p>Shared core ingredients remain green; additions and substitutions are highlighted by formula.</p></div></div><section className="panel"><div className="compare-picker">{ids.map((id, index) => <div className="select-card" key={index}><label htmlFor={`compare-${index}`}>Formula {index + 1}</label><select id={`compare-${index}`} value={id} onChange={(event) => setIds((current) => current.map((item, i) => i === index ? event.target.value : item))}>{catalog.formulas.map((formula) => <option value={formula.id} key={formula.id}>{formula.name}</option>)}</select></div>)}</div><h3>Shared ingredients</h3>{diff.shared.length ? <ul className="ingredient-list">{diff.shared.map((ingredient) => <li className="ingredient" key={ingredient}>{ingredient}</li>)}</ul> : <p>No ingredient is shared by all selected formulas.</p>}<div className="diff-grid">{diff.unique.map(({ formula, ingredients }) => <article className="diff-card" key={formula.id}><button className="formula-card" onClick={() => onOpen(formula.id)}><strong>{formula.name}</strong><small>{formula.family}</small></button><h4>Distinct here</h4><ul className="ingredient-list">{ingredients.map((ingredient) => <li className="ingredient unique" key={ingredient}>{ingredient}</li>)}</ul></article>)}</div></section></>;
}
