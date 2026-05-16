# /textbook:imagify — Inject visual representations into MDX pages

**Usage:** `/textbook:imagify <locator>`

Scans one or more MDX pages for sections that would benefit from a visual, searches the internet for suitable images (architecture diagrams, bit/register layouts, pipeline schematics, hardware photos, etc.), injects them, and produces a final report.

`$ARGUMENTS` = one of:
- `<subject>` — scan all chapter MDX files for that subject
- `<subject> <NN>` — scan one chapter (e.g. `computer-architecture 07`)
- `<subject> <NN>.<M>` — scan one section within a chapter
- `<subject> <slug>` — scan a named file (e.g. `computer-architecture questions-answers`)

Examples:
- `/textbook:imagify computer-architecture 07`
- `/textbook:imagify computer-architecture 05.3`
- `/textbook:imagify computer-architecture`

---

## Step 0 — Parse arguments

From `$ARGUMENTS` extract:
- **subject**: first token that matches a directory under `subjects/`
- **locator** (optional): next token — one of:
  - `NN` — chapter number, matches filename `NN-*.mdx`
  - `NN.M` — chapter + section number
  - a slug keyword like `questions-answers`, `lab-textbook`
  - absent → all chapter MDX files in the subject

Abort with a clear error if the subject directory does not exist.

---

## Step 1 — Resolve target files and sections

1. Resolve `subjects/<subject>/contents/`.
2. Build the **file list**:
   - If no locator: all `NN-*.mdx` files (exclude `index.mdx`, `questions-answers.mdx`, `lab-textbook.mdx` unless explicitly named).
   - If `NN`: find the single file matching `NN-*.mdx`.
   - If slug: find the file matching `<slug>.mdx`.
3. If a section number (`NN.M`) is given, extract only that section from the resolved file (from the heading to the next equal-or-higher heading). Otherwise process the entire file.
4. Read `subjects/<subject>/contents/sidebar.json` to get chapter titles.

Report the resolved file list to the user before proceeding. For each file, show: filename, title, current visual count (count of `![` image embeds and ` ```mermaid ` blocks). Ask for confirmation if more than 5 files will be processed.

---

## Step 2 — Scan for visual opportunities

For each resolved file/section, perform a structured scan to identify **visual opportunity sites**:

### Opportunity types (in priority order)

| Type | Signal | Notes |
|---|---|---|
| **Bit/register layout** | Text describes a bit-field structure: "bits 31–24", "field X occupies bits N:M", register diagrams described in prose | Highest priority — bit layouts almost always have a better Wikipedia/datasheet image |
| **Architecture block diagram** | Section title or prose describes a hardware unit with named components and connections (e.g. "functional units", "pipeline stages", "bus interface") | Look for connecting words: "connects to", "feeds into", "receives from" |
| **Mermaid block** | Existing ` ```mermaid ``` ` block | Always attempt to replace or supplement with a real image; mermaid is a fallback |
| **Timing / pipeline diagram** | Text describes stage timing, clock cycles, execution phases | Timing diagrams from datasheets or textbooks |
| **Network / topology diagram** | Words: "hypercube", "mesh", "torus", "crossbar", "butterfly", "omega network", "topology" | Interconnect structures |
| **Memory hierarchy / cache** | Words: "cache", "TLB", "hierarchy", "DRAM", "SRAM", structured storage levels | |
| **Named hardware chip / system** | A specific chip or system name is mentioned (e.g. "Cray-1", "Intel i860", "ILLIAC IV") | Historical photos or die shots often available on Wikipedia |
| **Algorithm / data-flow** | A specific algorithm is described step-by-step with data movement between components | |
| **Table of specs** | A table of hardware specs with no accompanying diagram | Consider a comparative chart image if one exists |

### Scan rules

- Extract up to **3 opportunity sites per section** (do not flood a section with images).
- Skip any site that already has an image (`![`) within 15 lines above or below it.
- For `NN.M` (single-section) locators, raise the limit to 5 sites.
- Record for each site: opportunity type, surrounding heading, a 3-line context snippet, and 2–3 candidate search queries.

After scanning, print the opportunity list as a brief log and proceed immediately to Step 3 without waiting for confirmation:

```
File: 05-instruction-pipelining.mdx
  § 3.1 — Същност на зависимостите  [Architecture block diagram]
  § 4.2 — Буфери за преводни адреси  [Bit/register layout]
Searching…
```

---

## Step 3 — Search for images

For each confirmed opportunity site:

1. Run 2–3 web searches using the candidate queries.
2. Evaluate each result for a suitable image:
   - **Preferred sources** (in order): Wikipedia / Wikimedia Commons, official manufacturer documentation (Intel, AMD, ARM, NVIDIA, Cray), IEEE / ACM digital library, university course slides (`.edu` domains), archived textbook publisher sites.
   - **Reject**: search engine thumbnail proxies, CDN URLs with expiry tokens (`?X-Amz-Expires=`, `?token=`, etc.), social media image hosts, low-resolution images (below ~400 px wide).
3. For each candidate image URL:
   - Verify the URL is direct (ends in `.png`, `.jpg`, `.svg`, `.gif`, or is a Wikimedia `thumb` URL).
   - Derive a descriptive alt text from the image caption or surrounding text.
   - Derive a caption sentence (source attribution where possible).
4. If **no suitable image** is found: record the site as "no image found" and leave a `<!-- imagify: <opportunity-type> — no image found, manual review needed -->` comment in the MDX at the insertion point.
5. If a suitable image is found: record `{ file, heading, url, alt_text, caption, opportunity_type, source_domain }`.

---

## Step 4 — Preview and confirm

Present a summary of proposed insertions:

```
Proposed image injections:

05-instruction-pipelining.mdx
  § 3.1 — Data hazard types (RAW/WAR/WAW)
      URL: https://upload.wikimedia.org/wikipedia/commons/…
      Alt: "Pipeline data hazard types — RAW, WAR, WAW illustrated"
      Caption: "Three classes of pipeline data hazards. (Wikimedia Commons)"

  § 4.2 — TLB entry bit layout [NO IMAGE FOUND — will insert comment]

07-vector-processors.mdx
  § 3.1 — Векторен регистров файл
      URL: https://upload.wikimedia.org/wikipedia/commons/…
      ...

Replacing mermaid blocks: 1
New image insertions: 3
Comment placeholders: 1
```

Proceed immediately to Step 5 without waiting for confirmation.

---

## Step 5 — Inject images

For each approved insertion:

### Image injection rules

- **After the nearest paragraph end** following the identified opportunity site (do not break mid-paragraph).
- If the site is a **mermaid block** marked for replacement: remove the mermaid block entirely and place the image in its position (unless the user's approval specified "keep both").
- **Format**:
  ```mdx
  ![<alt_text>](<url>)

  *<caption>*
  ```
  One blank line before, one blank line after.
- **Never** inject inside a code block, table row, or frontmatter.
- If injecting into a specific `NN.M` section: insert within that section only, before the next same-level heading.

For comment placeholders:
```mdx
<!-- imagify: <opportunity_type> — no suitable image found; manual review recommended -->
```

Write each file once after all insertions for that file are assembled (do not write per-insertion).

---

## Step 6 — Final report

Print a structured report:

```
/textbook:imagify report — <subject> — <date>

Files processed: N
  ✓ 05-instruction-pipelining.mdx  — 2 images injected, 0 placeholders
  ✓ 07-vector-processors.mdx       — 1 image injected (replaced mermaid), 1 placeholder
  ~ 08-simd-processors.mdx         — 0 injections (no opportunities found)

Images injected (N total):
  [§ heading]  <url>
  ...

Mermaid blocks replaced: N

Placeholders left for manual review:
  05-instruction-pipelining.mdx § 4.2 — TLB entry bit layout (bit/register layout)
  ...

Sources used:
  upload.wikimedia.org  — N images
  <domain>              — N images
```

---

## Rules

- **Stable URLs only.** Do not embed URLs containing expiry tokens, query-string auth parameters, or search engine thumbnail proxies. Wikipedia `thumb` URLs (`commons/thumb/…`) are acceptable.
- **No fabricated alt text.** Alt text and captions must be derived from the actual image content or its source page title/caption — do not invent descriptions.
- **Surgical injection.** Only touch the identified insertion points. Do not reformat surrounding content, fix typos, or alter headings.
- **Language consistency.** Captions should match the language of the surrounding content (Bulgarian for Bulgarian pages).
- **3-site cap per section.** Never inject more than 3 images per top-level section (`## heading`).
- **No confirmation gates.** Log opportunities and proposed injections, then write immediately — do not pause to ask for approval.
- **Do not replace images.** If a site already has a real image (`![`) nearby, skip it entirely — do not attempt to upgrade it.
- **Mermaid is a last resort.** Do not create new mermaid blocks as part of this command. If no image is found, leave a comment placeholder instead.
