export default function DocumentLegend({ documents }) {
  const docs = Object.entries(documents || {});
  if (!docs.length) return null;

  return (
    <div className="card" style={{ position: "absolute", right: 16, bottom: 90, width: 240, zIndex: 20 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>DOCUMENT LEGEND</div>
      {docs.map(([id, doc]) => (
        <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: doc.color, boxShadow: `0 0 6px ${doc.color}`, flexShrink: 0 }} />
          <span style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{doc.name}</span>
        </div>
      ))}
    </div>
  );
}
