import { useState } from "react";
import { queryGraph } from "../services/api";

export default function QueryInterface({ hasGraph, onActivateNodes, onQueryStateChange }) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const BUSINESS_SUMMARY_PROMPT =
    "Create an executive business summary from this graph: provide 5 key insights, 3 risks, 3 opportunities, and a 30-60-90 day action plan. Reference the most central entities and relationships.";
  const examples = [
    "How do the key entities connect across documents?",
    "What are the strongest relationships in this graph?",
    "Summarize the most important cross-document insights.",
  ];

  const askQuestion = async (questionText) => {
    if (!questionText.trim() || !hasGraph || loading) return;
    setLoading(true);
    onQueryStateChange?.({ loading: true, answer: null });
    try {
      const result = await queryGraph(questionText);
      setAnswer(result.answer || "");
      onActivateNodes?.(result.activated_nodes || []);
      onQueryStateChange?.({ loading: false, answer: result });
    } finally {
      setLoading(false);
      onQueryStateChange?.({ loading: false });
    }
  };

  const ask = async () => askQuestion(query);

  return (
    <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "min(840px, 94vw)", zIndex: 20 }}>
      {answer ? (
        <div className="card synapse-glow-border" style={{ marginBottom: 10 }}>
          <div style={{ color: "var(--gold)", fontSize: 11, marginBottom: 6, letterSpacing: 2 }}>SYNAPSE ANSWER</div>
          <p style={{ lineHeight: 1.8, fontFamily: "Exo 2, sans-serif", fontSize: 14 }}>{answer}</p>
        </div>
      ) : null}
      {!answer && hasGraph ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {examples.map((text) => (
            <button
              key={text}
              onClick={() => setQuery(text)}
              style={{ border: "1px solid var(--border)", background: "rgba(8,8,22,0.85)", color: "var(--muted)", borderRadius: 999, padding: "4px 10px", fontSize: 11 }}
            >
              {text.slice(0, 42)}...
            </button>
          ))}
          <button
            onClick={() => askQuestion(BUSINESS_SUMMARY_PROMPT)}
            disabled={loading}
            style={{
              border: "1px solid rgba(245,158,11,0.45)",
              background: "rgba(245,158,11,0.1)",
              color: "var(--gold)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Business Summary
          </button>
        </div>
      ) : null}
      <div className="card synapse-glow-border" style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder={hasGraph ? "Ask anything about your graph..." : "Upload docs to enable questions"}
          disabled={!hasGraph || loading}
          style={{ flex: 1, background: "transparent", border: "none", color: "var(--text)", outline: "none" }}
        />
        <button
          onClick={ask}
          disabled={!hasGraph || loading}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
}
