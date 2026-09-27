"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronRight } from "lucide-react";
import type { Formula } from "@/types/catalog";

const FAMILY_ORDER = ["Small formulas", "Gui Zhi Tang family", "Ma Huang Tang family", "Si Jun Zi Tang family", "Si Wu Tang family", "Qi and blood combinations", "Er Chen Tang family", "Liu Wei Di Huang Wan family", "Chai Hu family", "Xiao Chai Hu Tang family", "Zeng Ye family", "Blood stasis formulas", "Wind-damp formulas", "Damp-heat formulas", "Nodule formulas", "Topical traumatology formulas"];

export function LibraryView({ formulas, query, onOpen, bookmarks, onBookmark }: { formulas: Formula[]; query: string; onOpen: (formula: Formula) => void; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const [filter, setFilter] = useState("All families");
  const [openFamily, setOpenFamily] = useState<string | null>("Si Wu Tang family");
  const filters = ["All families", "Exam formulas", "Bookmarked", "2–5 herbs", "6–8 herbs", "9+ herbs", "Topical"];
  const visible = useMemo(() => formulas.filter((formula) => {
    if (filter === "Exam formulas") return formula.exam;
    if (filter === "Bookmarked") return bookmarks.includes(formula.id);
    const count = formula.examHerbCount ?? formula.ingredientCount;
    if (filter === "2–5 herbs") return count >= 2 && count <= 5;
    if (filter === "6–8 herbs") return count >= 6 && count <= 8;
    if (filter === "9+ herbs") return count >= 9;
    if (filter === "Topical") return formula.family === "Topical traumatology formulas";
    return true;
  }), [formulas, filter, bookmarks]);
  const groups = useMemo(() => Object.entries(visible.reduce<Record<string, Formula[]>>((all, formula) => { (all[formula.family] ??= []).push(formula); return all; }, {}))
    .map(([family, items]) => [family, items.sort((a, b) => ((a.examHerbCount ?? a.ingredientCount) || 99) - ((b.examHerbCount ?? b.ingredientCount) || 99) || a.name.localeCompare(b.name))] as const)
    .sort(([a], [b]) => {
      const ai = FAMILY_ORDER.indexOf(a); const bi = FAMILY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1; if (bi === -1) return -1; return ai - bi;
    }), [visible]);
  const familyCount = new Set(formulas.map((formula) => formula.family)).size;

  return <>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">Formula architecture, made visible</p><h2>Learn the family, not just the list.</h2><p>Start with a base formula, then follow what is added, removed, combined, or substituted across its family.</p></div><div className="hero-stats"><div className="hero-stat"><strong>22</strong><span>exam formulas</span></div><div className="hero-stat"><strong>{visible.length}</strong><span>formulas shown</span></div><div className="hero-stat"><strong>{familyCount}</strong><span>formula families shown</span></div></div></section>
    <div className="section-head"><div><h2>Formula Families</h2><p>{query ? `Results for “${query}”, grouped by family.` : "Browse complete families from smaller base formulas toward larger progressions."}</p></div></div>
    <div className="filters" aria-label="Formula filters">{filters.map((item) => <button key={item} className={`filter ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="category-grid">{groups.length ? groups.map(([family, items]) => {
      const open = openFamily === family;
      const examCount = items.filter((formula) => formula.exam).length;
      const knownCounts = items.map((formula) => formula.examHerbCount ?? formula.ingredientCount).filter(Boolean);
      const countRange = knownCounts.length ? `${Math.min(...knownCounts)}${Math.min(...knownCounts) === Math.max(...knownCounts) ? "" : `–${Math.max(...knownCounts)}`} herbs` : "count pending";
      return <section className="category" key={family}><button className="category-toggle" aria-expanded={open} onClick={() => setOpenFamily(open ? null : family)}><span><strong>{family}</strong><small className="family-meta">{items.length} formulas · {examCount} exam · {countRange}</small></span>{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>{open && <div className="category-content">{items.map((formula, index) => <div key={formula.id} className="formula-card" role="button" tabIndex={0} onClick={() => onOpen(formula)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(formula); }}><span className="formula-order" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{formula.name}</strong><small>{formula.category}{formula.exam ? " · final exam" : ""}</small><div className="tag-row"><span className="tag">{(formula.examHerbCount ?? formula.ingredientCount) || "?"} herbs</span><span className={`tag ${formula.reviewStatus === "pending" ? "pending" : ""}`}>{formula.reviewStatus}</span><button className="icon-button" style={{ width: 28, height: 28, marginLeft: "auto" }} aria-label={`${bookmarks.includes(formula.id) ? "Remove" : "Add"} bookmark for ${formula.name}`} onClick={(event) => { event.stopPropagation(); onBookmark(formula.id); }}>{bookmarks.includes(formula.id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}</button></div></div>)}</div>}</section>;
    }) : <div className="empty">No formulas match these filters.</div>}</div>
  </>;
}
