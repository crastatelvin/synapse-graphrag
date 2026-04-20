export default function ProcessingOrb({ visible, currentStep }) {
  if (!visible) return null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.25)" }}>
      <div className="card" style={{ textAlign: "center", width: 320 }}>
        <div style={{ margin: "0 auto 10px", width: 54, height: 54, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "var(--indigo)", animation: "synapse-spin 1s linear infinite" }} />
        <div className="exo" style={{ fontWeight: 700, color: "var(--indigo)" }}>
          Building Knowledge Graph
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>{currentStep || "Processing documents..."}</div>
      </div>
    </div>
  );
}
