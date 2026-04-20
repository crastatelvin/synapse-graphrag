# ============================================
# Project: SYNAPSE — GraphRAG Knowledge Engine
# Author: Telvin Crasta
# GitHub: github.com/yourhandle
# License: CC BY-NC 4.0
# Original design and architecture by Telvin Crasta
# ============================================

import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()
_api_key = os.getenv("GROQ_API_KEY")
_chat_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
_embedding_model = os.getenv("GROQ_EMBEDDING_MODEL", "nomic-embed-text-v1.5")
client = Groq(api_key=_api_key) if _api_key else None


def get_embedding(text: str) -> list[float]:
    if client is None:
        raise ValueError("GROQ_API_KEY is not set.")
    response = client.embeddings.create(model=_embedding_model, input=text)
    return response.data[0].embedding


def answer_with_graph(query: str, context: str, relevant_nodes: list[str]) -> str:
    if client is None:
        return "Groq API key is not configured. Set GROQ_API_KEY in backend/.env to enable Q&A."

    nodes_text = ", ".join(relevant_nodes[:10]) if relevant_nodes else "none identified"
    prompt = f"""You are SYNAPSE, an advanced knowledge graph AI assistant.

You have access to a knowledge graph built from multiple documents.
The following context was retrieved through graph traversal and vector search.

RETRIEVED CONTEXT:
{context[:4000]}

ACTIVATED GRAPH NODES: {nodes_text}

USER QUESTION: {query}

Instructions:
- Answer based on the retrieved context and graph relationships
- Reference specific entities and connections when relevant
- If multiple documents contribute to the answer, synthesize across them
- Be specific, insightful, and show how concepts connect
- Keep response under 300 words
- Start with a direct answer, then explain the connections
"""

    response = client.chat.completions.create(
        model=_chat_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.choices[0].message.content or ""
