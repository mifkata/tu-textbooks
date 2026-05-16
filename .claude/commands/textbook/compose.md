# /textbook:compose — Compose MDX pages from docs for a subject

**Usage:** `/textbook:compose <subject>`

Reads cleaned markdown from `subjects/<subject>/docs/`, composes or updates MDX pages in
`subjects/<subject>/contents/`, cross-references the global glossary, and ensures all
sidebar and homepage metadata is correct.

`$ARGUMENTS` = subject name (e.g. `microprocessor-systems`).

---

## Step 0 — Validate

1. Set `SUBJECT=subjects/$ARGUMENTS`.
2. Verify `$SUBJECT/docs/` exists and contains at least one `.md` file. Abort if not.
3. Read `CLAUDE.md` → **MDX Composition Style** section. Apply those rules throughout.
4. Ensure `$SUBJECT/contents/` exists (`mkdir -p`).

---

## Step 1 — Inventory docs and existing contents

**Docs inventory:**
- List all `.md` files in `$SUBJECT/docs/`, sorted by filename (they are `NN-slug.md`).
- Read the frontmatter `title` from each file. This is the authoritative chapter title.
- Detect whether a file contains Q&A content: look for patterns like `Въпрос`, `Question`, `Лабораторно упражнение`, exam questions, or multiple `### Q` / `### А` headings.

**Existing contents inventory:**
- List all `.mdx` files in `$SUBJECT/contents/`.
- Read `$SUBJECT/contents/sidebar.json` if it exists.

**Mapping:**
Build a map of `doc-slug → contents-slug` (usually the same, e.g. `02_superscalar.md` → `02-superscalar.mdx`). Ask the user to confirm the mapping if any doc cannot be unambiguously matched.

---

## Step 2 — Plan the structure

Based on the docs inventory, propose the full contents structure:

```
contents/
  index.mdx                  ← subject homepage (HomepageContent component)
  NN-slug.mdx                ← one per chapter doc
  questions-answers.mdx      ← aggregated Q&A (if any docs contain lab questions)
  exam-answers.mdx           ← exam Q&A (if a dedicated exam doc exists)
sidebar.json
homepage.json
```

Present the proposed file list to the user. If `contents/` already has files, show which will be
**created** (new) vs **updated** (existing). Ask for confirmation before writing anything.

---

## Step 3 — Compose each chapter MDX

For each chapter doc (excluding Q&A/exam docs), create or update `contents/NN-slug.mdx`.

### 3a — Frontmatter

```mdx
---
title: "<chapter title from doc frontmatter>"
---
```

### 3b — Content translation from doc → MDX

Read the full doc content. Compose the MDX body following **MDX Composition Style** in CLAUDE.md:

- Convert `##` doc sections to `## N. Section Title` MDX headings (add numbering if absent).
- Convert `###` subsections to `### N.M Subsection Title`.
- Preserve all technical content: register names, addresses, mnemonics, tables, formulas.
- Wrap code samples in fenced blocks with the appropriate language tag (`nasm`, `c`, `text`, `mermaid`).
- Write expressive introductory prose for each major section — do not start a section with a bullet list.
- Add a `## Резюме` section at the end of each chapter with 3–6 key takeaways as bullets.

### 3c — Visuals (for each diagram placeholder or described structure)

For each complex concept that benefits from a visual (pipelines, memory maps, register layouts, bus cycles, state machines):

1. **Search the web** for a suitable diagram or photo: Wikipedia, Intel/AMD datasheets, IEEE, university course slides, textbook publishers. Use search terms derived from the section title and technical content.
2. If a suitable image is found at a stable, publicly accessible URL: embed it:
   ```mdx
   ![Descriptive alt text](https://example.com/image.png)
   *Caption: source description*
   ```
3. If no suitable image is found: create a **Mermaid diagram** that accurately represents the structure. Keep it simple — only include what is described in the doc.
4. If the doc already has a `<!-- diagram: description -->` placeholder, treat that as instruction to create a diagram.

### 3d — Glossary cross-reference

- Scan the composed MDX text for abbreviations (uppercase, 2+ characters).
- Check each against `src/glossary/glossary-index.json`.
- For any abbreviation **not** in the glossary that appears in the doc with a definition: note it for addition (see Step 6).
- Do not add manual links — the GlossaryHighlighter handles that at runtime.

---

## Step 4 — Compose Q&A page (`questions-answers.mdx`)

If any docs contain lab questions:

1. Identify all lab exercise sections across all docs (pattern: `Лабораторно упражнение N`, `Lab N`, or questions grouped under a lab heading).
2. Extract each question and its answer from the doc content.
3. Compose `contents/questions-answers.mdx`:

```mdx
---
title: "Въпроси и задачи — отговори"
---

> Source attribution (author, publisher, year — from doc frontmatter or content).

---

## Лабораторно упражнение N — <Lab Title>

### Въпрос N

**<Question text verbatim>**

<Detailed answer — expressive prose, 2–6 paragraphs. Explain the mechanism, the reason,
connect to the broader concept. Code examples in fenced blocks.>

---
```

Answer quality bar: a student should be able to answer the exam question after reading it — not just know the definition.

---

## Step 5 — Compose exam answers page (`exam-answers.mdx`)

If a dedicated exam doc exists (detected by title containing "изпит", "тест", "exam"):

- Same structure as Q&A but grouped by exam variant/section.
- Title: `"Изпитен тест — <Variant>"`.

---

## Step 6 — Update sidebar.json

Build or update `$SUBJECT/contents/sidebar.json` to reflect the composed files.

Group chapters semantically (by topic area, mirroring how the doc set is structured). Derive group labels from the doc content (look for thematic clusters). If the sidebar already exists and has manual groupings, preserve them — only add entries for newly composed files.

Format:
```json
[
  { "label": "Начало", "items": [{ "slug": "index", "label": "За курса" }] },
  { "label": "<Group>", "items": [{ "slug": "NN-slug", "label": "<Roman numeral> — <short title>" }] },
  { "label": "Справка", "items": [
    { "slug": "questions-answers", "label": "Въпроси и задачи — отговори" }
  ]}
]
```

---

## Step 7 — Update homepage.json

Build or update `$SUBJECT/contents/homepage.json`:

```json
{
  "courseInfo": {
    "specialty": "<from doc content or ask user>",
    "department": "<from doc content or ask user>",
    "lecturer":   "<from doc content or ask user>"
  },
  "topicCards": [
    { "title": "<topic>", "icon": "<lucide icon name>", "description": "<1 sentence>" }
  ],
  "chapters": [
    { "num": N, "slug": "NN-slug", "title": "<short title>", "topics": ["<topic 1>", ...] }
  ]
}
```

`topicCards`: 4–6 cards covering the major themes of the subject (derived from chapter groupings).
`chapters.topics`: 3–6 bullet topics per chapter (the sub-headings from the doc).

If `homepage.json` already exists, only update fields that have changed.

---

## Step 8 — Add missing glossary entries

For each abbreviation flagged in Step 3d:
- Propose the entry (inferred from the doc context).
- Ask the user to confirm each one before adding to `src/glossary/glossary-index.json`.
- Follow the same format and rules as `/glossary:add`.

---

## Step 9 — Summary report

```
Subject: microprocessor-systems

Composed:
  ✓ contents/01-history.mdx           (updated — 3 sections, 1 image, 0 mermaid)
  ✓ contents/02-superscalar.mdx       (created — 4 sections, 2 images, 1 mermaid)
  ...
  ✓ contents/questions-answers.mdx    (created — 8 exercises, 32 questions)

Updated:
  ✓ sidebar.json
  ✓ homepage.json

Glossary:
  + 3 new entries added
  ~ 2 entries updated with new mentions

Missing visuals (no image found, no mermaid created — manual review needed):
  - 02-superscalar.mdx § 3.2 — Описание на шинния интерфейс
```

---

## Rules

- **Never overwrite user edits silently.** If a `.mdx` file exists and has content not derivable from the doc (e.g. manually added notes), show a diff and ask before replacing.
- **Confirm before any write.** After Step 2 planning, get approval before composing. After Step 8 glossary proposals, get approval before adding entries.
- **Images from stable URLs only.** Do not embed images from search result thumbnails or URLs that look like CDN-cached results with expiry tokens. Prefer Wikipedia, official manufacturer sites, or archived educational resources.
- **One MDX per chapter doc.** Do not merge multiple docs into one MDX page or split one doc into multiple MDX pages without asking.
