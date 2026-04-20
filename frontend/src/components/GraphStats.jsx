export default function GraphStats({ stats, documents }) {
  const docCount = documents ? Object.keys(documents).length : 0;
  return (
    <div className="card" style={{ position: "absolute", top: 16, left: 16, width: 220, zIndex: 20 }}>
      <div className="exo" style={{ fontWeight: 800, marginBottom: 8 }}>
        SYNAPSE
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>Nodes: {stats?.node_count || 0}</div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>Edges: {stats?.edge_count || 0}</div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>Docs: {docCount}</div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>Types: {stats?.cluster_count || 0}</div>
    </div>
  );
}
