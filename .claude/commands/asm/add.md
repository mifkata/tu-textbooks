# /asm:add — Add entries to the ASM glossary

**Usage:** `/asm:add <mnemonics> [message]`

Adds one or more x86 assembly mnemonic entries to `src/glossary/glossary-asm-index.json`.

`$ARGUMENTS` contains everything after the command name.

---

## Step 0 — Parse arguments

From `$ARGUMENTS` extract:
- **mnemonics**: one or more space-separated uppercase mnemonics (e.g. `FMUL FSUB` or `MOVAPS`)
- **message**: any remaining text after the mnemonics — optional hint about the description or sample

---

## Step 1 — Load existing index and check for duplicates

Read `src/glossary/glossary-asm-index.json`.

For each mnemonic in the list:
- Check if an entry with that `mnemonic` already exists (case-insensitive).
- If it exists: display the current entry and ask whether to skip or replace it. Do not silently overwrite.

---

## Step 2 — Infer entry fields

For each new mnemonic, construct the entry using your knowledge of the x86/x86-64 ISA, enriched by the optional user `message`:

- **`id`**: lowercase slug of the mnemonic with non-alphanumeric characters replaced by `-`
  (e.g. `MOVAPS` → `movaps`, `CMPXCHG8B` → `cmpxchg8b`, `CMOVcc` → `cmovcc`)
- **`mnemonic`**: the canonical uppercase form as it appears in Intel/AMD documentation
  (e.g. `MOVAPS`, `CMOVcc`, `SETcc`). For families (Jcc, SETcc, CMOVcc) use the `cc` suffix convention.
- **`description`**: a concise 1–2 sentence Bulgarian technical description, matching the style of
  existing entries in the file. Include operand semantics, affected flags if relevant, and any
  notable constraints (e.g. privilege level, alignment requirement). Do not translate mnemonic names —
  keep them as-is (e.g. `Bit Scan Forward`). English technical terms appear verbatim.
- **`sample`**: a minimal 1-line (or at most 2-line) call example using representative operands in
  Intel syntax. If the instruction needs two lines for clarity (e.g. `CPUID` requires loading EAX
  first), use `\n` between lines and add an inline comment. Examples:
  - `"MOV EAX, [EBX+4]"`
  - `"IMUL EAX, EBX, 5"`
  - `"MOV EAX, 1\nCPUID       ; feature flags → EDX"`

Show the proposed entry (or entries) to the user before writing anything. If the user provides
corrections, apply them.

---

## Step 3 — Write to the ASM index

After user confirmation:

1. Read `src/glossary/glossary-asm-index.json`.
2. Append the new entry (or entries).
3. Sort all entries alphabetically by `mnemonic` (case-insensitive, A–Z).
4. Write the updated array back to `src/glossary/glossary-asm-index.json` with 2-space indentation.

Report: `✓ Added: <MNEMONIC> — <first sentence of description>` for each entry written.

---

## Rules

- **Bulgarian descriptions, Intel syntax samples.** Description language matches the existing entries
  (Bulgarian). Samples use Intel/NASM syntax (destination first).
- **No fabrication.** Description must reflect real x86 behavior. If you are uncertain about a
  detail (e.g. flag behavior for an obscure instruction), note the uncertainty and ask the user.
- **No duplicate `mnemonic`** entries: if one exists, surface it and ask before replacing.
- **Confirm before writing**: always show the constructed entry and wait for approval.
- **Multiple mnemonics**: process all in sequence within a single invocation.
