import { HeaderLogo } from "./HeaderLogo";
import { ContactCard } from "./ContactCard";

interface Props {
  onProceed: () => void;
}

// Sits between ConsentGate and StepEkycIntro in the seiyaku flow.
// In production the journey pauses here — the user continues via a follow-up
// email link, so onProceed below is a tester-only shortcut to that destination.
export function StepConsentComplete({ onProceed }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-page" style={{ fontFamily: 'var(--font-base)' }}>

      {/* Logo-only header — no step counter (not a counted step) */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2">
        <div style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto' }}>
          <HeaderLogo />
        </div>
      </div>

      {/* Main scrollable content */}
      <main className="flex-1 flex justify-center py-5 sm:py-8">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
        >

          {/* Success hero */}
          <div className="flex flex-col items-center text-center py-8 mb-9">
            <div
              className="w-20 h-20 rounded-full bg-[#f0faf0] border-2 border-[#a5d6a7] flex items-center justify-center"
              style={{ animation: 'pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-accent-primary)" strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1F2329] mt-5 mb-2">同意書の受諾が完了しました</h1>
            <p className="text-sm text-gray-500 leading-[1.85] max-w-[300px]">
              ご同意いただきありがとうございます。<br />
              本人確認（eKYC）のご案内を、追ってメールにてお送りいたします。<br />
              メールに記載のリンクより、お手続きをお進みください。
            </p>
          </div>

          {/* Tester-only navigation */}
          <div className="flex flex-col items-center mb-9">
            <button
              type="button"
              className="w-full max-w-[400px] rounded-[10px] py-3.5 text-[15px] font-bold border-2 border-accent-primary text-accent-primary-depth bg-white transition-colors duration-150 hover:bg-[#f0faf0]"
              onClick={onProceed}
            >
              eKYC画面へ進む（テスター用）
            </button>
            <p className="mt-2.5 max-w-[400px] text-center text-[11px] text-gray-400 leading-relaxed">
              ※ このボタンはデモ・テスト用です。実際のユーザーはメールのリンクからeKYC画面に遷移します。
            </p>
          </div>

          {/* Contact section */}
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="w-1 h-[15px] rounded-full bg-accent-primary flex-shrink-0" />
            <span className="text-[13px] font-semibold text-gray-500 tracking-[0.06em]">カスタマーセンター</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col gap-3">
            <ContactCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
              value={<a href="tel:0120945991" className="text-base font-bold text-[#1F2329] hover:underline underline-offset-2">0120-945-991</a>}
              meta="9:15〜21:00（年末年始を除く）"
              hint="※ 音声案内：2番を押してください"
            />
            <ContactCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
              value={<a href="mailto:info@takakuureru.com" className="text-base font-bold text-[#1F2329] hover:underline underline-offset-2">info@takakuureru.com</a>}
              meta="お名前とお電話番号を記載のうえ、お問い合わせください。"
              hint="※ 返信にお時間をいただく場合がございます。お急ぎの場合はお電話ください。"
              emphasis="small"
            />
          </div>

        </div>
      </main>

    </div>
  );
}
