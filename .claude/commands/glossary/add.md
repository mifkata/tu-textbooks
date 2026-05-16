# /glossary:add — Add terms to the global glossary index

**Usage:** `/glossary:add <terms> [-s <subject|all>] [message]`

Adds one or more new abbreviation terms to `src/glossary/glossary-index.json` by scanning
subject content files for references, then writing a well-formed entry.

`$ARGUMENTS` contains everything after the command name.

---

## Step 0 — Parse arguments

From `$ARGUMENTS` extract:
- **terms**: one or more space-separated uppercase abbreviations before the `-s` flag (e.g. `CR0 CISC`)
- **subjects**: value after `-s` flag — a subject name (e.g. `microprocessor-systems`) or `all`
- **message**: any remaining text after the known flags (optional user hint for descriptions)

If `-s` is absent:
1. List all directories under `subjects/` that have a `contents/sidebar.json`.
2. Present the list to the user and ask them to specify which subject(s) to scan.
3. Stop until the user replies — do not guess.

---

## Step 1 — Resolve subjects to scan

- If subjects = `all`: collect every directory under `subjects/` that has `contents/sidebar.json`.
- Otherwise: validate the named subject exists; abort with a clear error if not.

Build `SUBJECT_LIST` = list of subject directory names to scan.

---

## Step 2 — Load existing glossary and check for duplicates

Read `src/glossary/glossary-index.json`.

For each term in the terms list:
- Check if an entry with that `abbr` already exists (case-insensitive).
- If it exists: report it to the user, show the current entry, and ask whether to skip or update it. Do not silently overwrite.

---

## Step 3 — Scan subject content for references

For each subject in `SUBJECT_LIST`, for each term:

1. List all `.mdx` and `.md` files under `subjects/<subject>/contents/` and `subjects/<subject>/docs/`.
2. Search for occurrences of the term using case-sensitive grep:
   ```bash
   grep -rn "\b<TERM>\b" subjects/<subject>/contents/ subjects/<subject>/docs/ 2>/dev/null
   ```
3. For each file with a hit:
   - Read the surrounding context (±3 lines) around each occurrence.
   - Look up the chapter slug and title from `subjects/<subject>/contents/sidebar.json` by matching the filename to a sidebar item slug.
   - Record: `{ subject, slug, title, context_snippets[] }`.
4. Collect all matching refs across all subjects.

If no hits are found in any subject: warn the user that the term was not found in the scanned content. Ask whether to add it anyway (without mentions) or skip it.

---

## Step 4 — Infer entry fields

Using the context snippets collected in Step 3, plus the optional user `message`, infer:

- **`full`**: the expanded form of the abbreviation (e.g. `CR0` → `Control Register 0`). Look for patterns like "CR0 (Control Register 0)", "Control Register 0 — CR0", or surrounding descriptive text. If ambiguous, ask the user.
- **`description`**: a concise one-to-two sentence technical description in the same language as the surrounding content. Use the context snippets as the primary source; do not fabricate details not present in the source.
- **`letter`**: first character of `abbr` (uppercase). Use `µ` for micro-prefixed terms.
- **`id`**: lowercase slug of `abbr` with non-alphanumeric characters replaced by `-` (e.g. `ADS#` → `ads-`, `CR0` → `cr0`).
- **`mentions`**: grouped by subject, deduped by slug:
  ```json
  [{ "subject": "<name>", "refs": [{ "title": "<chapter title without roman numeral prefix>", "slug": "<slug>" }] }]
  ```
  Chapter titles must have the Roman numeral prefix stripped (e.g. `"Системна архитектура"` not `"V — Системна архитектура"`).

Show the inferred entry to the user. Write immediately without asking for confirmation.

---

## Step 5 — Write to glossary index

1. Read `src/glossary/glossary-index.json`.
2. Append the new entry (or entries if multiple terms were given).
3. Sort all entries: primary by `letter` (A–Z, `µ` last), secondary by `abbr` alphabetically.
4. Write the updated array back to `src/glossary/glossary-index.json` with 2-space indentation and `ensure_ascii=False`.

Report: `✓ Added: <ABBR> — <full>` for each term written.

---

## Step 6 — Check for MDX import updates (optional)

If any subject content files (`contents/*.mdx`) reference the new term in a way that should
link to the glossary (e.g. it appears in prose without already being a glossary link), note those
files to the user so they can decide whether to update the MDX. Do not auto-edit MDX files.

---

## Rules

- **Never fabricate**: descriptions and full names must come from the scanned content or the user's message. If the content is ambiguous, ask.
- **No duplicate `abbr`** entries: if one exists, surface it and ask before replacing.
- **Language**: preserve the language of the source content. Bulgarian descriptions for Bulgarian content, English for English.
- **No confirmation required**: show the constructed entry, then write immediately.
- **Multiple terms**: process all terms in sequence within a single command invocation.
