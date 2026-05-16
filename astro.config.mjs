import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import rehypeMermaid from 'rehype-mermaid';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const subjectsRoot = fileURLToPath(new URL('./subjects', import.meta.url));

function loadSubjectSidebar(name) {
  const path = join(subjectsRoot, name, 'contents', 'sidebar.json');
  if (!existsSync(path)) return [];
  const groups = JSON.parse(readFileSync(path, 'utf-8'));
  return groups.map(group => ({
    ...group,
    items: group.items.map(item => ({
      ...item,
      slug: `${name}/${item.slug}`,
    })),
  }));
}

const subjectNames = readdirSync(subjectsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(subjectsRoot, d.name, 'contents', 'sidebar.json')))
  .map(d => d.name)
  .sort();

const sidebar = [
  {
    label: 'Начало',
    items: [
      { slug: 'index', label: 'Всички предмети' },
      { label: 'Справочник на термините', link: '/glossary/' },
    ],
  },
  ...subjectNames.flatMap(name => loadSubjectSidebar(name)),
];

export default defineConfig({
  integrations: [
    starlight({
      title: 'ТУ Варна — Учебни материали',
      description: 'Курсови материали по технически дисциплини — ТУ Варна',
      defaultLocale: 'root',
      locales: { root: { label: 'Български', lang: 'bg' } },
      social: [],
      customCss: ['./src/styles/custom.css'],
      sidebar,
      components: {
        Footer: './src/overrides/Footer.astro',
      },
    }),
    react(),
  ],
  markdown: {
    rehypePlugins: [[rehypeMermaid, {
      strategy: 'inline-svg',
      mermaidConfig: { theme: 'neutral', themeVariables: { fontSize: '14px' } },
    }]],
  },
  vite: {
    resolve: { alias: { '@/': new URL('./src/', import.meta.url).pathname } },
  },
});
