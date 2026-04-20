export default function NodeInspector({ node, graphData, onClose }) {
  if (!node) return null;

  const nodeMap = new Map((graphData?.nodes || []).map((n) => [n.id, n]));
  const connected =
    graphData?.edges
      ?.filter((e) => e.source === node.id || e.target === node.id)
      ?.map((e) => {
        const neighborId = e.source === node.id ? e.target : e.source;
        return {
          id: neighborId,
          label: nodeMap.get(neighborId)?.label || neighborId,
          relation: e.relation,
          context: e.context || "",
        };
      })
      ?.slice(0, 8) || [];

  return (
    <div style={{ position: "absolute", top: 16, right: 16, width: 320, zIndex: 20 }} className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="exo" style={{ fontWeight: 700 }}>
            {node.label}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>{node.type}</div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--muted)" }}>
          x
        </button>
      </div>
      <div style={{ marginTop: 12, fontSize: 13 }}>Connections: {node.connections || 0}</div>
      <div style={{ marginTop: 8, color: "var(--cyan)", fontSize: 12 }}>Linked Evidence</div>
      {connected.map((item) => (
        <div key={`${item.id}-${item.relation}`} style={{ fontSize: 12, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(99,102,241,0.15)" }}>
          <div style={{ color: "var(--text)" }}>
            {item.label} <span style={{ color: "var(--cyan)" }}>({item.relation})</span>
          </div>
          {item.context ? (
            <div style={{ color: "var(--muted)", marginTop: 4, lineHeight: 1.35 }}>
              {item.context.slice(0, 120)}
              {item.context.length > 120 ? "..." : ""}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
