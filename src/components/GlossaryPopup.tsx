import { useEffect, useRef } from "react";

interface Ref {
  title: string;
  slug: string;
}

interface Mention {
  subject: string;
  refs: Ref[];
}

export interface GlossaryEntry {
  id: string;
  letter: string;
  abbr: string;
  full: string;
  description: string;
  mentions: Mention[];
}

interface Props {
  entry: GlossaryEntry;
  anchor: DOMRect;
  pinned: boolean;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function GlossaryPopup({
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

    // anchor is already viewport-relative (from getBoundingClientRect)
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClickOutside = (e: MouseEvent) => {
      if (pinned && ref.current && !ref.current.contains(e.target as Node))
        onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [onClose, pinned]);

  return (
    <div
      ref={ref}
      className={`gl-popup${pinned ? " gl-popup--pinned" : ""}`}
      role="tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {pinned && (
        <button
          className="gl-popup__close"
          onClick={onClose}
          aria-label="Затвори"
        >
          ×
        </button>
      )}
      <p className="gl-popup__abbr">
        <strong>{entry.abbr}</strong>
        {" — "}
        <span className="gl-popup__full">{entry.full}</span>
      </p>
      {entry.description && (
        <p className="gl-popup__desc">{entry.description}</p>
      )}
      {entry.mentions.length > 0 && (
        <p className="gl-popup__chapters">
          {entry.mentions.map((m, mi) => (
            <span key={m.subject}>
              {mi > 0 && " · "}
              {m.refs.map((r, ri) => (
                <span key={r.slug}>
                  {ri > 0 && ", "}
                  <a href={`/${m.subject}/${r.slug}/`}>{r.title}</a>
                </span>
              ))}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
