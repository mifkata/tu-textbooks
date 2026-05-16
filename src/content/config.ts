import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

export const collections = {
  docs: defineCollection({
    loader: glob({
      pattern: [
        'subjects/*/contents/**/*.{md,mdx}',
        'src/content/docs/**/*.{md,mdx}',
      ],
      base: repoRoot,
      generateId: ({ entry }) => {
        if (entry.startsWith('subjects/')) {
          return entry
            .replace(/^subjects\//, '')
            .replace('/contents/', '/')
            .replace(/\.(md|mdx)$/, '');
        }
        return entry
          .replace(/^src\/content\/docs\//, '')
          .replace(/\.(md|mdx)$/, '');
      },
    }),
    schema: docsSchema(),
  }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
};
