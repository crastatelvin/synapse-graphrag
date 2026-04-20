import { useEffect, useState } from "react";
import { uploadDocuments } from "../services/api";
import useWebSocket from "../hooks/useWebSocket";

export default function DocumentUpload({ onGraphReady }) {
  const { connected, lastEvent } = useWebSocket(true);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (lastEvent?.message) {
      setProgress(lastEvent.message);
    }
  }, [lastEvent]);

  const onPick = (picked) => {
    const valid = Array.from(picked).filter((f) => f.name.endsWith(".pdf") || f.name.endsWith(".txt"));
    setFiles(valid.slice(0, 5));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    setError("");

    try {
      const result = await uploadDocuments(files);
      onGraphReady(result);
    } catch {
      setError("Upload failed. Make sure backend is running.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, position: "relative", zIndex: 10 }}>
      <div className="card synapse-glow-border" style={{ width: "min(700px, 94vw)" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "var(--indigo)", marginBottom: 8 }}>GRAPHRAG KNOWLEDGE ENGINE</div>
        <div className="exo" style={{ fontSize: 52, fontWeight: 800, letterSpacing: 3, lineHeight: 1 }}>
          <span>SYN</span>
          <span style={{ color: "var(--indigo)" }}>APSE</span>
        </div>
        <p style={{ margin: "10px 0 20px", color: "var(--muted)", fontSize: 15 }}>
          Upload documents and watch your knowledge become a living neural universe.
        </p>
        <input type="file" accept=".pdf,.txt" multiple onChange={(e) => onPick(e.target.files)} />
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
          {files.length ? `${files.length} files selected` : "Choose up to 5 files"}
        </div>
        <button
          onClick={handleUpload}
          disabled={!files.length || loading}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            border: "none",
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: "0 0 24px rgba(99,102,241,0.35)",
          }}
        >
          {loading ? "Building Graph..." : "Build Neural Graph"}
        </button>
        {progress ? <div style={{ marginTop: 12, color: "var(--cyan)", fontSize: 13 }}>{progress}</div> : null}
        {!progress && lastEvent?.message ? <div style={{ marginTop: 12, color: "var(--cyan)", fontSize: 13 }}>{lastEvent.message}</div> : null}
        <div style={{ marginTop: 8, color: connected ? "var(--cyan)" : "var(--muted)", fontSize: 11 }}>
          Live updates: {connected ? "connected" : "offline"}
        </div>
        {error ? <div style={{ marginTop: 8, color: "#ef4444", fontSize: 13 }}>{error}</div> : null}
      </div>
    </div>
  );
}
