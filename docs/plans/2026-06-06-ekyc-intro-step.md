# eKYC Intro Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Insert a new informational eKYC intro screen as a pre-step between ConsentGate and Step1PersonalInfo, with a collapsible explainer card, a document checklist, and an always-enabled CTA.

**Architecture:** A new `StepEkycIntro` component is wired into `App.tsx` as a new `"ekyc"` step between `"consent"` and `"step1"`. It carries no form state (purely informational), so no type changes are needed. Because it is a pre-step it has no progress-bar indicator — only the logo header. Step1 and Step2 numbering are unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 (Vite plugin), Vitest + @testing-library/react for unit tests.

---

## Reference: key design tokens (from `src/index.css` and existing components)

| Token | Value |
|---|---|
| `--color-accent-primary` | `#388e31` |
| `--color-page` | `#f9f5ee` |
| Card container | `bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8` |
| Card max-width | `clamp(320px, calc(100% - 2rem), 560px)` |
| Primary button | `button-background w-full rounded-[10px] py-4 text-[17px] font-bold text-white bg-accent-primary` |
| Sticky header | `sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2` |

## Reference: component structure to mirror

Copy the sticky-header + scrollable-main + sticky-mobile-CTA shell from `Step1PersonalInfo.tsx` but **omit** the progress-bar segment (replace with logo-only header, same as `ConsentGate` uses `<HeaderLogo />`).

---

## Task 1: Create `StepEkycIntro.tsx`

**Files:**
- Create: `src/components/StepEkycIntro.tsx`

**Step 1: Create the file with a stub that renders a visible heading**

```tsx
// src/components/StepEkycIntro.tsx
import { HeaderLogo } from "./HeaderLogo";

interface Props {
  onProceed: () => void;
  onBack: () => void;
}

export function StepEkycIntro({ onProceed, onBack }: Props) {
  return (
    <div>
      <HeaderLogo />
      <h1>ご本人確認のお手続きをお願いします</h1>
      <button onClick={onProceed}>本人確認へ進む</button>
      <button onClick={onBack}>前のステップに戻る</button>
    </div>
  );
}
```

**Step 2: Run the type-checker to confirm no import errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 2: Write tests for `StepEkycIntro`

**Files:**
- Create: `src/components/__tests__/StepEkycIntro.test.tsx`

**Step 1: Write the test file**

```tsx
// src/components/__tests__/StepEkycIntro.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepEkycIntro } from '../StepEkycIntro';

describe('StepEkycIntro', () => {

  it('renders the hero heading', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /ご本人確認のお手続き/ })).toBeInTheDocument();
  });

  it('renders all three document types', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('運転免許証')).toBeInTheDocument();
    expect(screen.getByText('マイナンバーカード')).toBeInTheDocument();
    expect(screen.getByText('在留カード')).toBeInTheDocument();
  });

  it('does NOT render パスポート', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByText('パスポート')).not.toBeInTheDocument();
  });

  it('shows the マイナンバーカード badge ※表面のみ', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('※表面のみ')).toBeInTheDocument();
  });

  it('eKYCとは？ body starts collapsed — shows もっと見る toggle', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('もっと見る')).toBeInTheDocument();
  });

  it('eKYCとは？ expands on toggle click and shows 閉じる', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('もっと見る'));
    expect(screen.getByText('閉じる')).toBeInTheDocument();
    expect(screen.queryByText('もっと見る')).not.toBeInTheDocument();
  });

  it('collapses again when 閉じる is clicked', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('もっと見る'));
    fireEvent.click(screen.getByText('閉じる'));
    expect(screen.getByText('もっと見る')).toBeInTheDocument();
  });

  it('calls onProceed when CTA is clicked', () => {
    const onProceed = vi.fn();
    render(<StepEkycIntro onProceed={onProceed} onBack={vi.fn()} />);
    // There are two CTA buttons (desktop + mobile); click the first.
    fireEvent.click(screen.getAllByText('本人確認へ進む')[0]);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back link is clicked', () => {
    const onBack = vi.fn();
    render(<StepEkycIntro onProceed={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getAllByText('前のステップに戻る')[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does NOT render any step-progress indicator', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByText(/ステップ中/)).not.toBeInTheDocument();
  });

});
```

**Step 2: Run the tests to confirm they fail (component is a stub)**

```bash
npx vitest run src/components/__tests__/StepEkycIntro.test.tsx
```

Expected: several FAILs (hero heading present but doc items, toggle, etc. missing).

---

## Task 3: Implement the full `StepEkycIntro` component

**Files:**
- Modify: `src/components/StepEkycIntro.tsx`

**Step 1: Replace the stub with the full implementation**

```tsx
// src/components/StepEkycIntro.tsx
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
```

**Step 2: Run the tests — all should now pass**

```bash
npx vitest run src/components/__tests__/StepEkycIntro.test.tsx
```

Expected: all 9 tests PASS.

**Step 3: Run the full test suite to check for regressions**

```bash
npx vitest run
```

Expected: all tests PASS.

**Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/components/StepEkycIntro.tsx src/components/__tests__/StepEkycIntro.test.tsx
git commit -m "feat: add StepEkycIntro pre-step component with collapsible eKYC explainer and document checklist"
```

---

## Task 4: Wire `StepEkycIntro` into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Step 1: Read the current `App.tsx` to understand the exact lines to change**

Current `AppStep` union: `"consent" | "step1" | "step2"`  
Current flow: consent → step1 → step2  
Target flow: consent → **ekyc** → step1 → step2

**Step 2: Apply the changes**

```tsx
// src/App.tsx  — full file after changes

import { useState } from "react";
import { ConsentGate } from "./components/ConsentGate";
import { StepEkycIntro } from "./components/StepEkycIntro";
import { Step1PersonalInfo } from "./components/Step1PersonalInfo";
import { Step2BankRegistration } from "./components/Step2BankRegistration";
import type { PersonalInfoForm, BankInfoForm } from "./types";

type AppStep = "consent" | "ekyc" | "step1" | "step2";

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
  const [step, setStep]                 = useState<AppStep>("consent");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>(emptyPersonalInfo);
  const [bankInfo, setBankInfo]         = useState<BankInfoForm>(emptyBankInfo);

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

  return (
    <Step2BankRegistration
      initialData={bankInfo}
      onProceed={(data) => {
        setBankInfo(data);
        alert(
          "✅ ステップ2完了。\n" +
          "銀行：" + data.bank!.name + " (" + data.bank!.code + ")\n" +
          "支店：" + data.branch!.name + " (" + data.branch!.code + ")\n" +
          "口座番号：" + data.accountNumber
        );
      }}
      onBack={() => setStep("step1")}
    />
  );
}
```

Key changes:
- `AppStep` now includes `"ekyc"`
- `ConsentGate.onProceed` now sets step to `"ekyc"` (was `"step1"`)
- New `ekyc` branch renders `StepEkycIntro`
- `Step1PersonalInfo.onBack` now goes back to `"ekyc"` (was `"consent"`)

**Step 3: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests PASS.

**Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: insert eKYC intro pre-step between consent gate and personal info form"
```

---

## Task 5: Manual smoke test in the browser

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Walk through the full flow and verify each point**

| Checkpoint | Expected |
|---|---|
| Load app | ConsentGate shown |
| Agree + click 次へ | eKYC intro shown; logo header visible; NO step counter |
| Tap "もっと見る" | Body expands smoothly; chevron rotates; "閉じる" appears |
| Tap "閉じる" | Body collapses; "もっと見る" returns |
| Document list | 運転免許証, マイナンバーカード (badge ※表面のみ), 在留カード — no パスポート |
| Click 前のステップに戻る | Returns to ConsentGate |
| Click 本人確認へ進む | Step1PersonalInfo shown with "4ステップ中 1" |
| Complete Step1 → back | Returns to eKYC intro (not ConsentGate) |
| Complete full flow | Step2 completion alert fires as before |

**Step 3: Stop dev server** (`Ctrl-C`)

---

## Checklist

- [ ] Task 1: stub component created, no TS errors
- [ ] Task 2: test file written, tests confirmed failing
- [ ] Task 3: full component implemented, all 9 tests pass
- [ ] Task 4: App.tsx wired, all tests pass
- [ ] Task 5: manual smoke test passes all checkpoints
