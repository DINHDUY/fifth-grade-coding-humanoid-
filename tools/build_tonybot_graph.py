#!/usr/bin/env python3
"""Build a lightweight knowledge graph from the generated Tonybot KB index."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "knowledge-base"


def concept_id(value: str) -> str:
    return "concept-" + re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main() -> None:
    index = json.loads((KB / "index.yaml").read_text(encoding="utf-8"))
    documents = index.get("documents", [])
    nodes: dict[str, dict[str, object]] = {}
    edges: list[dict[str, object]] = []
    concept_docs: dict[str, set[str]] = defaultdict(set)
    doc_concepts: dict[str, set[str]] = defaultdict(set)

    for document in documents:
        doc_id = str(document["doc_id"])
        nodes[doc_id] = {
            "id": doc_id,
            "label": document["title"],
            "type": "document",
            "path": document["source_path"],
        }
        for keyword in document.get("keywords", []):
            label = str(keyword).strip().lower()
            if not label or len(label) < 3:
                continue
            cid = concept_id(label)
            concept_docs[cid].add(doc_id)
            doc_concepts[doc_id].add(cid)
            nodes.setdefault(cid, {"id": cid, "label": label, "type": "concept"})
            edges.append({"source": doc_id, "target": cid, "type": "mentions"})

    # Connect concepts that co-occur in at least two documents. This keeps the
    # graph useful for neighborhood queries without producing a dense clique.
    cooccurrences: dict[tuple[str, str], int] = defaultdict(int)
    for concepts_for_doc in doc_concepts.values():
        concepts = sorted(concepts_for_doc)
        for left, right in zip(concepts, concepts[1:]):
            cooccurrences[(left, right)] += 1
    for (left, right), count in cooccurrences.items():
        if count >= 2:
            edges.append({"source": left, "target": right, "type": "related", "weight": count})

    graph = {
        "version": 1,
        "nodes": list(nodes.values()),
        "edges": edges,
        "metadata": {
            "source": "knowledge-base/index.yaml",
            "document_count": len(documents),
            "concept_count": sum(node["type"] == "concept" for node in nodes.values()),
            "edge_count": len(edges),
        },
    }
    output = KB / "graphs" / "knowledge-graph.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {output}: {len(graph['nodes'])} nodes, "
        f"{len(graph['edges'])} edges"
    )


if __name__ == "__main__":
    main()
