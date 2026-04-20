import { useState } from "react";

import ActivationRipple from "../components/ActivationRipple";
import CosmicGraph from "../components/CosmicGraph";
import DocumentLegend from "../components/DocumentLegend";
import GraphStats from "../components/GraphStats";
import KnowledgePanel from "../components/KnowledgePanel";
import NodeInspector from "../components/NodeInspector";
import ProcessingOrb from "../components/ProcessingOrb";
import QueryInterface from "../components/QueryInterface";
import useGraphData from "../hooks/useGraphData";

export default function GraphPage({ graphData, onReset }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activatedNodes, setActivatedNodes] = useState([]);
  const [rippleActive, setRippleActive] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [stepText, setStepText] = useState("");
  const { topNodes, relationCounts, graphInsights } = useGraphData(graphData);

  const handleQueryState = ({ loading, answer }) => {
    if (typeof loading === "boolean") {
      setQueryLoading(loading);
      setStepText(loading ? "Traversing graph..." : "");
    }
    if (answer?.activated_nodes?.length) {
      setRippleActive(true);
      setTimeout(() => setRippleActive(false), 1300);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div className="synapse-fade-in" style={{ position: "absolute", inset: 0, zIndex: 5 }}>
        <CosmicGraph graphData={graphData} activatedNodes={activatedNodes} onNodeClick={setSelectedNode} />
      </div>
      <ActivationRipple active={rippleActive} />
      <div className="synapse-panel-enter-1">
        <GraphStats stats={graphData?.stats} documents={graphData?.documents} />
      </div>
      <NodeInspector node={selectedNode} graphData={graphData} onClose={() => setSelectedNode(null)} />
      <div className="synapse-panel-enter-2">
        <KnowledgePanel topNodes={topNodes} relationCounts={relationCounts} graphInsights={graphInsights} />
      </div>
      <div className="synapse-panel-enter-3">
        <DocumentLegend documents={graphData?.documents} />
      </div>
      <div className="synapse-panel-enter-4">
        <QueryInterface hasGraph={!!graphData?.nodes?.length} onActivateNodes={setActivatedNodes} onQueryStateChange={handleQueryState} />
      </div>
      <ProcessingOrb visible={queryLoading} currentStep={stepText} />
      <button
        onClick={onReset}
        style={{ position: "absolute", top: 16, right: 16, zIndex: 20, border: "1px solid var(--border)", background: "rgba(8,8,22,0.9)", color: "var(--text)", borderRadius: 8, padding: "8px 10px" }}
      >
        New Graph
      </button>
    </div>
  );
}
