# Step 3 Identity Verification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new Step 3 ("本人確認方法") after Step 2 (bank info) where the user selects one of three identity-verification methods before proceeding.

**Architecture:** New `Step3IdentityVerification` component follows the exact same sticky-header + white-card + mobile/desktop CTA pattern as Step 1 and Step 2. State is lifted into `App.tsx` as `identityMethod: IdentityVerificationMethod | null` and passed as `initialMethod` so returning to the step restores the selection. The `AppStep` union gains `"step3"` and Step 2's `onProceed` routes to it instead of alerting.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest + @testing-library/react

---

## Current state (already done)

`src/types.ts` already has:
```ts
export type IdentityVerificationMethod = 'ic-chip' | 'jpki' | 'selfie-doc';
```

---

### Task 1: Write the failing tests for Step3IdentityVerification

**Files:**
- Create: `src/components/__tests__/Step3IdentityVerification.test.tsx`

**Step 1: Write the test file**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step3IdentityVerification } from '../Step3IdentityVerification';

const noop = vi.fn();

describe('Step3IdentityVerification', () => {

  it('renders the section heading 本人確認方法', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    expect(screen.getByRole('heading', { name: /本人確認方法/ })).toBeInTheDocument();
  });

  it('renders the step indicator 4ステップ中 3', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    expect(screen.getByText('4ステップ中 3')).toBeInTheDocument();
  });

  it('renders all three method cards', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    expect(screen.getByText('自撮り＋ICチップ読取')).toBeInTheDocument();
    expect(screen.getByText('マイナンバーカード（JPKI）')).toBeInTheDocument();
    expect(screen.getByText('自撮り＋身分証撮影')).toBeInTheDocument();
  });

  it('renders おすすめ badge on the ic-chip card only', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    const badges = screen.getAllByText('おすすめ');
    expect(badges).toHaveLength(1);
  });

  it('ic-chip card is the first card rendered', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    const titles = [
      screen.getByText('自撮り＋ICチップ読取'),
      screen.getByText('マイナンバーカード（JPKI）'),
      screen.getByText('自撮り＋身分証撮影'),
    ];
    // compareDocumentPosition: first < second < third
    expect(titles[0].compareDocumentPosition(titles[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(titles[1].compareDocumentPosition(titles[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('次へ buttons are disabled with no selection', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    const btns = screen.getAllByRole('button', { name: '次へ' });
    btns.forEach(btn => expect(btn).toBeDisabled());
  });

  it('shows validation hint when 次へ clicked without selection', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(screen.getByText('確認方法を選択してから次へお進みください。')).toBeInTheDocument();
  });

  it('selecting a card enables 次へ and hides hint', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    // trigger hint first
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    // select a card
    fireEvent.click(screen.getByText('自撮り＋ICチップ読取'));
    const btns = screen.getAllByRole('button', { name: '次へ' });
    btns.forEach(btn => expect(btn).not.toBeDisabled());
    expect(screen.queryByText('確認方法を選択してから次へお進みください。')).not.toBeInTheDocument();
  });

  it('calls onProceed with ic-chip when that card is selected and 次へ clicked', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={onProceed} onBack={noop} />);
    fireEvent.click(screen.getByText('自撮り＋ICチップ読取'));
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledWith('ic-chip');
  });

  it('calls onProceed with jpki when that card is selected', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={onProceed} onBack={noop} />);
    fireEvent.click(screen.getByText('マイナンバーカード（JPKI）'));
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledWith('jpki');
  });

  it('calls onProceed with selfie-doc when that card is selected', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={onProceed} onBack={noop} />);
    fireEvent.click(screen.getByText('自撮り＋身分証撮影'));
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledWith('selfie-doc');
  });

  it('restores initialMethod selection on mount', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod="jpki" onProceed={onProceed} onBack={noop} />);
    const btns = screen.getAllByRole('button', { name: '次へ' });
    btns.forEach(btn => expect(btn).not.toBeDisabled());
    // proceeding immediately calls with the pre-selected value
    fireEvent.click(btns[0]);
    expect(onProceed).toHaveBeenCalledWith('jpki');
  });

  it('calls onBack when 前のステップに戻る is clicked', () => {
    const onBack = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={onBack} />);
    fireEvent.click(screen.getAllByText('前のステップに戻る')[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

});
```

**Step 2: Run the test to verify it fails (component doesn't exist yet)**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo && npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: compilation error or all tests fail — `Step3IdentityVerification` not found.

---

### Task 2: Implement Step3IdentityVerification component

**Files:**
- Create: `src/components/Step3IdentityVerification.tsx`

**Step 1: Write the component**

```tsx
import { useState } from "react";
import takakuLogo from "../assets/takaku_logo.svg";
import type { IdentityVerificationMethod } from "../types";

interface Props {
  initialMethod: IdentityVerificationMethod | null;
  onProceed: (method: IdentityVerificationMethod) => void;
  onBack: () => void;
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

export function Step3IdentityVerification({ initialMethod, onProceed, onBack }: Props) {
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
  }

  const nextBtn = (fullWidth: boolean) => (
    <button
      type="button"
      onClick={handleNext}
      disabled={!selected}
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
            {showHint && (
              <p className="text-xs text-[#F36B6B] font-medium">確認方法を選択してから次へお進みください。</p>
            )}
            {nextBtn(false)}
            {backBtn()}
          </div>

        </div>
      </main>

      {/* Sticky CTA — mobile */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-5 py-3.5">
        {showHint && (
          <p className="text-xs text-[#F36B6B] font-medium text-center mb-1.5">
            確認方法を選択してから次へお進みください。
          </p>
        )}
        {nextBtn(true)}
        {backBtn('w-full mt-2 py-1.5 block text-center')}
      </div>

    </div>
  );
}
```

**Step 2: Run the tests to verify they pass**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo && npm test -- --reporter=verbose 2>&1 | tail -30
```

Expected: All Step3IdentityVerification tests pass. Existing tests for other components still pass.

**Step 3: Commit**

```bash
git add src/components/__tests__/Step3IdentityVerification.test.tsx src/components/Step3IdentityVerification.tsx
git commit -m "feat: add Step3IdentityVerification component with method selection"
```

---

### Task 3: Wire Step 3 into App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx**

Replace the entire file content with:

```tsx
import { useState } from "react";
import { ConsentGate } from "./components/ConsentGate";
import { StepEkycIntro } from "./components/StepEkycIntro";
import { Step1PersonalInfo } from "./components/Step1PersonalInfo";
import { Step2BankRegistration } from "./components/Step2BankRegistration";
import { Step3IdentityVerification } from "./components/Step3IdentityVerification";
import type { PersonalInfoForm, BankInfoForm, IdentityVerificationMethod } from "./types";

type AppStep = "consent" | "ekyc" | "step1" | "step2" | "step3";

const emptyPersonalInfo: PersonalInfoForm = {
  name: "", kana: "", dobYear: "", dobMonth: "", dobDay: "",
  postalCode: "", prefecture: "", address: "", occupation: "",
  email: "", invoiceNotIssuer: false, invoiceNumber: "",
};

const emptyBankInfo: BankInfoForm = {
  holder: "",
  bank: null,
  branch: null,
  accountNumber: "",
  appraisalNotify: "required",
};

export default function App() {
  const [step, setStep]                         = useState<AppStep>("consent");
  const [personalInfo, setPersonalInfo]         = useState<PersonalInfoForm>(emptyPersonalInfo);
  const [bankInfo, setBankInfo]                 = useState<BankInfoForm>(emptyBankInfo);
  const [identityMethod, setIdentityMethod]     = useState<IdentityVerificationMethod | null>(null);

  if (step === "consent") {
    return <ConsentGate onProceed={() => setStep("ekyc")} />;
  }

  if (step === "ekyc") {
    return (
      <StepEkycIntro
        onProceed={() => setStep("step1")}
        onBack={() => setStep("consent")}
      />
    );
  }

  if (step === "step1") {
    return (
      <Step1PersonalInfo
        initialData={personalInfo}
        onProceed={(data) => {
          setPersonalInfo(data);
          setBankInfo(prev => ({ ...prev, holder: prev.holder || data.kana }));
          setStep("step2");
        }}
        onBack={() => setStep("ekyc")}
      />
    );
  }

  if (step === "step2") {
    return (
      <Step2BankRegistration
        initialData={bankInfo}
        onProceed={(data) => {
          setBankInfo(data);
          setStep("step3");
        }}
        onBack={() => setStep("step1")}
      />
    );
  }

  return (
    <Step3IdentityVerification
      initialMethod={identityMethod}
      onProceed={(method) => {
        setIdentityMethod(method);
        alert("✅ ステップ3完了。\n確認方法：" + method);
      }}
      onBack={() => setStep("step2")}
    />
  );
}
```

**Step 2: Check TypeScript compiles cleanly**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Run full test suite**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo && npm test 2>&1 | tail -20
```

Expected: all tests pass.

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire Step3IdentityVerification into app flow after bank registration"
```

---

### Task 4: Manual smoke test

**Step 1: Start dev server**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo && npm run dev
```

**Step 2: Walk the full happy path**

1. Agree to consent → click 次へ
2. eKYC intro → click 本人確認へ進む
3. Step 1 personal info → fill required fields → click 次へ
4. Step 2 bank info → fill required fields → click 次へ
5. Step 3 identity method selection:
   - Verify title shows 本人確認方法
   - Verify step indicator shows "4ステップ中 3" with 3 pills filled
   - Verify card order: 自撮り＋ICチップ読取 (first, おすすめ badge), マイナンバーカード（JPKI）(second), 自撮り＋身分証撮影 (third)
   - Click 次へ without selecting → confirm hint appears
   - Select a card → confirm card highlights green, hint disappears, button enables
   - Click 戻る → confirm return to Step 2 with bank data preserved
   - Re-advance to Step 3 → confirm previous selection is restored
   - Select a method → click 次へ → confirm alert shows

**Step 3: Kill dev server when done**

---

## Notes

- The おすすめ badge uses `bg-accent-primary text-white` (green), consistent with the product's primary accent — more on-brand than the wireframe's neutral gray.
- The qualifier chip (e.g. "ICチップ搭載の身分証のみ対応") uses a green tint when the card is selected, matching the wireframe's selected-state indicator.
- Step indicator: `i <= 2` fills pills 0, 1, 2 — three of four active, consistent with Step 2 using `i <= 1`.
- `identityMethod` state is lifted into App so navigating back and returning restores the selection without additional prop drilling.
