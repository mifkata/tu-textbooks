import type { APIRoute } from 'astro';
import glossaryData from '../glossary/glossary-index.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(glossaryData), {
    headers: { 'Content-Type': 'application/json' },
  });
