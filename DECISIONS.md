# Architecture Decisions — SYNAPSE GraphRAG
## Author: Telvin Crasta | CC BY-NC 4.0

## Why spaCy over custom NLP?
spaCy `en_core_web_sm` is fast, free, and production-proven for entity extraction.

## Why D3.js over higher-level graph libraries?
D3 gives direct control over graph physics, rendering, and interaction behavior.

## Why Canvas particles + SVG graph?
Canvas handles dense background animation efficiently, while SVG remains ideal for interactive graph nodes and edges.

## Why ChromaDB?
ChromaDB is zero-config, local-first, and practical for prototyping GraphRAG.
