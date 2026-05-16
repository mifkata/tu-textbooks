# tu-schoolbooks

Educational course material pipeline: source documents → structured markdown → Astro websites.

## Structure

```
tu-schoolbooks/
├── subjects/              ← subject workspaces (primary)
│   └── <name>/
│       ├── source/        ← raw input: PDF, DOCX, images
│       ├── tmp/           ← intermediate OCR work (never deleted)
│       └── docs/          ← final clean markdown
└── microprocessor-systems/ ← legacy Astro project
```

## Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `pnpm dev`     | Start Astro dev server             |
| `pnpm build`   | Build the Astro site               |
| `pnpm preview` | Preview the production build       |
| `pnpm check`   | Lint and format check (no changes) |
| `pnpm fix`     | Auto-fix lint and format issues    |

## Code Quality

Pre-commit hook runs lint-staged automatically on staged files.

- **ESLint** — TypeScript + Astro rules
- **Prettier** — formatting for `.astro`, `.ts`, `.js`, `.css`, `.json`, `.md`, `.mdx`
