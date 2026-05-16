import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import GlossaryPopup, { type GlossaryEntry } from './GlossaryPopup';
import AsmPopup, { type AsmEntry } from './AsmPopup';

type PopupState = { entry: GlossaryEntry; anchor: DOMRect } | null;
type AsmPopupState = { entry: AsmEntry; anchor: DOMRect } | null;

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

function buildAsmIndex(entries: AsmEntry[]) {
  const byMnemonic = new Map<string, AsmEntry>();
  for (const e of entries) byMnemonic.set(e.mnemonic, e);

  const patterns = [...byMnemonic.keys()].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!patterns.length) return null;

  // No 'i' flag — uppercase-only matching
  const regex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'g');
  return { regex, byMnemonic };
}

type Index = NonNullable<ReturnType<typeof buildIndex>>;
type AsmIndex = NonNullable<ReturnType<typeof buildAsmIndex>>;

function makeTreeWalker(container: Element) {
  return document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentElement;
      while (p && p !== container) {
        if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
}

export default function GlossaryController() {
  // ── Glossary popup state ─────────────────────────────────────────────────
  const [popup, setPopup] = useState<PopupState>(null);
  const [pinned, setPinned] = useState(false);
  const pinnedRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = useCallback(() => {
    if (closeTimer.current !== null) { clearTimeout(closeTimer.current); closeTimer.current = null; }
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

  // ── ASM popup state ──────────────────────────────────────────────────────
  const [asmPopup, setAsmPopup] = useState<AsmPopupState>(null);
  const [asmPinned, setAsmPinned] = useState(false);
  const asmPinnedRef = useRef(false);
  const asmCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAsmClose = useCallback(() => {
    if (asmCloseTimer.current !== null) { clearTimeout(asmCloseTimer.current); asmCloseTimer.current = null; }
  }, []);

  const scheduleAsmClose = useCallback((delay = 200) => {
    if (asmPinnedRef.current) return;
    clearAsmClose();
    asmCloseTimer.current = setTimeout(() => setAsmPopup(null), delay);
  }, [clearAsmClose]);

  const showAsmPopup = useCallback((entry: AsmEntry, anchor: DOMRect) => {
    clearAsmClose();
    setAsmPopup({ entry, anchor });
  }, [clearAsmClose]);

  // ── DOM scanning ─────────────────────────────────────────────────────────
  useEffect(() => {
    function scanGlossary(index: Index) {
      const container = document.querySelector('.sl-markdown-content');
      if (!container) return;
      const walker = makeTreeWalker(container);
      const toReplace: Array<{ node: Text; parts: Node[] }> = [];
      let current: Text | null;

      while ((current = walker.nextNode() as Text | null)) {
        const text = current.textContent ?? '';
        index.regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        let last = 0;
        const parts: Node[] = [];

        while ((match = index.regex.exec(text)) !== null) {
          const matchText = match[0];
          const lower = matchText.toLowerCase();
          const entry = index.byAbbr.get(matchText) ?? index.byFull.get(lower);
          if (!entry) continue;
          if (match.index > last) parts.push(document.createTextNode(text.slice(last, match.index)));
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

        if (parts.length) {
          if (last < text.length) parts.push(document.createTextNode(text.slice(last)));
          toReplace.push({ node: current, parts });
        }
      }

      for (const { node, parts } of toReplace) {
        const frag = document.createDocumentFragment();
        for (const p of parts) frag.appendChild(p);
        node.parentNode?.replaceChild(frag, node);
      }
    }

    function scanAsm(asmIdx: AsmIndex) {
      const container = document.querySelector('.sl-markdown-content');
      if (!container) return;
      const walker = makeTreeWalker(container);
      const toReplace: Array<{ node: Text; parts: Node[] }> = [];
      let current: Text | null;

      while ((current = walker.nextNode() as Text | null)) {
        const text = current.textContent ?? '';
        asmIdx.regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        let last = 0;
        const parts: Node[] = [];

        while ((match = asmIdx.regex.exec(text)) !== null) {
          const entry = asmIdx.byMnemonic.get(match[0]);
          if (!entry) continue;
          if (match.index > last) parts.push(document.createTextNode(text.slice(last, match.index)));
          const btn = document.createElement('button');
          btn.className = 'gl-asm-term';
          btn.dataset.asmId = entry.id;
          btn.textContent = match[0];
          btn.addEventListener('mouseenter', () => showAsmPopup(entry, btn.getBoundingClientRect()));
          btn.addEventListener('mouseleave', () => scheduleAsmClose());
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const next = !asmPinnedRef.current;
            asmPinnedRef.current = next;
            setAsmPinned(next);
            setAsmPopup({ entry, anchor: btn.getBoundingClientRect() });
          });
          parts.push(btn);
          last = match.index + match[0].length;
        }

        if (parts.length) {
          if (last < text.length) parts.push(document.createTextNode(text.slice(last)));
          toReplace.push({ node: current, parts });
        }
      }

      for (const { node, parts } of toReplace) {
        const frag = document.createDocumentFragment();
        for (const p of parts) frag.appendChild(p);
        node.parentNode?.replaceChild(frag, node);
      }
    }

    function init() {
      Promise.all([
        fetch('/glossary-index.json').then(r => r.json()),
        fetch('/glossary-asm-index.json').then(r => r.json()),
      ]).then(([glossaryEntries, asmEntries]: [GlossaryEntry[], AsmEntry[]]) => {
        const glossaryIndex = buildIndex(glossaryEntries);
        if (glossaryIndex) scanGlossary(glossaryIndex);
        const asmIndex = buildAsmIndex(asmEntries);
        if (asmIndex) scanAsm(asmIndex);
      }).catch(() => {});
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(init, { timeout: 2000 });
    } else {
      setTimeout(init, 50);
    }
  }, [showPopup, scheduleClose, showAsmPopup, scheduleAsmClose]);

  return (
    <>
      {popup && createPortal(
        <GlossaryPopup
          entry={popup.entry}
          anchor={popup.anchor}
          pinned={pinned}
          onClose={() => { pinnedRef.current = false; setPinned(false); setPopup(null); }}
          onMouseEnter={clearClose}
          onMouseLeave={scheduleClose}
        />,
        document.body
      )}
      {asmPopup && createPortal(
        <AsmPopup
          entry={asmPopup.entry}
          anchor={asmPopup.anchor}
          pinned={asmPinned}
          onClose={() => { asmPinnedRef.current = false; setAsmPinned(false); setAsmPopup(null); }}
          onMouseEnter={clearAsmClose}
          onMouseLeave={scheduleAsmClose}
        />,
        document.body
      )}
    </>
  );
}
