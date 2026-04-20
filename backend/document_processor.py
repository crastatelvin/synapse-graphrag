# ============================================
# Project: SYNAPSE — GraphRAG Knowledge Engine
# Author: Telvin Crasta
# GitHub: github.com/yourhandle
# License: CC BY-NC 4.0
# Original design and architecture by Telvin Crasta
# ============================================

import re

import fitz


def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(page.get_text() for page in doc).strip()
    return file_bytes.decode("utf-8", errors="ignore").strip()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    words = text.split()
    chunks: list[str] = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s\.\,\!\?\;\:\-\(\)]", "", text)
    return text.strip()
