import { termsSections } from "../data/terms";
import { TermsBox } from "./TermsBox";

interface TermsModalProps {
  open: boolean;
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  onClose: () => void;
}

// Modal shell around the shared TermsBox — mirrors ConsentGate's
// terms-box + freely-checkable agree-checkbox structure, just in a dialog.
export function TermsModal({ open, agreed, onAgreedChange, onClose }: TermsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#1F2329]">利用規約</h2>
          <button
            type="button"
            aria-label="モーダルを閉じる"
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto">
          <TermsBox sections={termsSections} />
        </div>

        <div className="px-5 py-4 border-t border-gray-200">
          <label className="mb-3 flex cursor-pointer items-center gap-2.5 select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => onAgreedChange(e.target.checked)}
              className="h-5 w-5 flex-shrink-0 cursor-pointer accent-[var(--color-accent-primary)]"
            />
            <span className="text-sm font-semibold text-[#1F2329]">規約に同意する</span>
          </label>
          <button
            type="button"
            className="w-full rounded-[10px] bg-accent-primary py-3 text-sm font-semibold text-white transition-colors duration-150"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
