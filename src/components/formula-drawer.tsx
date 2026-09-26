"use client";

import { useEffect } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, X } from "lucide-react";
import { connectedFormula, relationLabel, relationsFor } from "@/lib/catalog";
import type { Formula } from "@/types/catalog";

export function FormulaDrawer({ formula, bookmarked, onBookmark, onClose, onOpen }: { formula: Formula; bookmarked: boolean; onBookmark: () => void; onClose: () => void; onOpen: (id: string) => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [onClose]);
  const relations = relationsFor(formula.id);
  const contains = relations.filter((item) => item.from === formula.id && (item.type === "contains_formula" || item.type === "combination_of"));
  const appearsIn = relations.filter((item) => item.to === formula.id);

  return <><div className="drawer-backdrop" onClick={onClose} /><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="formula-title">
    <header className="drawer-head"><div><small>{formula.category} · {formula.family}</small><h2 id="formula-title">{formula.name}</h2></div><div style={{ display: "flex", gap: 8 }}><button className="icon-button" onClick={onBookmark} aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}>{bookmarked ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}</button><button className="icon-button" onClick={onClose} aria-label="Close formula"><X size={21} /></button></div></header>
    <div className="drawer-body">
      {formula.aliases.length > 0 && <section className="drawer-section"><h3>Source aliases</h3><p>{formula.aliases.join(" · ")}</p></section>}
      <section className="drawer-section"><h3>Ingredients</h3>{formula.ingredients.length ? <ul className="ingredient-list">{formula.ingredients.map((ingredient) => <li className="ingredient" key={ingredient}>{ingredient}</li>)}</ul> : <p>Ingredient normalization is pending. The source name and locator are retained below.</p>}<p><small>Exam count: {formula.examHerbCount ?? "not assigned"} · normalized entries: {formula.ingredientCount}</small></p></section>
      <section className="drawer-section"><h3>Traumatology context & stage</h3><div className="tag-row">{formula.contexts.map((context) => <span className="tag" key={context}>{context}</span>)}</div></section>
      <section className="drawer-section"><h3>Formulas contained here</h3>{contains.length ? contains.map((relation) => { const other = connectedFormula(relation, formula.id); return other && <div className="relationship" key={relation.id}><button onClick={() => onOpen(other.id)}>{other.name} <ExternalLink size={12} /></button><div><small>{relationLabel(relation.type)} · {relation.evidence.kind}</small></div><p>{relation.evidence.summary}</p>{relation.addedHerbs?.length ? <p><strong>Added:</strong> {relation.addedHerbs.join(", ")}</p> : null}<small>Evidence: {relation.evidence.sourceReferences.map((ref) => `${ref.sourceId} ${ref.locator.kind} ${ref.locator.index}`).join(" · ")}</small></div>; }) : <p>No reviewed contained formula is recorded.</p>}</section>
      <section className="drawer-section"><h3>Appears inside / family progression</h3>{appearsIn.length ? appearsIn.map((relation) => { const other = connectedFormula(relation, formula.id); return other && <div className="relationship" key={relation.id}><button onClick={() => onOpen(other.id)}>{other.name}</button><div><small>{relationLabel(relation.type)} · {relation.evidence.kind}</small></div>{relation.addedHerbs?.length ? <p><strong>Added:</strong> {relation.addedHerbs.join(", ")}</p> : null}{relation.removedHerbs?.length ? <p><strong>Removed/substituted:</strong> {relation.removedHerbs.join(", ")}</p> : null}<small>Evidence: {relation.evidence.sourceReferences.map((ref) => `${ref.sourceId} ${ref.locator.kind} ${ref.locator.index}`).join(" · ")}</small></div>; }) : <p>No parent progression is currently recorded.</p>}</section>
      <section className="drawer-section"><h3>Source evidence</h3><p><span className={`tag ${formula.reviewStatus === "pending" ? "pending" : ""}`}>{formula.reviewStatus}</span> Statements below are educational excerpts, not prescribing directions.</p>{formula.sourceReferences.map((source) => <div className="source" key={source.recordId}><code>{source.sourceId} · {source.locator.kind} {source.locator.index}</code><p>{source.text}</p></div>)}</section>
    </div>
  </aside></>;
}
