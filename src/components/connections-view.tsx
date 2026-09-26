"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { catalog, connectedFormula, relationLabel, relationsFor } from "@/lib/catalog";

const ConnectionGraph = dynamic(() => import("./connection-graph").then((module) => module.ConnectionGraph), { ssr: false, loading: () => <div className="graph-wrap empty">Loading relationship map…</div> });

export function ConnectionsView({ initialFormulaId, onOpen }: { initialFormulaId?: string; onOpen: (id: string) => void }) {
  const [focus, setFocus] = useState(initialFormulaId ?? "liu-wei-di-huang-wan");
  const relations = useMemo(() => relationsFor(focus), [focus]);
  return <><div className="section-head"><div><h2>Formula Connections</h2><p>A focused one-hop map. Every edge distinguishes explicit source statements from computed ingredient-set evidence.</p></div></div><section className="panel"><div className="select-card" style={{ maxWidth: 440, marginBottom: 12 }}><label htmlFor="focus-formula">Focus formula</label><select id="focus-formula" value={focus} onChange={(event) => setFocus(event.target.value)}>{catalog.formulas.map((formula) => <option value={formula.id} key={formula.id}>{formula.name}</option>)}</select></div><ConnectionGraph focusId={focus} relations={relations} onFocus={setFocus} /><div className="accessible-relations"><h3>Accessible relationship list</h3>{relations.length ? relations.map((relation) => { const formula = connectedFormula(relation, focus); return formula && <div className="relationship" key={relation.id}><button onClick={() => setFocus(formula.id)}>{formula.name}</button> <small>— {relationLabel(relation.type)} · {relation.evidence.kind}</small><p>{relation.evidence.summary}</p><button className="filter" onClick={() => onOpen(formula.id)}>Open details</button></div>; }) : <p>No reviewed connection for this formula.</p>}</div></section></>;
}
