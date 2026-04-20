export default function ActivationRipple({ active }) {
  if (!active) return null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none", display: "grid", placeItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 120 + i * 100,
            height: 120 + i * 100,
            borderRadius: "50%",
            border: "1px solid rgba(245,158,11,0.3)",
            animation: `synapse-ripple 1.3s ${i * 0.2}s ease-out`,
          }}
        />
      ))}
    </div>
  );
}
