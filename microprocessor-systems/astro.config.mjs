// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaid from 'rehype-mermaid';
import { readFileSync } from 'node:fs';

const sidebar = JSON.parse(
  readFileSync(new URL('./src/data/sidebar.json', import.meta.url), 'utf-8')
);

export default defineConfig({
  integrations: [
    starlight({
      title: 'Микропроцесорни системи',
      description: 'Образователен курс по микропроцесорни системи — ТУ Варна, специалност КСТ',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Български', lang: 'bg' },
      },
      social: [],
      customCss: ['./src/styles/custom.css'],
      sidebar,
    }),
  ],
  markdown: {
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: 'inline-svg',
        mermaidConfig: {
          theme: 'neutral',
          themeVariables: {
            fontSize: '14px',
          },
        },
      }],
    ],
  },
});
