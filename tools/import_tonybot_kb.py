#!/usr/bin/env python3
"""Build a searchable Tonybot knowledge base from downloaded official sources."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "knowledge-base" / "raw"
KB = ROOT / "knowledge-base"

TEXT_SUFFIXES = {
    ".c", ".cc", ".cpp", ".h", ".hpp", ".html", ".ino", ".json", ".md",
    ".py", ".rst", ".txt", ".yaml", ".yml",
}


class HtmlText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self.skip += 1
        elif not self.skip and tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.parts.append("\n\n" + "#" * int(tag[1]) + " ")
        elif not self.skip and tag in {"p", "div", "section", "article", "li", "pre", "br"}:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"} and self.skip:
            self.skip -= 1
        elif not self.skip and tag in {"p", "div", "section", "article", "li", "pre"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.skip:
            self.parts.append(data)


def html_to_markdown(data: str) -> str:
    parser = HtmlText()
    parser.feed(data)
    text = "".join(parser.parts)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def safe_id(path: Path) -> str:
    relative = path.relative_to(RAW).as_posix()
    stem = re.sub(r"[^a-zA-Z0-9]+", "-", path.stem).strip("-").lower() or "document"
    digest = hashlib.sha1(relative.encode()).hexdigest()[:10]
    return f"{stem[:70]}-{digest}"


def title_for(path: Path, text: str) -> str:
    for line in text.splitlines():
        line = line.strip().lstrip("#").strip()
        if line and len(line) > 2:
            return line[:180]
    return path.stem.replace("_", " ").replace("-", " ").strip() or path.name


def keywords_for(title: str, source: str) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z0-9_-]{2,}", f"{title} {source}")
    result: list[str] = []
    for word in words:
        value = word.lower()
        if value not in result and value not in {"the", "and", "for", "from", "with"}:
            result.append(value)
        if len(result) == 12:
            break
    return result


def main() -> None:
    markdown_dir = KB / "markdown"
    summaries_dir = KB / "summaries"
    chunks_dir = KB / "chunks"
    for directory in (markdown_dir, summaries_dir, chunks_dir):
        directory.mkdir(parents=True, exist_ok=True)

    documents: list[dict[str, object]] = []
    for path in sorted(RAW.rglob("*")):
        if not path.is_file() or ".git" in path.parts or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        raw = path.read_text(encoding="utf-8", errors="replace")
        text = html_to_markdown(raw) if path.suffix.lower() == ".html" else raw.strip()
        if not text:
            continue
        doc_id = safe_id(path)
        title = title_for(path, text)
        relative = path.relative_to(KB).as_posix()
        keywords = keywords_for(title, relative)
        document = {
            "doc_id": doc_id,
            "title": title,
            "status": "processed",
            "source_path": relative,
            "markdown_path": f"markdown/{doc_id}.md",
            "summary_path": f"summaries/{doc_id}.md",
            "chunk_files": [f"chunks/{doc_id}-chunk-001.md"],
            "keywords": keywords,
        }
        frontmatter = (
            "---\n"
            f"doc_id: {doc_id}\n"
            f"title: {json.dumps(title, ensure_ascii=False)}\n"
            f"source_path: {relative}\n"
            "source_type: official\n"
            "status: processed\n"
            "---\n\n"
        )
        (markdown_dir / f"{doc_id}.md").write_text(frontmatter + text + "\n", encoding="utf-8")
        summary = text[:1800].strip()
        (summaries_dir / f"{doc_id}.md").write_text(
            frontmatter + f"# {title}\n\n{summary}\n", encoding="utf-8"
        )
        (chunks_dir / f"{doc_id}-chunk-001.md").write_text(
            "---\n"
            f"chunk_id: {doc_id}-chunk-001\n"
            f"doc_id: {doc_id}\n"
            f"title: {json.dumps(title, ensure_ascii=False)}\n"
            f"semantic_key: {json.dumps(title, ensure_ascii=False)}\n"
            f"keywords: {json.dumps(keywords, ensure_ascii=False)}\n"
            "---\n\n" + text + "\n",
            encoding="utf-8",
        )
        documents.append(document)

    (KB / "index.yaml").write_text(
        json.dumps({"version": 1, "documents": documents}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (KB / "import-manifest.json").write_text(
        json.dumps(
            {
                "source": "docs/references.md",
                "generated_by": "tools/import_tonybot_kb.py",
                "documents": len(documents),
                "notes": [
                    "HTML, Markdown, and source-code files imported.",
                    "Binary files and the Git metadata directory were excluded from indexing.",
                    "Google Drive folders remain represented by resources-download.html links.",
                ],
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    print(f"Imported {len(documents)} documents")


if __name__ == "__main__":
    main()
