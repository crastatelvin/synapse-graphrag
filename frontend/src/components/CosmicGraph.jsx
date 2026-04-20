import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function CosmicGraph({ graphData, activatedNodes, onNodeClick }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graphData?.nodes?.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "node-glow");
    glow.append("feGaussianBlur").attr("stdDeviation", "3.2").attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    const nodes = graphData.nodes.map((n) => ({ ...n }));
    const valid = new Set(nodes.map((n) => n.id));
    const links = graphData.edges
      .filter((e) => valid.has(e.source) && valid.has(e.target))
      .map((e) => ({ ...e }));

    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(95))
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d) => 10 + (d.connections || 0)));

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(99,102,241,0.25)")
      .attr("stroke-width", (d) => Math.min(2.2, 0.8 + (d.weight || 1) * 0.35))
      .attr("stroke-dasharray", "5 4")
      .attr("style", "animation: synapse-flow 10s linear infinite;");

    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (_, d) => onNodeClick?.(d));

    const outerNode = node
      .append("circle")
      .attr("r", (d) => 6 + Math.min((d.connections || 0) * 1.4, 12))
      .attr("fill", (d) => (activatedNodes?.includes(d.id) ? "#f59e0b" : d.color))
      .attr("fill-opacity", 0.65)
      .attr("stroke", "#fff")
      .attr("stroke-opacity", 0.25)
      .attr("filter", "url(#node-glow)")
      .attr("style", "animation: synapse-node-pulse 2.2s ease-in-out infinite;");

    const coreNode = node
      .append("circle")
      .attr("r", (d) => 2.2 + Math.min((d.connections || 0) * 0.35, 3.5))
      .attr("fill", (d) => d.color)
      .attr("fill-opacity", 0.95);

    node
      .append("text")
      .attr("x", 10)
      .attr("y", 4)
      .attr("font-size", 9.5)
      .attr("font-family", "Exo 2")
      .attr("fill", "rgba(226,232,240,0.85)")
      .text((d) => (d.label.length > 20 ? `${d.label.slice(0, 20)}…` : d.label));

    node
      .on("mouseenter", function () {
        d3.select(this)
          .raise()
          .select("text")
          .transition()
          .duration(120)
          .attr("fill", "rgba(255,255,255,0.98)")
          .attr("font-size", 10.3);
        d3.select(this)
          .selectAll("circle")
          .transition()
          .duration(120)
          .attr("stroke-opacity", 0.5);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .select("text")
          .transition()
          .duration(150)
          .attr("fill", "rgba(226,232,240,0.85)")
          .attr("font-size", 9.5);
        d3.select(this)
          .selectAll("circle")
          .transition()
          .duration(150)
          .attr("stroke-opacity", 0.25);
      });

    outerNode
      .transition()
      .duration(500)
      .attr("fill-opacity", 0.72);

    coreNode
      .transition()
      .duration(500)
      .attr("r", (d) => 2.5 + Math.min((d.connections || 0) * 0.4, 4));

    sim.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [graphData, activatedNodes, onNodeClick]);

  return <svg ref={svgRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 5 }} />;
}
