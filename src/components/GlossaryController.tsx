import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import GlossaryPopup, { type GlossaryEntry } from './GlossaryPopup';

type PopupState = { entry: GlossaryEntry; anchor: DOMRect } | null;

const SKIP_TAGS = new Set([
  'CODE', 'PRE', 'A', 'BUTTON',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'SCRIPT', 'STYLE',
]);

function buildIndex(entries: GlossaryEntry[]) {
  const valid = entries.filter(e => e.abbr.length > 1);
  valid.sort((a, b) => b.abbr.length - a.abbr.length || b.full.length - a.full.length);

  const byAbbr = new Map<string, GlossaryEntry>();
  const byFull = new Map<string, GlossaryEntry>();
  for (const e of valid) {
    byAbbr.set(e.abbr, e);
    byFull.set(e.full.toLowerCase(), e);
  }

  const patterns = [
    ...[...byAbbr.keys()].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    ...[...byFull.keys()].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  ];
  if (!patterns.length) return null;

  const regex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
  return { regex, byAbbr, byFull };
}

type Index = NonNullable<ReturnType<typeof buildIndex>>;

export default function GlossaryController() {
  const [popup, setPopup] = useState<PopupState>(null);
  const [pinned, setPinned] = useState(false);
  const pinnedRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback((delay = 200) => {
    if (pinnedRef.current) return;
    clearClose();
    closeTimer.current = setTimeout(() => setPopup(null), delay);
  }, [clearClose]);

  const showPopup = useCallback((entry: GlossaryEntry, anchor: DOMRect) => {
    clearClose();
    setPopup({ entry, anchor });
  }, [clearClose]);

  useEffect(() => {
    function processTextNode(node: Text, index: Index): Node[] | null {
      const text = node.textContent ?? '';
      index.regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      let last = 0;
      const parts: Node[] = [];

      while ((match = index.regex.exec(text)) !== null) {
        const matchText = match[0];
        const lower = matchText.toLowerCase();
        const entry = index.byAbbr.get(matchText) ?? index.byFull.get(lower);
        if (!entry) continue;

        if (match.index > last) {
          parts.push(document.createTextNode(text.slice(last, match.index)));
        }

        const btn = document.createElement('button');
        btn.className = 'gl-term';
        btn.dataset.gid = entry.id;
        btn.textContent = matchText;
        btn.addEventListener('mouseenter', () => showPopup(entry, btn.getBoundingClientRect()));
        btn.addEventListener('mouseleave', () => scheduleClose());
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const next = !pinnedRef.current;
          pinnedRef.current = next;
          setPinned(next);
          setPopup({ entry, anchor: btn.getBoundingClientRect() });
        });
        parts.push(btn);
        last = match.index + matchText.length;
      }

      if (!parts.length) return null;
      if (last < text.length) parts.push(document.createTextNode(text.slice(last)));
      return parts;
    }

    function scanContent(index: Index) {
      const container = document.querySelector('.sl-markdown-content');
      if (!container) return;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          let p = node.parentElement;
          while (p && p !== container) {
            if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
            p = p.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      const toReplace: Array<{ node: Text; parts: Node[] }> = [];
      let current: Text | null;
      while ((current = walker.nextNode() as Text | null)) {
        const parts = processTextNode(current, index);
        if (parts) toReplace.push({ node: current, parts });
      }

      for (const { node, parts } of toReplace) {
        const frag = document.createDocumentFragment();
        for (const p of parts) frag.appendChild(p);
        node.parentNode?.replaceChild(frag, node);
      }
    }

    function init() {
      fetch('/glossary-index.json')
        .then(r => r.json())
        .then((entries: GlossaryEntry[]) => {
          const index = buildIndex(entries);
          if (index) scanContent(index);
        })
        .catch(() => {});
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(init, { timeout: 2000 });
    } else {
      setTimeout(init, 50);
    }
  }, [showPopup, scheduleClose]);

  if (!popup) return null;

  return createPortal(
    <GlossaryPopup
      entry={popup.entry}
      anchor={popup.anchor}
      pinned={pinned}
      onClose={() => { pinnedRef.current = false; setPinned(false); setPopup(null); }}
      onMouseEnter={clearClose}
      onMouseLeave={scheduleClose}
    />,
    document.body
  );
}
