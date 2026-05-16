# /glossary:refine — Improve an existing glossary entry

**Usage:** `/glossary:refine <abbr> [instructions]`

Refines the definition of an existing term in `src/glossary/glossary-index.json`:
improves the description, expands the full name if needed, and discovers new mentions
across all subject content.

`$ARGUMENTS` contains the abbreviation followed by optional refinement instructions.

---

## Step 0 — Parse arguments

From `$ARGUMENTS`:
- **abbr**: first token (the abbreviation to refine, e.g. `CR0`, `CISC`)
- **instructions**: remaining text — free-form guidance on how to improve the entry
  (e.g. `"add reference to CISC commands on Wikipedia"`, `"improve description clarity"`)

---

## Step 1 — Load and locate the entry

Read `src/glossary/glossary-index.json`.

Find the entry whose `abbr` matches (case-insensitive). If not found:
- List entries whose `abbr` starts with the given prefix as suggestions.
- Abort with a clear error message.

Display the current entry to the user.

---

## Step 2 — Scan ALL subjects for new references

Regardless of what `mentions` already exist, perform a fresh scan across every subject:

For each directory under `subjects/` that has `contents/sidebar.json`:
1. Search `.mdx` and `.md` files under `contents/` and `docs/`:
   ```bash
   grep -rn "\b<ABBR>\b" subjects/<subject>/contents/ subjects/<subject>/docs/ 2>/dev/null
   ```
2. For each matching file, collect ±3 lines of context around each hit.
3. Resolve the chapter slug and title from `subjects/<subject>/contents/sidebar.json`.
4. Strip Roman numeral prefix from titles (e.g. `"Системна архитектура"` not `"V — Системна архитектура"`).
5. Deduplicate refs by slug within each subject.

Build an updated `mentions` array from the fresh scan results. Compare with the existing `mentions`:
- Report any **new** refs found that weren't previously listed.
- Report any **stale** refs that are in the existing entry but were not found in the scan.

---

## Step 3 — Apply instructions and improve the entry

Using the fresh context snippets and the user's `instructions`:

**Always do:**
- Re-read all context snippets and check whether `full` (expanded name) is accurate and complete.
- Check whether `description` can be made more precise or informative given the content found.
- Update `mentions` to the fresh scan result (add new refs, keep or remove stale ones based on whether the file still exists and contains the term).

**If instructions mention an external source** (e.g. "Wikipedia", a URL, a book name):
- If a URL is provided by the user, fetch it and extract relevant information to enrich the description.
- Do not invent URLs — only use ones explicitly provided in the instructions.
- Note any externally sourced additions in your confirmation message.

**If instructions say to improve clarity / description:**
- Rewrite `description` to be more concise, accurate, and technically precise. Keep it 1–3 sentences.
- Language must match the existing entry's language.

**If instructions add a new full-name variant or disambiguation:**
- Update `full` accordingly.
- If the same abbreviation has different meanings in different subjects, add a `note` field:
  ```json
  "note": "В контекст на X означава ...; в контекст на Y означава ..."
  ```

---

## Step 4 — Show diff and confirm

Present the proposed changes as a clear before/after:

```
BEFORE:
  full: "..."
  description: "..."
  mentions: [...]

AFTER:
  full: "..."
  description: "..."
  mentions: [...]
  (+ 2 new refs, - 0 stale refs)
```

Ask the user to confirm, request changes, or cancel.

---

## Step 5 — Write updated entry

After confirmation:

1. Replace the entry in the loaded glossary array (match by `id` or `abbr`).
2. Re-sort: primary by `letter` (A–Z, `µ` last), secondary by `abbr`.
3. Write back to `src/glossary/glossary-index.json` with 2-space indentation and `ensure_ascii=False`.

Report: `✓ Refined: <ABBR> — <full>`

---

## Rules

- **Scan all subjects every time** — do not rely solely on the existing `mentions` list.
- **Never fabricate**: improvements must come from scanned content or user-provided sources.
- **Confirm before writing**: always show the diff and wait for approval.
- **Language**: preserve the entry's existing language (Bulgarian or English).
- **Do not remove refs without evidence**: only mark a ref as stale if the file exists but the term genuinely no longer appears in it.
