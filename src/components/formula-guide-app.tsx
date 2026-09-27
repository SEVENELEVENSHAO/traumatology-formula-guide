"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Bookmark, GitFork, GraduationCap, Library, Search, Sparkles } from "lucide-react";
import { formulaById, searchFormulas } from "@/lib/catalog";
import type { Formula } from "@/types/catalog";
import { LibraryView } from "./library-view";
import { ConnectionsView } from "./connections-view";
import { CompareView } from "./compare-view";
import { StudyView } from "./study-view";
import { FormulaDrawer } from "./formula-drawer";

type View = "library" | "connections" | "compare" | "study";
const navigation = [
  { id: "library" as const, label: "Formula Library", icon: Library },
  { id: "connections" as const, label: "Connections", icon: GitFork },
  { id: "compare" as const, label: "Compare", icon: BookOpen },
  { id: "study" as const, label: "Study", icon: GraduationCap },
];

export function FormulaGuideApp() {
  const [view, setView] = useState<View>("library");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Formula | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("tfg-bookmarks");
    if (saved) setBookmarks(JSON.parse(saved));
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch(() => undefined);
    }
  }, []);

  const results = useMemo(() => searchFormulas(query), [query]);
  const toggleBookmark = (id: string) => {
    setBookmarks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("tfg-bookmarks", JSON.stringify(next));
      return next;
    });
  };
  const openById = (id: string) => {
    const formula = formulaById.get(id);
    if (formula) {
      setSelected(formula);
      localStorage.setItem("tfg-recent", id);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Sparkles size={21} /></span><div><h1>Traumatology<br />Formula Guide</h1><small>formula-first learning</small></div></div>
        <nav className="nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-button ${view === id ? "active" : ""}`} onClick={() => setView(id)}><Icon size={19} />{label}</button>)}
        </nav>
        <p className="sidebar-note"><Bookmark size={14} /> {bookmarks.length} saved<br /><br />Source-attributed educational content. Formula details may be pending review.</p>
      </aside>

      <main className="main">
        <div className="topbar"><label className="search"><Search size={20} /><span className="sr-only">Search formulas</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, aliases, herbs, contexts, or source text…" /></label></div>
        {view === "library" && <LibraryView formulas={results} query={query} onOpen={setSelected} bookmarks={bookmarks} onBookmark={toggleBookmark} />}
        {view === "connections" && <ConnectionsView initialFormulaId={selected?.id} onOpen={openById} />}
        {view === "compare" && <CompareView onOpen={openById} />}
        {view === "study" && <StudyView onOpen={openById} />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon size={18} />{label.replace("Formula ", "")}</button>)}
      </nav>
      <div className="notice" role="note"><strong>Study use only.</strong> This app presents attributed course material and is not diagnostic or prescribing guidance.</div>
      {selected && <FormulaDrawer formula={selected} bookmarked={bookmarks.includes(selected.id)} onBookmark={() => toggleBookmark(selected.id)} onClose={() => setSelected(null)} onOpen={openById} />}
    </div>
  );
}
