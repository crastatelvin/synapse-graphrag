# ============================================
# Project: SYNAPSE — GraphRAG Knowledge Engine
# Author: Telvin Crasta
# GitHub: github.com/yourhandle
# License: CC BY-NC 4.0
# Original design and architecture by Telvin Crasta
# ============================================

from groq_service import get_embedding
from graph_store import graph, search_chunks


def find_relevant_nodes(query: str, top_k: int = 10) -> list[dict]:
    query_lower = query.lower()
    scored_nodes = []

    for node_id, node in graph["nodes"].items():
        score = 0
        label_lower = node["label"].lower()

        if label_lower in query_lower:
            score += 10
        elif any(word in query_lower for word in label_lower.split()):
            score += 5
        score += node.get("connections", 0) * 0.5
        score += node.get("weight", 1) * 0.3

        if score > 0:
            scored_nodes.append((node_id, score))

    scored_nodes.sort(key=lambda x: x[1], reverse=True)
    return [graph["nodes"][nid] for nid, _ in scored_nodes[:top_k]]


def get_node_neighborhood(node_id: str, depth: int = 2) -> dict:
    visited = set()
    result_nodes = {}
    result_edges = []

    def traverse(current_id, current_depth):
        if current_depth > depth or current_id in visited:
            return
        visited.add(current_id)

        if current_id in graph["nodes"]:
            result_nodes[current_id] = graph["nodes"][current_id]

        for edge in graph["edges"]:
            if edge["source"] == current_id or edge["target"] == current_id:
                result_edges.append(edge)
                next_id = edge["target"] if edge["source"] == current_id else edge["source"]
                traverse(next_id, current_depth + 1)

    traverse(node_id, 0)
    return {"nodes": list(result_nodes.values()), "edges": result_edges}


def retrieve_for_query(query: str) -> dict:
    try:
        query_embedding = get_embedding(query)
        chunks = search_chunks(query_embedding, n_results=5)
    except Exception:
        chunks = []

    relevant_nodes = find_relevant_nodes(query)
    subgraph_edges = []

    for node in relevant_nodes[:5]:
        neighborhood = get_node_neighborhood(node["id"], depth=1)
        subgraph_edges.extend(neighborhood["edges"])

    context_parts = []
    if chunks:
        context_parts.append("RELEVANT PASSAGES:\n" + "\n---\n".join(c["text"] for c in chunks))

    if relevant_nodes:
        node_context = "KEY ENTITIES AND CONCEPTS:\n" + "\n".join(
            f"- {n['label']} ({n['type']}): connected to {n['connections']} other nodes" for n in relevant_nodes[:10]
        )
        context_parts.append(node_context)

    if subgraph_edges:
        rel_context = "RELATIONSHIPS:\n" + "\n".join(
            f"- {e['source']} {e['relation']} {e['target']}: {e.get('context', '')[:100]}" for e in subgraph_edges[:10]
        )
        context_parts.append(rel_context)

    return {"context": "\n\n".join(context_parts), "relevant_nodes": [n["id"] for n in relevant_nodes], "chunks": chunks}
