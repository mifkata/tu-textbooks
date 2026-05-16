import type { APIRoute } from 'astro';
import asmData from '../glossary/glossary-asm-index.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(asmData), {
    headers: { 'Content-Type': 'application/json' },
  });
