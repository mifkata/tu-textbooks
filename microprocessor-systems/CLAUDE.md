# CLAUDE.md — Instructions for the MPS Website

> **Content language:** All website content (pages, glossary, Q&A) must be written in **Bulgarian**.

## Project Context

Educational website for the **"Microprocessor Systems"** course at TU Varna (KST program, FITA faculty).
Source materials are in `./docs/guide/*.md` (14 chapters + glossary).

---

## Tech Stack

- **Astro** + **@astrojs/starlight** (documentation site)
- **MDX** for all pages (`.mdx`)
- **rehype-mermaid** with `strategy: 'inline-svg'` — Mermaid diagrams are rendered to SVG at build time
- **Bulgarian i18n** — `src/content/i18n/bg.json` — translates Starlight UI strings
- Dev: `npm run dev` (port 4321) · Build: `npm run build`

---

## File Structure

```
web/
├── astro.config.mjs          ← sidebar navigation + rehype-mermaid config
├── src/
│   ├── content/
│   │   ├── config.ts         ← docsSchema + i18nSchema
│   │   ├── i18n/bg.json      ← UI translations (On this page, Search, ...)
│   │   └── docs/
│   │       ├── index.mdx     ← landing page (splash template)
│   │       ├── 01-history.mdx  … 14-interrupt-controllers.mdx
│   │       ├── glossary.mdx
│   │       ├── questions-answers.mdx
│   │       └── exam-answers.mdx
│   └── styles/custom.css
└── CLAUDE.md                 ← this file
```

Source materials (reference only, do not edit):
```
./docs/guide/01_history_x86.md … 14_interrupt_controllers.md
./docs/guide/glossary.md
```

---

## Content Conventions

### Frontmatter
```mdx
---
title: "Глава IV — Програмен модел и система команди на x86 микропроцесорите"
---
```

### Glossary Links
Links to the glossary use the term's anchor ID:
```mdx
[DPL](/glossary/#dpl)
[IRQ](/glossary/#irq)
```
Anchor IDs are defined in `glossary.mdx` as `<a id="dpl">**DPL**</a>`.

### Flag and Register Links
Flags described in chapter 5 are linked like this:
```mdx
[CR0.PG](/05-system-architecture/)
[EFLAGS.IF](/05-system-architecture/)
```

### Mermaid Diagrams
Standard ` ```mermaid ` blocks. Theme is `neutral`.
When a diagram is requested → **first search for a public image** from Wikimedia Commons or another reliable source. Mermaid is the fallback.

### Web Images

**Required:** Images must be downloaded locally and stored in `src/assets/images/`. Never use direct external URLs in MDX pages.

Preferred sources (accessible without auth):
- `https://upload.wikimedia.org/wikipedia/commons/...` — Wikipedia/Wikimedia (CC license)
- `https://www.eeeguide.com/wp-content/uploads/...` — eeeguide.com (educational diagrams)

**Workflow:**
1. Find a suitable image
2. Preview visually with WebFetch + Read tool
3. Download locally: `curl -o src/assets/images/filename.png "URL"`
4. Verify the file with Read tool (displayed visually)
5. Reference in MDX with a relative path

Example in MDX:
```mdx
import imgProtectedMode from '../../assets/images/protected-mode-segments.png';

<img src={imgProtectedMode.src} alt="Description" />
```

or (for simpler cases):
```mdx
![Description](../../assets/images/protected-mode-segments.png)
```

---

## Chapter Editing Rules

1. **Do not change structure** (section headings) without explicit request
2. **Sync with the syllabus** — section headings must match the official course outline
3. **Do not add comments** in MDX (unless truly necessary)
4. **Exam summary** (`## Резюме за изпита`) is present at the end of every chapter — keep it up to date when making changes
5. When editing MDX files with Cyrillic using the Edit tool, `old_string` must match exactly. On failure, use Python:
   ```bash
   python3 -c "
   with open('path.mdx', 'r', encoding='utf-8') as f: c = f.read()
   c = c.replace('OLD', 'NEW')
   with open('path.mdx', 'w', encoding='utf-8') as f: f.write(c)
   "
   ```

---

## Glossary (glossary.mdx)

- Every new abbreviation added in a chapter must also be added to the glossary
- Entry format:
  ```mdx
  | <a id="xxx">**XXX**</a> | Full name | Description | [Ch. N](/NN-slug/) |
  ```
- Glossary is sorted alphabetically (Latin alphabet)

---

## Sidebar (astro.config.mjs)

When adding a new page, add it to the `sidebar` in the correct group:
```js
{ slug: 'new-page', label: 'Title' }
```
Groups: Начало · Архитектура · Типове данни · Системна архитектура · Управление на паметта · Прекъсвания и задачи · Шина DMA I/O · Мултипроцесорни системи · Справка

---

## Known Issues / Solutions

| Problem | Solution |
|---------|---------|
| Edit tool can't find Cyrillic `old_string` | Use Python with UTF-8 |
| Mermaid diagram doesn't render | Check syntax in [Mermaid Live Editor](https://mermaid.live) |
| Image from eeeguide.com doesn't load | eeeguide URLs are stable; verify with curl if issues arise |
| `tableOfContents.onThisPage` and similar UI strings | Ensure `src/content/i18n/bg.json` exists and is added to `config.ts` as `i18nSchema` |

---

## What's Done (context)

- ✅ All 14 chapters + glossary converted from Markdown to MDX
- ✅ Glossary links (`/glossary/#term`) added throughout
- ✅ Bulgarian i18n: `src/content/i18n/bg.json` + `config.ts`
- ✅ `questions-answers.mdx` — answers to all questions from all chapters
- ✅ `exam-answers.mdx` — answers to Variant №4 (10 essays)
- ✅ Chapter 11 expanded: T1/T2/Ti phases, HOLD/HLDA, Pentium pipelining, MTRR
- ✅ Chapter 9 expanded: full 9-step interrupt cycle
- ✅ Images added: 8237A (DMA), 8259A (PIC), SMP, Protected mode segments
- ✅ Chapter 4: clearer explanations, ASCII register diagrams, ModR/M and SIB examples
- ✅ Chapter 5: restored to original concise form; EFLAGS table without bit numbers
- ✅ Chapter 6: added TR/TSS explanation; segment selector with examples; translation diagram
- ✅ Chapter 7: explanation of hierarchical paging with analogy

---

## Response Style

- Respond in **Bulgarian**
- Be concise and specific in explanations
- For images — **download locally** to `src/assets/images/`, verify with Read tool, then reference in MDX with a local path (never direct external URLs)
- If something can't be found publicly, say so directly instead of promising it
