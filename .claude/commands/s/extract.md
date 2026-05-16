# /s:extract — Extract and OCR source documents for a subject

**Usage:** `/s:extract <name>`

Processes new source documents in `subjects/<name>/source/`, OCRs them chunk by chunk, and writes structured markdown to `subjects/<name>/docs/`.

---

## Step 0 — Resolve paths and validate

1. Set `SUBJECT_DIR=subjects/$ARGUMENTS` (where `$ARGUMENTS` is the subject name passed to the command).
2. Verify `$SUBJECT_DIR/source/` exists. If not, report the error and stop.
3. Ensure `$SUBJECT_DIR/tmp/` and `$SUBJECT_DIR/docs/` directories exist (`mkdir -p`).

---

## Step 1 — Generate session ID

Generate a session ID from the current timestamp: `SESSION=$(date +%Y%m%d-%H%M%S)`.

Create the session directory: `$SUBJECT_DIR/tmp/$SESSION/`.

Print the session ID so the user can reference it later.

---

## Step 2 — Scan for new documents

1. List all files in `$SUBJECT_DIR/source/` recursively (`find ... -type f`). Include: `*.pdf`, `*.PDF`, `*.doc`, `*.docx`, `*.DOC`, `*.DOCX`, `*.png`, `*.jpg`, `*.tiff`.
2. Read `$SUBJECT_DIR/tmp/manifest.json` if it exists. The manifest has this shape:
   ```json
   {
     "processed": {
       "relative/path/to/file.pdf": { "session": "20260101-120000", "chunks": 12 }
     }
   }
   ```
3. Determine **new** files: source files not present in `manifest.processed`. Process only new files in this run. If all files are already in the manifest, report "nothing new to process" and stop.
4. Print the list of new files to be processed.

---

## Step 3 — Process each new document

For each new document, run steps 3a–3e.

### 3a — Detect document type and extract raw content

**PDF files:**
- First check if there is a usable text layer:
  ```bash
  pdftotext -layout "$FILE" "$SESSION_DOC_DIR/text-layer.txt"
  ```
  A text layer is "usable" if the output is non-empty and does not look like garbled/non-linguistic characters (spot-check first ~200 chars).
- If usable: use the text layer as the primary source for this document.
- If absent or garbled: the document is a scan — render each page to an image for OCR.
  ```bash
  pdftoppm -r 300 -png "$FILE" "$SESSION_DOC_DIR/pages/page"
  # produces: page-001.png, page-002.png, ...
  ```

**DOCX files:**
- Convert with pandoc:
  ```bash
  pandoc --to plain --wrap=none "$FILE" -o "$SESSION_DOC_DIR/text-layer.txt"
  ```

**DOC files:**
- Try `antiword "$FILE" > "$SESSION_DOC_DIR/text-layer.txt"`.
- Fall back to `catdoc "$FILE" > "$SESSION_DOC_DIR/text-layer.txt"` if antiword is unavailable.
- As a last resort: convert to DOCX with LibreOffice headless, then use pandoc.

Store all raw output in `$SUBJECT_DIR/tmp/$SESSION/<doc-basename>/`.

### 3b — Split into chunks

A **chunk** is a chapter or subchapter — the smallest unit worth treating as a standalone section. Target size: 1–4 pages of text.

**For text-layer documents:**
- Scan the text for heading patterns:
  - Lines matching `^[A-ZА-Я][A-ZА-Я ]{3,}$` (all-caps headings)
  - Lines matching `^\d+[\.\)] ` or `^Глава \d+` / `^Chapter \d+`
  - Markdown-style `#` headings if pandoc produced them
- Split the text at each detected heading. Each split is one chunk file: `chunks/chunk-001.txt`, `chunks/chunk-002.txt`, ...
- Store a `chunks/index.json` listing chunk number → heading title → page range.

**For scan-only PDFs (image pages):**
- Group pages into chunks based on estimated content: use page count as a proxy (every 4–8 pages = one chunk, or group by a visually obvious break if you can detect it from page images).
- Each chunk is a list of page image paths, written to `chunks/chunk-NNN.pages` (one image path per line).

If no headings are detected, treat the whole document as one chunk.

### 3c — OCR each chunk

Process chunks **one at a time** — do not batch them all in a single command.

**Text-layer chunks** (already in `chunks/chunk-NNN.txt`):
- The text is already extracted. Skip tesseract for these.
- Copy or symlink to `ocr/chunk-NNN.txt`.

**Image chunks** (page list in `chunks/chunk-NNN.pages`):
- For each page image in the chunk:
  ```bash
  tesseract "$PAGE_IMAGE" "$OCR_DIR/page-NNN" -l bul+eng
  # if bul+eng not available: tesseract "$PAGE_IMAGE" "$OCR_DIR/page-NNN" -l eng
  ```
- Concatenate page OCR outputs into `ocr/chunk-NNN.txt`.

After all chunks are OCR'd, you have `ocr/chunk-001.txt … ocr/chunk-NNN.txt` for this document.

### 3d — Assemble structured markdown

For each chunk file (`ocr/chunk-NNN.txt`):
1. Read the raw OCR text.
2. Clean OCR artefacts: fix hyphenation across line breaks, remove stray single characters on otherwise blank lines, correct obvious misspellings introduced by OCR (but do not paraphrase).
3. Infer markdown structure from the text:
   - Top-level section heading → `## Section Title`
   - Subsection → `### Subsection Title`
   - Body paragraphs → plain text paragraphs
   - Detected lists → `- item` or `1. item`
   - Detected tables → Markdown table syntax
   - Formulas / register bit diagrams → preserve verbatim in a fenced code block (` ```text `)
4. Write the result to `ocr/chunk-NNN.clean.md`.

Combine all `*.clean.md` files (in chunk order) into a single assembled file: `$SESSION_DOC_DIR/assembled.md`.

### 3e — Write final doc

1. Determine the chapter number and title from the document (from TOC, filename, or the first heading in `assembled.md`).
2. Choose an output filename: `NN-slug.md` (e.g. `03-memory-management.md`). If unsure, use the source filename slug and ask the user to rename if needed.
3. Write the file to `$SUBJECT_DIR/docs/NN-slug.md` with this frontmatter:
   ```yaml
   ---
   title: "Detected Chapter Title"
   source: "relative/path/to/original-file.pdf"
   session: "20260101-120000"
   ---
   ```
   Followed by the cleaned, structured markdown body.

If a file with the same slug already exists in `docs/`, **do not overwrite** — write to `docs/NN-slug.<session>.md` instead and warn the user.

---

## Step 4 — Update manifest

After all documents are processed, update (or create) `$SUBJECT_DIR/tmp/manifest.json`:
```json
{
  "processed": {
    "relative/path/to/file.pdf": { "session": "20260501-143012", "chunks": 8 }
  }
}
```
Merge with any existing entries — do not replace them.

---

## Step 5 — Summary report

Print a summary:
```
Session: 20260501-143012
Subject: computer-architecture

Processed:
  ✓ Textbook.pdf — 12 chunks → docs/01-introduction.md
  ✓ Conspect.pdf — 5 chunks  → docs/02-fundamentals.md

Skipped (already in manifest):
  • Big-Book-Can-Be-Textbook.pdf (session 20260430-090000)

Docs written: subjects/computer-architecture/docs/
Temp files:   subjects/computer-architecture/tmp/20260501-143012/
```

---

## Important rules

- **Never delete anything in `tmp/`** — every intermediate file is intentionally kept as a processing audit trail.
- **OCR one chunk at a time** — do not dump entire PDFs into tesseract; split first, then OCR each chunk independently.
- **Docs are clean but regeneratable** — the `docs/` output should be good enough to use directly, but the pipeline must be re-runnable from `tmp/` without losing progress.
- **Language**: preserve the source language. Do not translate.
- **Ask before guessing chapter order** — if the document has no TOC or detectable numbering, list the detected headings and ask the user to confirm the order before writing to `docs/`.
