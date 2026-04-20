import { useMemo } from "react";

export default function useGraphData(graphData) {
  const nodeMap = useMemo(() => {
    const map = new Map();
    (graphData?.nodes || []).forEach((node) => map.set(node.id, node));
    return map;
  }, [graphData]);

  const topNodes = useMemo(() => {
    return [...(graphData?.nodes || [])]
      .sort((a, b) => (b.connections || 0) - (a.connections || 0))
      .slice(0, 10);
  }, [graphData]);

  const relationCounts = useMemo(() => {
    const counts = {};
    (graphData?.edges || []).forEach((edge) => {
      counts[edge.relation] = (counts[edge.relation] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [graphData]);

  const graphInsights = useMemo(() => {
    const nodeCount = graphData?.stats?.node_count || 0;
    const edgeCount = graphData?.stats?.edge_count || 0;
    const docCount = graphData?.stats?.doc_count || 0;
    const density = nodeCount > 1 ? (edgeCount / (nodeCount * (nodeCount - 1))).toFixed(3) : "0.000";
    const strongestNode = topNodes[0]?.label || "None";
    const strongestRelation = relationCounts[0]?.[0] || "None";
    return [
      `Coverage: ${docCount} doc(s), ${nodeCount} entities/concepts, ${edgeCount} links.`,
      `Most central node right now: ${strongestNode}.`,
      `Most common relation type: ${strongestRelation}.`,
      `Graph density is ${density}; upload more docs for richer cross-links.`,
    ];
  }, [graphData, topNodes, relationCounts]);

  return { nodeMap, topNodes, relationCounts, graphInsights };
}
