export default function KnowledgePanel({ topNodes, relationCounts, graphInsights }) {
  return (
    <div className="card" style={{ position: "absolute", left: 16, bottom: 16, zIndex: 20, width: 280, maxHeight: 300, overflow: "auto" }}>
      <div style={{ fontSize: 11, color: "var(--gold)", marginBottom: 6 }}>USEFUL INSIGHTS</div>
      {(graphInsights || []).slice(0, 3).map((insight, idx) => (
        <div key={idx} style={{ fontSize: 11.5, marginBottom: 6, color: "var(--text)", lineHeight: 1.45 }}>
          {insight}
        </div>
      ))}

      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>HIGH-IMPORTANCE NODES</div>
      {(topNodes || []).slice(0, 6).map((node) => (
        <div key={node.id} style={{ fontSize: 12, marginBottom: 5, color: "var(--text)" }}>
          {node.label} <span style={{ color: "var(--muted)" }}>({node.connections || 0})</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "var(--muted)", margin: "10px 0 6px" }}>RELATIONSHIPS</div>
      {(relationCounts || []).slice(0, 6).map(([relation, count]) => (
        <div key={relation} style={{ fontSize: 12, marginBottom: 5, color: "var(--cyan)" }}>
          {relation}: <span style={{ color: "var(--text)" }}>{count}</span>
        </div>
      ))}
    </div>
  );
}
