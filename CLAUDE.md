# CLAUDE.md — tu-schoolbooks

Educational course material pipeline: source documents → structured markdown → Astro websites.

---

## Repository Structure

```
tu-schoolbooks/
├── astro.config.mjs             ← root Astro config; auto-discovers subjects via contents/sidebar.json
├── tsconfig.json
├── package.json                 ← single entry point: pnpm dev / pnpm build
├── src/
│   ├── content/
│   │   ├── config.ts            ← glob loader: subjects/*/contents/ + src/content/docs/
│   │   ├── docs/index.mdx       ← root subjects listing (route: /)
│   │   └── i18n/bg.json         ← Starlight UI translations
│   ├── components/              ← shared Astro components (GlossaryTable, HomepageContent)
│   ├── glossary/
│   │   └── glossary-index.json  ← GLOBAL glossary (all subjects, all entries unique)
│   ├── pages/
│   │   └── glossary/index.astro ← global glossary page (route: /glossary/)
│   ├── styles/custom.css
│   └── assets/logo.svg
└── subjects/                    ← standardised subject workspace (primary)
    └── <name>/
        ├── source/              ← raw input: PDF, DOCX, DOC, images, scans
        ├── tmp/                 ← all intermediate work (never delete anything here)
        │   └── <session-id>/   ← one directory per extraction session
        │       └── <doc>/      ← per-document working files
        │           ├── pages/  ← split pages as images or raw text
        │           ├── chunks/ ← chapter/subchapter splits
        │           └── ocr/    ← tesseract output, one file per chunk
        ├── docs/                ← final clean markdown (the content layer)
        │   └── **/*.md          ← organised by chapter / section
        └── contents/            ← subject web layer (MDX pages + JSON config)
            ├── index.mdx        ← subject landing page (route: /<name>/)
            ├── NN-slug.mdx      ← chapter pages (route: /<name>/NN-slug/)
            ├── sidebar.json     ← Starlight sidebar groups for this subject
            └── homepage.json    ← homepage card data
```

The `subjects/` tree is the canonical structure. The Astro site aggregates all subjects automatically by scanning for `subjects/*/contents/sidebar.json`.

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

## Global Glossary (`src/glossary/glossary-index.json`)

The glossary is **global** — one file for all subjects. Rules:

1. **All entries are unique by abbreviation** (`abbr` field). No two entries may have the same `abbr`.
2. **Ambiguous entries** — if the same abbreviation means different things in different subjects, add a `note` field explaining the ambiguity and list all relevant chapters. Do not silently pick one meaning.
3. **Entry format**:
   ```json
   {
     "id": "apic",
     "letter": "A",
     "abbr": "APIC",
     "full": "Advanced Programmable Interrupt Controller",
     "description": "...",
     "mentions": [
       { "subject": "microprocessor-systems", "refs": [{ "title": "Прекъсвания и изключения", "slug": "09-interrupts" }] }
     ]
   }
   ```
   `mentions` groups refs by subject. `title` has no Roman numeral prefix.
4. **Do not add a per-subject `glossary.json`** — add entries to the global index instead.
5. **Do not add a per-subject glossary page** — link to `/glossary/` from the subject sidebar if needed.
6. The global glossary page lives at `/glossary/` (`src/pages/glossary/index.astro`).

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

The site is controlled from the repo root:

```bash
pnpm install    # first time (uses pnpm-lock.yaml)
pnpm dev        # dev server at http://localhost:4321
pnpm build      # production build to dist/
```

### Adding a new subject

1. Create `subjects/<name>/contents/` with MDX pages and `sidebar.json`.
2. `astro.config.mjs` auto-discovers any subject that has a `contents/sidebar.json`.
3. All internal links in MDX files must be prefixed with `/<name>/` (e.g. `/microprocessor-systems/01-history/`).
4. Glossary links always point to `/glossary/` (global, no subject prefix).
5. `HomepageContent` accepts a `base` prop for chapter link prefixing.

### Content routing

`src/content/config.ts` uses Astro 5's glob loader with a pattern array:
- `subjects/*/contents/**/*.{md,mdx}` → route `/<name>/<slug>/` (strips `/contents/` from path)
- `src/content/docs/**/*.{md,mdx}` → root-level routes (e.g. `/`)

Import components in MDX using the `@/` alias (maps to `src/`):
```mdx
import HomepageContent from '@/components/HomepageContent.astro';
```

### OCR tools (macOS)

| Task | Tool |
|------|------|
| PDF text layer | `pdftotext -nopgbrk` (prefer over `-layout`) |
| Render to image | `pdftoppm -r 300 -png` |
| OCR | `tesseract <img> stdout -l bul+eng` |
| DOC → text | `textutil -convert txt -stdout` (macOS built-in) |

**macOS Unicode note**: filenames use NFD, pdftotext output uses NFC. Always normalize both sides with `unicodedata.normalize('NFC', s)` before comparing.

---

## MDX Composition Style

These rules govern how `contents/*.mdx` pages are written by `/textbook:compose` and `/textbook:refine`. All human editors should follow them too.

### Tone and language

- **Academic but accessible.** Write for a technically literate student, not a specialist. Use precise terminology; never dumb it down, but always explain the *why* behind a concept, not just the *what*.
- **Expressive prose, not bullet dumps.** Introductory and concluding paragraphs must be full sentences. Bullet lists are for enumerations (registers, steps, parameters) where prose would obscure structure — not as a substitute for explanatory text.
- **Bulgarian for Bulgarian-language subjects** (e.g. microprocessor-systems). English technical terms and abbreviations appear verbatim (e.g. *Branch Target Buffer*, *µop*) — do not translate them; do translate surrounding prose.
- **Bold on first meaningful use** of an abbreviation or key term within the page (e.g. `**ROB (Reorder Buffer)**`). Subsequent uses are plain text.

### Structure

- Frontmatter: `title` matching the chapter title from the source doc (with chapter number prefix, e.g. `"Глава II — Суперскаларни микроархитектури"`).
- Top-level sections: `## N. Section Title` — numbered to match the source document.
- Subsections: `### N.M Subsection Title`.
- Do not add a top-level `# heading` — Starlight renders the frontmatter `title` as H1.
- End each chapter page with a `## Резюме` (or `## Summary` for English) that condenses the key takeaways in 3–6 bullet points.

### Visuals

**Rule: prefer a real image over a diagram.**

1. Search the web for a suitable image (Wikipedia, manufacturer datasheets, textbook publishers, IEEE). Target at least **800 px wide**. For Wikimedia URLs the valid thumb sizes are `20, 40, 60, 120, 250, 330, 500, 960, 1280` — use `960px-` or `1280px-` as the thumb prefix (never 400, 600, 800, or 1024 — those return HTTP 400).
2. **Download every image locally** — never embed remote URLs directly. Save to `public/images/<subject>/<filename>` and reference it as `/images/<subject>/<filename>`. Use `curl -L -o <path> <url>` to download; create the directory first with `mkdir -p`.
3. Only if no suitable image is found, create a **Mermaid diagram**. Use the simplest diagram type that accurately represents the structure (flowchart for pipelines, block diagrams; sequence for protocols). Do not add decorative diagrams.
4. Mermaid diagrams live in fenced blocks: ` ```mermaid `.
5. Every visual (image or diagram) must have a caption as a following `*italic paragraph*` or inside an `<figcaption>` if wrapped in `<figure>`.

### Glossary cross-references

- On first use of any abbreviation that exists in `src/glossary/glossary-index.json`, verify the entry is accurate and complete.
- If the term is **missing** from the glossary, note it and add it (following the same rules as `/glossary:add`).
- Do not manually add inline hyperlinks to the glossary — the `GlossaryHighlighter` component handles that automatically at runtime.

### Q&A page (`questions-answers.mdx`)

- Contains questions extracted from the lab textbook, grouped by **lab exercise**.
- Each exercise is an `## Лабораторно упражнение N — Title` heading.
- Each question is `### Въпрос N` with the question in **bold** and the answer as flowing prose underneath.
- Answers must be detailed and academically correct — not a one-liner. Explain the mechanism, give the reason, connect to the broader concept.
- Code examples (assembly, pseudocode) go in fenced code blocks with language tag (`nasm`, `c`, `text`).

### What to avoid

- Do not add section numbers to frontmatter `title` if the doc source doesn't have them.
- Do not translate English register names, instruction mnemonics, or signal names (e.g. keep `ADS#`, `LOCK`, `CR0`).
- Do not simplify or paraphrase technical definitions from the source — expand and clarify, but preserve accuracy.
- Do not create mermaid diagrams for things that are better represented as a table.

---

## Commands

| Command                          | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| `/textbook:extract <name>`       | Scan source, OCR new documents, write docs     |
| `/textbook:compose <name>`       | Compose MDX pages from docs for a subject      |
| `/textbook:refine <loc> <msg>`   | Refine a specific section with instructions    |
| `/glossary:add <terms> [-s]`     | Add new terms to the global glossary index     |
| `/glossary:refine <abbr> [msg]`  | Improve an existing glossary entry             |
| `pnpm dev`                       | Start dev server (from repo root)              |
| `pnpm build`                     | Production build + pagefind index to dist/     |
| `pnpm start`                     | Serve dist/ on port 1337                       |
