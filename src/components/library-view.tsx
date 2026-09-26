"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronRight } from "lucide-react";
import type { Formula } from "@/types/catalog";

export function LibraryView({ formulas, query, onOpen, bookmarks, onBookmark }: { formulas: Formula[]; query: string; onOpen: (formula: Formula) => void; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const [filter, setFilter] = useState("Exam formulas");
  const [openCategory, setOpenCategory] = useState<string | null>("2 herbs");
  const filters = ["Exam formulas", "All formulas", "Bookmarked", "Blood stasis", "Late healing"];
  const visible = useMemo(() => formulas.filter((formula) => {
    if (filter === "Exam formulas") return formula.exam;
    if (filter === "Bookmarked") return bookmarks.includes(formula.id);
    if (filter === "Blood stasis") return formula.contexts.some((item) => item.toLowerCase().includes("blood stasis"));
    if (filter === "Late healing") return formula.contexts.some((item) => item.toLowerCase().includes("late"));
    return true;
  }), [formulas, filter, bookmarks]);
  const groups = useMemo(() => Object.entries(visible.reduce<Record<string, Formula[]>>((all, formula) => { (all[formula.category] ??= []).push(formula); return all; }, {})).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })), [visible]);

  return <>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">Formula architecture, made visible</p><h2>Learn the family, not just the list.</h2><p>Trace base formulas, contained formulas, added herbs, substitutions, and source evidence from the exam notes and traumatology lecture.</p></div><div className="hero-stats"><div className="hero-stat"><strong>22</strong><span>exam formulas</span></div><div className="hero-stat"><strong>{visible.length}</strong><span>shown now</span></div><div className="hero-stat"><strong>3</strong><span>hashed source documents</span></div></div></section>
    <div className="section-head"><div><h2>Formula Library</h2><p>{query ? `Results for “${query}”` : "Browse by exam herb count and formula family."}</p></div></div>
    <div className="filters" aria-label="Formula filters">{filters.map((item) => <button key={item} className={`filter ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="category-grid">{groups.length ? groups.map(([category, items]) => {
      const open = openCategory === category;
      return <section className="category" key={category}><button className="category-toggle" aria-expanded={open} onClick={() => setOpenCategory(open ? null : category)}><span>{category} <small>({items.length})</small></span>{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>{open && <div className="category-content">{items.map((formula) => <div key={formula.id} className="formula-card" role="button" tabIndex={0} onClick={() => onOpen(formula)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(formula); }}><strong>{formula.name}</strong><small>{formula.family}</small><div className="tag-row"><span className="tag">{formula.examHerbCount ?? formula.ingredientCount} herbs</span><span className={`tag ${formula.reviewStatus === "pending" ? "pending" : ""}`}>{formula.reviewStatus}</span><button className="icon-button" style={{ width: 28, height: 28, marginLeft: "auto" }} aria-label={`${bookmarks.includes(formula.id) ? "Remove" : "Add"} bookmark for ${formula.name}`} onClick={(event) => { event.stopPropagation(); onBookmark(formula.id); }}>{bookmarks.includes(formula.id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}</button></div></div>)}</div>}</section>;
    }) : <div className="empty">No formulas match these filters.</div>}</div>
  </>;
}
