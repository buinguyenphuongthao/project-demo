import { useRef, useState, useEffect } from "react";
import type { TermsSection } from "../types";

interface TermsBoxProps {
  sections: TermsSection[];
}

// Scrollable terms with a fading "scroll to read" hint that disappears at the bottom.
export function TermsBox({ sections }: TermsBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (el && el.scrollHeight <= el.clientHeight) setAtBottom(true);
  }, []);

  const handleScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 10);
  };

  return (
    <div className="relative">
      <div
        ref={boxRef}
        onScroll={handleScroll}
        className="max-h-[480px] overflow-y-auto rounded-lg border border-gray-300 bg-surface px-4 py-3.5 text-[13px] leading-[1.7] text-black"
      >
        {sections.map((s) => (
          <p key={s.article} className="mb-3.5 last:mb-0">
            <strong className="block">{s.article}</strong>
            {s.body}
          </p>
        ))}
      </div>
      <div
        className={
          "pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-lg bg-gradient-to-b from-transparent to-surface transition-opacity " +
          (atBottom ? "opacity-0" : "opacity-100")
        }
      />
      <p
        className={
          "mt-2 text-center text-[11px] text-gray-500 transition-opacity " +
          (atBottom ? "opacity-0" : "opacity-100")
        }
      >
        ↓ スクロールして全文をご確認ください
      </p>
    </div>
  );
}
