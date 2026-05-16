# CLAUDE.md — tu-schoolbooks

Educational course material pipeline: source documents → structured markdown → Astro websites.

---

## Repository Structure

```
tu-schoolbooks/
├── subjects/                    ← standardised subject workspace (primary)
│   └── <name>/
│       ├── source/              ← raw input: PDF, DOCX, DOC, images, scans
│       ├── tmp/                 ← all intermediate work (never delete anything here)
│       │   └── <session-id>/   ← one directory per extraction session
│       │       └── <doc>/      ← per-document working files
│       │           ├── pages/  ← split pages as images or raw text
│       │           ├── chunks/ ← chapter/subchapter splits
│       │           └── ocr/    ← tesseract output, one file per chunk
│       └── docs/                ← final clean markdown (the content layer)
│           └── **/*.md          ← organised by chapter / section
└── <name>/                      ← legacy Astro project (e.g. microprocessor-systems)
    └── CLAUDE.md                ← project-specific instructions
```

The `subjects/` tree is the canonical structure for new work. Legacy projects under the root keep their own CLAUDE.md and are not affected.

---

## Subject Conventions

### Source documents (`source/`)

- Drop any raw files here: `*.pdf`, `*.docx`, `*.doc`, scanned images.
- Sub-directories are allowed (e.g. `source/Textbook - split/`).
- **Never modify** source files; treat them as read-only inputs.

### Temporary work (`tmp/`)

- Every extraction run creates a new directory named by **session ID** (format: `YYYYMMDD-HHMMSS`).
- Nothing inside `tmp/` is ever deleted — old sessions serve as a paper trail and allow diff-based re-processing.
- A `manifest.json` at `tmp/manifest.json` (root level, not per-session) tracks which source files have been processed and under which session ID.

### Docs (`docs/`)

- One markdown file per chapter or major section.
- File naming: `NN-slug.md` where `NN` is zero-padded order (e.g. `01-introduction.md`).
- Docs are **regeneratable**: they are derived from `tmp/` data, not hand-edited prose. Manually refining a doc is fine, but the extraction pipeline should be re-runnable and produce a mergeable result.
- Content depth: thorough and precise — not oversimplified, not a raw OCR dump. Preserve technical terminology, formulas, and structure from the source.

---

## Extraction Workflow (overview)

The `/s:extract <name>` command runs this pipeline:

1. **Scan** `subjects/<name>/source/` — find all documents, compare against `tmp/manifest.json` to identify new/unprocessed ones.
2. **Session** — generate a session ID and create `tmp/<session-id>/`.
3. **Split** each document into pages, then group pages into logical chunks (chapters or subchapters) based on headings, TOC, or page breaks.
4. **OCR** each chunk independently using `tesseract`. For text-layer PDFs, extract the text layer first (`pdftotext`); fall back to image OCR if the layer is absent or garbled.
5. **Assemble** — consolidate chunk OCR output into structured markdown, preserving hierarchy (H1 chapter → H2 subchapter → body).
6. **Write** final docs to `subjects/<name>/docs/`, one file per chapter.
7. **Update** `tmp/manifest.json` to record the processed files and session ID.

All intermediate files are kept. Re-running with new source files is additive.

---

## OCR & Splitting Tools

Use whatever is available on the system. Preferred stack:

| Task                 | Tool                                                |
| -------------------- | --------------------------------------------------- |
| Split PDF by page    | `pdfseparate` (poppler) or `mutool poster`          |
| PDF text layer       | `pdftotext -layout`                                 |
| Render page to image | `pdftoppm -r 300 -png`                              |
| OCR image            | `tesseract <img> stdout -l bul+eng` (or `eng` only) |
| DOCX → text          | `pandoc --to plain`                                 |
| DOC → text           | `antiword` or `catdoc` or LibreOffice headless      |

Check availability with `which <tool>` before use; fall back gracefully.

---

## Docs Quality Rules

1. **Structure mirrors the source**: chapter order, section headings, and numbering must match the original document.
2. **No raw OCR artefacts**: fix obvious OCR errors (broken words, stray characters), but do not paraphrase.
3. **Preserve technical content**: formulas, register names, memory addresses, instruction mnemonics, and table values must be accurate.
4. **Language**: preserve the language of the source (Bulgarian or English). Do not translate unless explicitly asked.
5. **Frontmatter**: every doc file begins with YAML frontmatter:
   ```yaml
   ---
   title: "Chapter title"
   source: "<original filename>"
   session: "<session-id>"
   ---
   ```
6. **Tables and lists**: render as standard Markdown tables / bullet lists.
7. **Diagrams**: describe complex diagrams in a fenced `mermaid` block where feasible; otherwise note `<!-- diagram: <description> -->`.

---

## Astro Integration (pages layer)

> **Not yet defined.** Page structure and build configuration will be added in a follow-up. For now, the `docs/` markdown files are the deliverable.

When the Astro layer is added, each subject will get a `web/` directory alongside `source/`, `tmp/`, and `docs/`, following the same pattern as the legacy `microprocessor-systems/` project.

---

## Commands

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `/s:extract <name>` | Scan source, OCR new documents, write docs |
