import { useEffect, useRef } from 'react';

export interface AsmEntry {
  id: string;
  mnemonic: string;
  description: string;
  sample: string;
}

interface Props {
  entry: AsmEntry;
  anchor: DOMRect;
  pinned: boolean;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function AsmPopup({
  entry,
  anchor,
  pinned,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popupW = Math.min(320, vw - 24);
    let left = anchor.left;
    const top = anchor.bottom + 6;
    if (left + popupW > vw - 12) left = vw - popupW - 12;
    if (left < 12) left = 12;
    el.style.width = `${popupW}px`;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > vh - 8) {
        el.style.top = `${anchor.top - el.offsetHeight - 6}px`;
      }
    });
  }, [anchor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onClickOutside = (e: MouseEvent) => {
      if (pinned && ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [onClose, pinned]);

  return (
    <div
      ref={ref}
      className={`gl-popup gl-popup--asm${pinned ? ' gl-popup--pinned' : ''}`}
      role="tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {pinned && (
        <button className="gl-popup__close" onClick={onClose} aria-label="Затвори">
          ×
        </button>
      )}
      <p className="gl-popup__abbr">
        <strong><code>{entry.mnemonic}</code></strong>
      </p>
      {entry.description && (
        <p className="gl-popup__desc">{entry.description}</p>
      )}
      {entry.sample && (
        <pre className="gl-popup__sample"><code>{entry.sample}</code></pre>
      )}
    </div>
  );
}
