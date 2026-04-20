# ============================================
# Project: SYNAPSE — GraphRAG Knowledge Engine
# Author: Telvin Crasta
# GitHub: github.com/yourhandle
# License: CC BY-NC 4.0
# Original design and architecture by Telvin Crasta
# ============================================

import chromadb
from chromadb.config import Settings

graph = {"nodes": {}, "edges": [], "documents": {}}

chroma_client = chromadb.Client(Settings(anonymized_telemetry=False))
collection = chroma_client.get_or_create_collection("synapse_chunks")

DOC_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6", "#f97316", "#14b8a6"]


def get_doc_color(doc_index: int) -> str:
    return DOC_COLORS[doc_index % len(DOC_COLORS)]


def add_document(doc_id: str, name: str, doc_index: int):
    graph["documents"][doc_id] = {"name": name, "color": get_doc_color(doc_index), "chunk_count": 0}


def add_node(node_id: str, label: str, node_type: str, doc_id: str, weight: int = 1):
    if node_id not in graph["nodes"]:
        color = graph["documents"].get(doc_id, {}).get("color", "#6366f1")
        graph["nodes"][node_id] = {
            "id": node_id,
            "label": label,
            "type": node_type,
            "doc_id": doc_id,
            "color": color,
            "weight": weight,
            "connections": 0,
        }
    else:
        graph["nodes"][node_id]["weight"] += 1


def add_edge(source_id: str, target_id: str, relation: str, context: str = ""):
    if source_id not in graph["nodes"] or target_id not in graph["nodes"]:
        return

    for edge in graph["edges"]:
        if edge["source"] == source_id and edge["target"] == target_id:
            edge["weight"] = edge.get("weight", 1) + 1
            return

    graph["edges"].append(
        {"source": source_id, "target": target_id, "relation": relation, "context": context[:200], "weight": 1}
    )
    graph["nodes"][source_id]["connections"] += 1
    graph["nodes"][target_id]["connections"] += 1


def add_chunk_to_vector_store(chunk: str, doc_id: str, chunk_id: str, embedding: list[float]):
    collection.add(documents=[chunk], embeddings=[embedding], ids=[chunk_id], metadatas=[{"doc_id": doc_id}])
    if doc_id in graph["documents"]:
        graph["documents"][doc_id]["chunk_count"] += 1


def get_graph_data() -> dict:
    return {
        "nodes": list(graph["nodes"].values()),
        "edges": graph["edges"],
        "documents": graph["documents"],
        "stats": {
            "node_count": len(graph["nodes"]),
            "edge_count": len(graph["edges"]),
            "doc_count": len(graph["documents"]),
            "cluster_count": len(set(n["type"] for n in graph["nodes"].values())),
        },
    }


def clear_graph():
    graph["nodes"].clear()
    graph["edges"].clear()
    graph["documents"].clear()
    try:
        chroma_client.delete_collection("synapse_chunks")
    except Exception:
        pass
    global collection
    collection = chroma_client.get_or_create_collection("synapse_chunks")


def search_chunks(query_embedding: list[float], n_results: int = 5) -> list[dict]:
    try:
        count = collection.count()
        if count == 0:
            return []
        results = collection.query(query_embeddings=[query_embedding], n_results=min(n_results, count))
        chunks = []
        for i, doc in enumerate(results["documents"][0]):
            chunks.append(
                {
                    "text": doc,
                    "doc_id": results["metadatas"][0][i].get("doc_id", ""),
                    "distance": results["distances"][0][i] if results.get("distances") else 0,
                }
            )
        return chunks
    except Exception:
        return []
