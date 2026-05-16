# /textbook:refine — Refine a specific section of an MDX page

**Usage:** `/textbook:refine <section locator> <message>`

Improves a specific section of a composed MDX page based on free-form instructions.

`$ARGUMENTS` = `<subject> <chapter-num>[.<section-num>] <instructions>`

Examples:
- `/textbook:refine microprocessor-systems 11.2 add an image from internet instead of diagram with more detail`
- `/textbook:refine microprocessor-systems 7 rewrite the intro to be more expressive`
- `/textbook:refine microprocessor-systems questions-answers lab4 q3 expand the answer with more detail on cache coherence`

---

## Step 0 — Parse the section locator

From `$ARGUMENTS`, extract:
- **subject**: first token that matches a directory under `subjects/`
- **locator**: next token(s) — one of:
  - `NN` — chapter number (e.g. `11` → chapter 11, file `11-*.mdx`)
  - `NN.M` — chapter + section (e.g. `11.2` → chapter 11, section `## 2.` or `### 2.`)
  - `NN.M.K` — chapter + section + subsection
  - a slug keyword like `questions-answers`, `exam-answers`
  - for Q&A: `questions-answers labN qM` — lab N, question M
- **instructions**: remaining text — everything after the locator

If the locator is ambiguous (e.g. `11` matches both `11-bus.mdx` and a section 11 in another file), list the candidates and ask the user to confirm.

---

## Step 1 — Locate the file and section

1. Resolve the subject directory: `subjects/<subject>/contents/`.
2. Find the MDX file matching the chapter number: `grep -l` or filename pattern `NN-*.mdx`.
3. Read the file.
4. If a section number is given, find the heading matching `## N.` or `### N.M` (or `## Лабораторно упражнение N` for Q&A). Extract the section boundaries (from the heading to the next heading of equal or higher level).

Show the user the current section content (up to 40 lines; truncate with `…` if longer). Confirm this is the right section before proceeding.

---

## Step 2 — Interpret instructions

Parse the instructions for known intents:

| Intent keyword | Action |
|---|---|
| `add image` / `find image` | Search web for a suitable image; replace or supplement existing diagram |
| `instead of diagram` | Remove the mermaid block and replace with a found image |
| `more detail` | Expand the section — add more explanatory prose, sub-points, or examples from the doc source |
| `rewrite` / `rephrase` | Rewrite the section while preserving all technical content |
| `add mermaid` / `add diagram` | Create a new mermaid diagram representing the structure |
| `expand answer` | For Q&A pages: write a fuller, more detailed answer |
| `add reference` | Add a citation, link, or note to an external source (URL must be provided by user) |
| `fix` / `correct` | Fix a specific factual or structural error described in the instructions |
| `simplify` | Make the section clearer without losing accuracy — reduce jargon, improve flow |

Combinations are allowed (e.g. "add image from internet with more detail").

---

## Step 3 — Execute the refinement

Apply the instructions following **MDX Composition Style** from CLAUDE.md.

### Image search (when instructed)

1. Derive 2–3 search queries from the section title and content (e.g. "x86 bus cycle timing diagram", "Intel 8237 DMA block diagram").
2. Search the web. Look for images on Wikipedia, Intel/AMD documentation, IEEE, university course pages, or archived textbook sites.
3. Evaluate candidates: prefer images that are technically accurate, clearly labelled, and at a stable URL (no CDN tokens, no search thumbnails).
4. If a good image is found: embed it with alt text and caption. Remove any mermaid block the image replaces (unless the instruction says to keep both).
5. If no suitable image is found: note it in the output and keep or create a mermaid diagram instead.

### Mermaid diagrams (when creating or updating)

- Choose the simplest diagram type: `flowchart LR` for pipelines/data flow, `block-beta` or `graph TD` for block diagrams, `sequenceDiagram` for protocols.
- Only include elements that are described in the source doc for this section.
- Do not add decorative or aspirational diagrams.

### Expanding content

- Draw from `subjects/<subject>/docs/<chapter>.md` for source material. Do not invent facts.
- Maintain tone: academic and expressive, not simplified.
- If expanding a Q&A answer: add mechanism explanation, concrete examples, and connection to the broader topic.

### Rewriting

- Preserve all technical terms, register names, mnemonics, and table data.
- Improve sentence flow, paragraph transitions, and clarity.
- Do not remove content — rewrite means restructure + improve, not summarise.

---

## Step 4 — Show diff and confirm

Present the proposed new section content. For short sections (< 30 lines), show the full new text. For longer ones, show a structural summary plus the changed portions.

Ask the user to approve, request further changes, or cancel.

---

## Step 5 — Write the update

After confirmation:
1. Replace the identified section in the MDX file (from the section heading to the next same-level heading).
2. Write the file. Do not touch other sections.
3. Report: `✓ Updated: subjects/<subject>/contents/<file>.mdx § <section heading>`

---

## Rules

- **Surgical edits only.** Only modify the identified section — do not reformat unrelated parts of the file.
- **Source fidelity.** All added technical content must come from the subject's `docs/` or a user-provided source. Do not invent facts.
- **Confirm before writing.** Always show the proposed change and wait for approval.
- **Stable image URLs only.** Do not embed images from URLs with expiry tokens or search engine thumbnail proxies.
- **Language consistency.** Match the language (Bulgarian/English) of the surrounding content.
