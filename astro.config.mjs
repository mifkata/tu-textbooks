import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import rehypeMermaid from 'rehype-mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const subjectsRoot = fileURLToPath(new URL('./subjects', import.meta.url));

function loadSubjectSidebar(name) {
  const path = join(subjectsRoot, name, 'contents', 'sidebar.json');
  if (!existsSync(path)) return [];
  const groups = JSON.parse(readFileSync(path, 'utf-8'));

  let label = name;
  const indexPath = join(subjectsRoot, name, 'contents', 'index.mdx');
  if (existsSync(indexPath)) {
    const m = readFileSync(indexPath, 'utf-8').match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (m) label = m[1];
  }

  // Drop the "Начало" group (single index link) — replaced by a direct link with the subject name.
  const contentGroups = groups.filter(
    g => !(g.items?.length === 1 && g.items[0].slug === 'index')
  );

  const prefixed = contentGroups.map(group => ({
    ...group,
    items: group.items.map(item => ({ ...item, slug: `${name}/${item.slug}` })),
  }));

  return [{ label, collapsed: true, items: [{ label, link: `/${name}/` }, ...prefixed] }];
}

const subjectNames = readdirSync(subjectsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(subjectsRoot, d.name, 'contents', 'sidebar.json')))
  .map(d => d.name)
  .sort();

const sidebar = [
  ...subjectNames.flatMap(name => loadSubjectSidebar(name)),
];

export default defineConfig({
  site: 'https://textbooks.mifkata.com',
  integrations: [
    starlight({
      title: 'mifkata.textbooks',
      description: 'Помощни учебни материали по технически дисциплини в Технически университет - Варна',
      defaultLocale: 'root',
      locales: { root: { label: 'Български', lang: 'bg' } },
      social: [],
      customCss: ['./src/styles/custom.css', 'katex/dist/katex.min.css'],
      sidebar,
      components: {
        Footer: './src/overrides/Footer.astro',
        Header: './src/overrides/Header.astro',
        Sidebar: './src/overrides/Sidebar.astro',
      },
    }),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      [rehypeMermaid, {
        strategy: 'inline-svg',
        mermaidConfig: { theme: 'neutral', themeVariables: { fontSize: '14px' } },
      }],
    ],
  },
  vite: {
    resolve: {
      alias: { '@/': new URL('./src/', import.meta.url).pathname },
      dedupe: ['react', 'react-dom'],
    },
  },
});
