import { useState } from "react";
import takakuLogo from "../assets/takaku_logo.svg";
import type { IdentityVerificationMethod } from "../types";

interface Props {
  initialMethod: IdentityVerificationMethod | null;
  onProceed: (method: IdentityVerificationMethod) => void;
  onBack: () => void;
  onChange?: (method: IdentityVerificationMethod | null) => void;
}

type MethodDef = {
  id: IdentityVerificationMethod;
  title: string;
  recommended: boolean;
  subtitle: string;
  qualifier: string;
  icon: React.ReactNode;
};

const METHODS: MethodDef[] = [
  {
    id: 'ic-chip',
    title: '自撮り＋ICチップ読取',
    recommended: true,
    subtitle: '身分証のICチップを読み取り',
    qualifier: 'ICチップ搭載の身分証のみ対応',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M8 10v4M12 9v6M16 10v4"/>
      </svg>
    ),
  },
  {
    id: 'jpki',
    title: 'マイナンバーカード（JPKI）',
    recommended: false,
    subtitle: 'JPKIによる電子署名',
    qualifier: 'マイナンバーカード＋暗証番号が必要',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'selfie-doc',
    title: '自撮り＋身分証撮影',
    recommended: false,
    subtitle: '自撮り写真と身分証の写真を撮影',
    qualifier: '運転免許証・マイナンバーカード・在留カード',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    ),
  },
];

export function Step3IdentityVerification({ initialMethod, onProceed, onBack, onChange }: Props) {
  const [selected, setSelected] = useState<IdentityVerificationMethod | null>(initialMethod);
  const [showHint, setShowHint] = useState(false);

  function handleNext() {
    if (!selected) {
      setShowHint(true);
      return;
    }
    onProceed(selected);
  }

  function handleSelect(id: IdentityVerificationMethod) {
    setSelected(id);
    setShowHint(false);
    onChange?.(id);
  }

  const hint = showHint && (
    <p className="text-xs text-[#F36B6B] font-medium text-center">
      確認方法を選択してから次へお進みください。
    </p>
  );

  const nextBtn = (fullWidth: boolean) => (
    <button
      type="button"
      onClick={handleNext}
      aria-disabled={!selected ? 'true' : undefined}
      className={[
        'button-background rounded-[10px] py-4',
        'text-[17px] font-bold tracking-wide text-white',
        'transition-[colors,box-shadow,transform] duration-200',
        selected ? 'bg-accent-primary cursor-pointer' : 'bg-gray-300 cursor-not-allowed',
        fullWidth ? 'w-full' : 'w-full max-w-[480px]',
      ].join(' ')}
    >
      次へ
    </button>
  );

  const backBtn = (extraClass = '') => (
    <button
      type="button"
      onClick={onBack}
      className={`text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors ${extraClass}`}
    >
      前のステップに戻る
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-page" style={{ fontFamily: 'var(--font-base)' }}>

      {/* Sticky progress header */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] pt-3 pb-3">
        <div className="flex items-center justify-between"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto' }}>
          <img src={takakuLogo} alt="高く売れるドットコム" className="h-[64px]" />
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1.5">4ステップ中 3</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-12 h-2 rounded-full transition-colors ${i <= 2 ? 'bg-accent-primary' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 flex justify-center py-5 pb-24 sm:pb-5">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
        >

          {/* Section heading */}
          <h1 className="flex items-center gap-2 text-xl font-bold text-[#1F2329] mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent-primary)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            本人確認方法
          </h1>
          <p className="text-sm text-gray-500 mb-5">本人確認の方法を選択してください。</p>

          {/* Method cards */}
          <div className="flex flex-col gap-3 mb-6">
            {METHODS.map(m => {
              const isSelected = selected === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m.id)}
                  className={[
                    'w-full text-left flex items-start gap-3 px-4 py-4 rounded-xl border-2 transition-colors',
                    isSelected
                      ? 'border-accent-primary bg-[#f0faf0]'
                      : 'border-gray-200 bg-white hover:bg-gray-50',
                  ].join(' ')}
                >
                  {/* Icon */}
                  <div className={[
                    'w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0',
                    isSelected
                      ? 'bg-[#e8f5e9] border-[#a5d6a7] text-[var(--color-accent-primary)]'
                      : 'bg-gray-100 border-gray-200 text-gray-400',
                  ].join(' ')}>
                    {m.icon}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-base font-bold text-[#1F2329]">{m.title}</span>
                      {m.recommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-primary text-white leading-none">
                          おすすめ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{m.subtitle}</p>
                    <span className={[
                      'inline-block text-xs px-2 py-1 rounded border leading-tight',
                      isSelected
                        ? 'bg-[#e8f5e9] border-[#a5d6a7] text-[#1F2329]'
                        : 'bg-gray-50 border-gray-200 text-[#1F2329]',
                    ].join(' ')}>
                      {m.qualifier}
                    </span>
                  </div>

                  {/* Check circle */}
                  <div className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    isSelected
                      ? 'bg-accent-primary border-accent-primary'
                      : 'bg-white border-gray-300',
                  ].join(' ')}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1.5 5 4 7.5 8.5 2.5"/>
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* CTA — desktop */}
          <div className="hidden sm:flex flex-col items-center gap-3">
            {hint}
            {nextBtn(false)}
            {backBtn()}
          </div>

        </div>
      </main>

      {/* Sticky CTA — mobile */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-5 py-3.5">
        {hint}
        {nextBtn(true)}
        {backBtn('w-full mt-2 py-1.5 block text-center')}
      </div>

    </div>
  );
}
