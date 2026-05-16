# /asm:refine — Improve an existing ASM glossary entry

**Usage:** `/asm:refine <mnemonic> [instructions]`

Refines an existing entry in `src/glossary/glossary-asm-index.json`: improves the description,
corrects or enriches the sample, or applies any user-specified change.

`$ARGUMENTS` contains the mnemonic followed by optional refinement instructions.

---

## Step 0 — Parse arguments

From `$ARGUMENTS`:
- **mnemonic**: first token (the mnemonic to refine, e.g. `CPUID`, `CMPXCHG`, `SETcc`)
- **instructions**: remaining text — free-form guidance (e.g. `"add note about 64-bit form"`,
  `"sample should show the lock prefix"`, `"description is too brief"`)

If `instructions` is empty, do a general quality pass (see Step 2).

---

## Step 1 — Load and locate the entry

Read `src/glossary/glossary-asm-index.json`.

Find the entry whose `mnemonic` matches (case-insensitive). If not found:
- List entries whose `mnemonic` starts with the given prefix as suggestions.
- Abort with a clear error.

Display the current entry in full.

---

## Step 2 — Apply instructions and improve the entry

**Always do (general quality pass):**
- Check whether `description` is accurate, complete, and consistent in style with other entries.
  One to two sentences; mentions affected flags where relevant; uses Bulgarian prose with English
  technical terms verbatim.
- Check whether `sample` clearly demonstrates the instruction with real operand types. If the
  existing sample is trivial or missing important context, propose a better one.
- Check whether `id` is the correct lowercase slug of the mnemonic.

**If instructions mention a specific change:**

- *"fix sample"* / *"better sample"*: propose an improved 1–2 line Intel-syntax example that
  better shows the instruction's main use case or a non-obvious but common pattern.
- *"add note about X"*: append the note to `description` without making it overly long. Keep total
  description to 1–3 sentences.
- *"64-bit form"* / *"REX prefix"* / encoding variant: add a brief mention of the variant in the
  description; update sample if the 64-bit form differs meaningfully.
- *"flag behavior"*: explicitly list which flags are set/cleared/undefined if not already mentioned.
- Any other free-form instruction: apply it using your knowledge of the x86 ISA, then confirm.

**Do not:**
- Change the `mnemonic` field (it is the canonical Intel/AMD name).
- Add fields that don't exist in the schema (`id`, `mnemonic`, `description`, `sample` only).
- Translate the mnemonic or English technical terms into Bulgarian.

---

## Step 3 — Show diff and confirm

Present the proposed changes clearly:

```
BEFORE:
  description: "..."
  sample: "..."

AFTER:
  description: "..."
  sample: "..."
```

If only one field changes, show only that field. Ask the user to confirm, request further changes,
or cancel.

---

## Step 4 — Write updated entry

After confirmation:

1. Replace the entry in the loaded array (match by `id` or `mnemonic`).
2. Re-sort alphabetically by `mnemonic` (case-insensitive).
3. Write back to `src/glossary/glossary-asm-index.json` with 2-space indentation.

Report: `✓ Refined: <MNEMONIC>`

---

## Rules

- **Confirm before writing**: always show the diff and wait for approval.
- **Never fabricate**: improvements must reflect real x86 behavior. Note uncertainty rather than invent.
- **Style consistency**: description tone and sample syntax must match the existing entries in the file.
- **Do not remove the `sample` field**: if the current sample is wrong, replace it — never delete it.
