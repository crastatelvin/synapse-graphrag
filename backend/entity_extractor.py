# ============================================
# Project: SYNAPSE — GraphRAG Knowledge Engine
# Author: Telvin Crasta
# GitHub: github.com/yourhandle
# License: CC BY-NC 4.0
# Original design and architecture by Telvin Crasta
# ============================================

from collections import Counter

import spacy

nlp = spacy.load("en_core_web_sm")

ENTITY_TYPES = {"PERSON", "ORG", "GPE", "PRODUCT", "EVENT", "WORK_OF_ART", "LAW", "NORP"}


def extract_entities(text: str) -> list[dict]:
    doc = nlp(text[:100000])
    entities = []
    seen = set()

    for ent in doc.ents:
        if ent.label_ in ENTITY_TYPES and len(ent.text) > 2:
            clean = ent.text.strip()
            if clean not in seen:
                seen.add(clean)
                entities.append(
                    {
                        "text": clean,
                        "type": ent.label_,
                        "label": spacy.explain(ent.label_) or ent.label_,
                    }
                )

    return entities


def extract_key_concepts(text: str, max_concepts: int = 30) -> list[dict]:
    doc = nlp(text[:100000])
    phrases = []

    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip().lower()
        if 3 < len(phrase) < 40 and chunk.root.pos_ not in ("PRON",):
            phrases.append(phrase)

    counts = Counter(phrases)
    top = [(phrase, count) for phrase, count in counts.most_common(max_concepts * 2) if count > 1]
    return [{"text": p.title(), "frequency": c} for p, c in top[:max_concepts]]


def extract_relationships(text: str, entities: list[dict]) -> list[dict]:
    relationships = []
    sentences = text.split(".")

    for sentence in sentences:
        sentence_lower = sentence.lower()
        found_entities = [e for e in entities if e["text"].lower() in sentence_lower]

        for i in range(len(found_entities)):
            for j in range(i + 1, len(found_entities)):
                e1 = found_entities[i]
                e2 = found_entities[j]

                relation = "related_to"
                for verb in [
                    "uses",
                    "builds",
                    "creates",
                    "manages",
                    "develops",
                    "leads",
                    "owns",
                    "partners",
                    "competes",
                    "acquires",
                ]:
                    if verb in sentence_lower:
                        relation = verb
                        break

                relationships.append(
                    {
                        "source": e1["text"],
                        "target": e2["text"],
                        "relation": relation,
                        "context": sentence.strip()[:200],
                    }
                )

    seen = set()
    unique_rels = []
    for rel in relationships:
        key = f"{rel['source']}_{rel['target']}"
        if key not in seen:
            seen.add(key)
            unique_rels.append(rel)

    return unique_rels[:100]
