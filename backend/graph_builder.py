# ============================================
# Project: SYNAPSE — GraphRAG Knowledge Engine
# Author: Telvin Crasta
# GitHub: github.com/yourhandle
# License: CC BY-NC 4.0
# Original design and architecture by Telvin Crasta
# ============================================

from document_processor import chunk_text
from entity_extractor import extract_entities, extract_key_concepts, extract_relationships
from groq_service import get_embedding
from graph_store import add_chunk_to_vector_store, add_edge, add_node


async def build_graph_from_document(doc_id: str, text: str, doc_index: int, broadcast_fn):
    await broadcast_fn({"step": "entities", "message": f"Extracting entities from document {doc_index + 1}..."})

    entities = extract_entities(text)
    concepts = extract_key_concepts(text)
    relationships = extract_relationships(text, entities)

    await broadcast_fn({"step": "nodes", "message": f"Found {len(entities)} entities, {len(concepts)} concepts..."})

    for entity in entities:
        node_id = f"ent_{entity['text'].lower().replace(' ', '_')}"
        add_node(node_id, entity["text"], entity["type"], doc_id, weight=2)

    for concept in concepts:
        node_id = f"con_{concept['text'].lower().replace(' ', '_')}"
        add_node(node_id, concept["text"], "CONCEPT", doc_id, weight=concept["frequency"])

    for rel in relationships:
        source_id = f"ent_{rel['source'].lower().replace(' ', '_')}"
        target_id = f"ent_{rel['target'].lower().replace(' ', '_')}"
        add_edge(source_id, target_id, rel["relation"], rel["context"])

    await broadcast_fn({"step": "vectors", "message": "Building vector embeddings..."})

    chunks = chunk_text(text)
    for i, chunk in enumerate(chunks[:20]):
        try:
            embedding = get_embedding(chunk)
            add_chunk_to_vector_store(chunk, doc_id, f"{doc_id}_chunk_{i}", embedding)
        except Exception:
            pass

    await broadcast_fn({"step": "done", "message": f"Document {doc_index + 1} integrated into knowledge graph"})
