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

## Deployment (Cloudflare Pages)

Infrastructure is managed with Terraform in `terraform/`.

### Required API token permissions

Create a token at **Cloudflare Dashboard → My Profile → API Tokens → Create Token**:

| Permission | Type | Scope |
|---|---|---|
| Cloudflare Pages: Edit | Account | Your account |
| Zone: DNS: Edit | Zone | `mifkata.com` |

### Setup

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# fill in cloudflare_account_id, cloudflare_zone_id, github_owner, github_repo
export TF_VAR_cloudflare_api_token="your-api-token"
terraform init
terraform plan
terraform apply
```

The apply creates the Pages project connected to GitHub, binds `textbooks.mifkata.com`, and adds the DNS CNAME record. Subsequent pushes to `main` deploy automatically via the GitHub integration.

---

## Code Quality

Pre-commit hook runs lint-staged automatically on staged files.

- **ESLint** — TypeScript + Astro rules
- **Prettier** — formatting for `.astro`, `.ts`, `.js`, `.css`, `.json`, `.md`, `.mdx`
