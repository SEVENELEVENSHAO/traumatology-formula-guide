"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MarkerType, type Edge, type Node, type NodeMouseHandler } from "@xyflow/react";
import dagre from "dagre";
import { formulaById, relationLabel } from "@/lib/catalog";
import type { FormulaRelationship } from "@/types/catalog";

function layout(nodes: Node[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 34, ranksep: 95 });
  nodes.forEach((node) => graph.setNode(node.id, { width: 190, height: 62 }));
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);
  return nodes.map((node) => { const point = graph.node(node.id); return { ...node, position: { x: point.x - 95, y: point.y - 31 } }; });
}

export function ConnectionGraph({ focusId, relations, onFocus }: { focusId: string; relations: FormulaRelationship[]; onFocus: (id: string) => void }) {
  const { nodes, edges } = useMemo(() => {
    const ids = new Set([focusId]); relations.forEach((relation) => { ids.add(relation.from); ids.add(relation.to); });
    const rawNodes: Node[] = [...ids].map((id) => ({ id, position: { x: 0, y: 0 }, data: { label: formulaById.get(id)?.name ?? id }, style: { width: 190, minHeight: 62, border: "2px solid #1f2a25", borderRadius: 14, background: id === focusId ? "#eadc9e" : "#fffdf7", fontFamily: "Georgia, serif", fontWeight: 700, boxShadow: "3px 3px 0 #a99e88" } }));
    const rawEdges: Edge[] = relations.map((relation) => ({ id: relation.id, source: relation.from, target: relation.to, label: `${relationLabel(relation.type)} · ${relation.evidence.kind}`, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: relation.evidence.kind === "explicit" ? "#3e725e" : "#8a6947", strokeWidth: 2 }, labelStyle: { fontSize: 10, fill: "#17201d" }, labelBgStyle: { fill: "#f3efe5", fillOpacity: .92 } }));
    return { nodes: layout(rawNodes, rawEdges), edges: rawEdges };
  }, [focusId, relations]);
  const handleNodeClick: NodeMouseHandler = (_, node) => onFocus(node.id);
  return <div className="graph-wrap" aria-label="Formula relationship map"><ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.35} maxZoom={1.5} onNodeClick={handleNodeClick} nodesDraggable={false} nodesConnectable={false} elementsSelectable><Background color="#b8ad98" gap={22} /><Controls showInteractive={false} /></ReactFlow></div>;
}
