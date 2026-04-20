# ============================================
# Project: SYNAPSE — GraphRAG Knowledge Engine
# Author: Telvin Crasta
# GitHub: github.com/yourhandle
# License: CC BY-NC 4.0
# Original design and architecture by Telvin Crasta
# ============================================

import json
from typing import List

from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from document_processor import clean_text, extract_text
from groq_service import answer_with_graph
from graph_builder import build_graph_from_document
from graph_retriever import retrieve_for_query
from graph_store import add_document, clear_graph, get_graph_data, graph

app = FastAPI(title="SYNAPSE — GraphRAG Knowledge Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

connections: list[WebSocket] = []


async def broadcast(data: dict):
    for ws in connections[:]:
        try:
            await ws.send_text(json.dumps(data))
        except Exception:
            if ws in connections:
                connections.remove(ws)


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connections:
            connections.remove(websocket)


@app.get("/")
def root():
    return {"status": "SYNAPSE online", "author": "Telvin Crasta"}


@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    clear_graph()
    await broadcast({"step": "start", "message": f"Processing {len(files)} documents..."})

    for i, file in enumerate(files):
        try:
            file_bytes = await file.read()
            text = extract_text(file_bytes, file.filename)
            text = clean_text(text)
            doc_id = f"doc_{i}"
            add_document(doc_id, file.filename, i)
            await broadcast({"step": "processing", "message": f"Building graph for: {file.filename}"})
            await build_graph_from_document(doc_id, text, i, broadcast)
        except Exception as e:
            await broadcast({"step": "error", "message": f"Error processing {file.filename}: {str(e)}"})

    graph_data = get_graph_data()
    await broadcast(
        {
            "step": "complete",
            "message": (
                f"Knowledge graph built: {graph_data['stats']['node_count']} nodes, "
                f"{graph_data['stats']['edge_count']} connections"
            ),
            "graph": graph_data,
        }
    )
    return JSONResponse(graph_data)


@app.get("/graph")
def get_graph():
    return JSONResponse(get_graph_data())


@app.post("/query")
async def query_graph(body: dict):
    question = body.get("question", "").strip()
    if not question:
        return JSONResponse(status_code=400, content={"error": "Question required"})

    if not graph["nodes"]:
        return JSONResponse(status_code=400, content={"error": "No documents uploaded yet"})

    await broadcast({"step": "retrieving", "message": "Traversing knowledge graph..."})
    retrieval = retrieve_for_query(question)
    await broadcast(
        {
            "step": "activated",
            "message": f"Activated {len(retrieval['relevant_nodes'])} nodes",
            "activated_nodes": retrieval["relevant_nodes"],
        }
    )
    await broadcast({"step": "answering", "message": "Synthesizing answer across graph..."})
    answer = answer_with_graph(question, retrieval["context"], retrieval["relevant_nodes"])
    await broadcast({"step": "complete", "message": "Answer ready"})

    return JSONResponse(
        {
            "question": question,
            "answer": answer,
            "activated_nodes": retrieval["relevant_nodes"],
            "chunk_count": len(retrieval["chunks"]),
        }
    )


@app.get("/status")
def status():
    data = get_graph_data()
    return JSONResponse({"has_graph": len(graph["nodes"]) > 0, "stats": data["stats"]})
