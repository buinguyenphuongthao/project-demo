import { useState } from "react";
import { termsSections } from "../data/terms";
import { TermsBox } from "./TermsBox";
import { PrimaryButton } from "./PrimaryButton";
import { HeaderLogo } from "./HeaderLogo";

interface ConsentGateProps {
  onProceed?: () => void;
}

// Gate screen: read terms -> agree -> proceed.
// No back button (flow start) and no progress bar (not a counted step) per wireframe legend.
export function ConsentGate({ onProceed }: ConsentGateProps) {
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (!agreed) return;
    onProceed?.();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <div
          className="p-4 pb-5"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
        >
          <div className="flex items-center">
            <HeaderLogo />
            <h1 className="flex-1 text-center text-xl font-bold leading-tight tracking-tight sm:text-2xl">
              同意書の受諾
            </h1>
            <div className="h-[60px] sm:h-[61px] opacity-0 pointer-events-none" aria-hidden="true">
              <HeaderLogo />
            </div>
          </div>

          <p className="mt-3 mb-5 text-sm text-gray-600">
            以下の規約をお読みいただき、同意してから次へお進みください。
          </p>

          <div className="rounded-lg bg-page p-4 sm:p-5">
            <TermsBox sections={termsSections} />
          </div>

          <label className="mt-5 flex cursor-pointer items-center justify-center gap-2.5 select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-5 w-5 flex-shrink-0 cursor-pointer accent-[var(--color-accent-primary)]"
            />
            <span
              className={
                "text-sm font-semibold transition-colors duration-200 " +
                (agreed ? "text-accent-primary-depth" : "text-gray-700")
              }
            >
              規約に同意する
            </span>
          </label>

          <div className="flex flex-col items-center mt-5">
            <div className="w-full max-w-[400px]">
              {!agreed && (
                <p className="mb-1.5 min-h-[16px] text-center text-[11px] text-gray-500">
                  規約に同意してから次へお進みください。
                </p>
              )}
              <PrimaryButton label="次へ" disabled={!agreed} onClick={handleNext} />
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-gray-300 py-3 text-xs">
        <div className="text-center">
          <p>© MarketEnterprise Co.,Ltd.</p>
        </div>
      </footer>
    </div>
  );
}
