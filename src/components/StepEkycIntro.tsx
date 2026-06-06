import { useState } from "react";
import { HeaderLogo } from "./HeaderLogo";

interface Props {
  onProceed: () => void;
  onBack: () => void;
}

// Passport deliberately excluded per product decision.
const DOC_ITEMS: { label: string; badge: string | null; icon: React.ReactNode }[] = [
  {
    label: '運転免許証',
    badge: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'マイナンバーカード',
    badge: '※表面のみ',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="8" y1="10" x2="16" y2="10"/>
        <line x1="8" y1="14" x2="13" y2="14"/>
      </svg>
    ),
  },
  {
    label: '在留カード',
    badge: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="6" y1="10" x2="10" y2="10"/>
        <line x1="6" y1="14" x2="10" y2="14"/>
        <line x1="13" y1="10" x2="18" y2="10"/>
        <line x1="13" y1="14" x2="16" y2="14"/>
      </svg>
    ),
  },
];

export function StepEkycIntro({ onProceed, onBack }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-page" style={{ fontFamily: 'var(--font-base)' }}>

      {/* Logo-only header — no step counter (pre-step) */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2">
        <div style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto' }}>
          <HeaderLogo />
        </div>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 flex justify-center py-5 pb-24 sm:pb-5">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
        >

          {/* Hero */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-[#1F2329] leading-snug mb-2">
              ご本人確認のお手続きをお願いします
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              古物営業法に基づき、お取引には本人確認書類の提示が必要です。
            </p>
          </div>

          {/* eKYCとは？ — collapsible */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">

            {/* Header row — tapping header also toggles */}
            <button
              type="button"
              className="w-full flex items-center gap-2 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-accent-primary)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="flex-1 text-sm font-bold text-[#1F2329]">eKYCとは？</span>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.25s',
                  transform: expanded ? 'rotate(180deg)' : 'none',
                }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Collapsible body — collapsed height shows ~2 lines */}
            <div
              className="relative border-t border-gray-100"
              style={{
                maxHeight: expanded ? '240px' : '58px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}
            >
              <p className="px-4 py-3 text-sm text-gray-500 leading-relaxed">
                eKYC（電子本人確認）とは、スマートフォンで本人確認書類と顔写真を撮影するだけで、オンラインでの本人確認が完了するサービスです。窓口への来店や書類の郵送は一切不要です。撮影されたデータはセキュリティで保護された環境で審査されます。通常、提出後数分以内に確認が完了し、お取引をすぐに開始いただけます。なお、撮影していただいた書類・顔写真は法令に基づき適切に管理し、本人確認の目的以外には使用いたしません。
              </p>
              {/* Fade gradient hint when collapsed */}
              {!expanded && (
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
                />
              )}
            </div>

            {/* Expand/collapse toggle row */}
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="w-full flex items-center justify-center gap-1 py-2 border-t border-gray-100 text-[11px] font-semibold text-gray-400 hover:bg-gray-50 transition-colors"
            >
              {expanded ? '閉じる' : 'もっと見る'}
            </button>
          </div>

          {/* ご準備いただく書類 */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-accent-primary)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="2" width="6" height="4" rx="1"/>
                <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
              <span className="text-sm font-bold text-[#1F2329]">ご準備いただく書類</span>
            </div>

            <p className="text-xs text-gray-400 border-t border-gray-100 px-4 pt-2 pb-2.5">
              以下のいずれか1点
            </p>

            <div>
              {DOC_ITEMS.map((doc, idx) => (
                <div
                  key={doc.label}
                  className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-dashed border-gray-200' : ''}`}
                >
                  <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                    {doc.icon}
                  </div>
                  <span className="flex-1 text-sm text-[#1F2329]">{doc.label}</span>
                  {doc.badge && (
                    <span className="text-[10px] font-semibold text-[#C05000] bg-[#FFF0E6] border border-[#F5C9A0] rounded px-1.5 py-0.5 whitespace-nowrap">
                      {doc.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA — desktop only */}
          <div className="hidden sm:flex flex-col items-center gap-3">
            <button
              className="button-background w-full max-w-[480px] rounded-[10px] py-4 text-[17px] font-bold tracking-wide text-white bg-accent-primary transition-[colors,box-shadow,transform] duration-200"
              onClick={onProceed}
            >
              本人確認へ進む
            </button>
            <button
              className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors"
              onClick={onBack}
            >
              前のステップに戻る
            </button>
          </div>

        </div>
      </main>

      {/* Sticky CTA — mobile only */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-5 py-3.5">
        <button
          className="button-background w-full rounded-[10px] py-4 text-[17px] font-bold text-white bg-accent-primary transition-[colors,box-shadow,transform] duration-200"
          onClick={onProceed}
        >
          本人確認へ進む
        </button>
        <button
          className="w-full mt-2 py-1.5 text-sm text-gray-500 underline underline-offset-2"
          onClick={onBack}
        >
          前のステップに戻る
        </button>
      </div>

    </div>
  );
}
