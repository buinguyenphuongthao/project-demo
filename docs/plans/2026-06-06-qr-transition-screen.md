# QR Transition Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a QR transition screen after Step 3 that instructs the user to complete eKYC on their smartphone by scanning a QR code, then wire it into the existing multi-step flow.

**Architecture:** New `StepQrTransition` component follows the exact layout and styling of `StepEkycIntro` — logo-only sticky header (no progress bar), white card on warm background, desktop CTA + mobile sticky footer. A static 13×13 CSS-grid QR placeholder is rendered inline. Two changes to `App.tsx`: extend `AppStep` with a `"qr"` variant and re-route Step 3's `onProceed` through the new screen before reaching the completion handler.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4 (`@theme` tokens in `src/index.css`), Vitest + React Testing Library

---

### Task 1: Write the failing tests for `StepQrTransition`

**Files:**
- Create: `src/components/__tests__/StepQrTransition.test.tsx`

**Step 1: Create the test file**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepQrTransition } from '../StepQrTransition';

describe('StepQrTransition', () => {

  it('renders the main heading', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(
      screen.getByRole('heading', { name: /スマートフォンで本人確認を行ってください/ })
    ).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(
      screen.getByText(/この手順はスマートフォンで完了する必要があります/)
    ).toBeInTheDocument();
  });

  it('renders all three instruction steps', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/スマートフォンのカメラを起動する/)).toBeInTheDocument();
    expect(screen.getByText(/下記のQRコードを読み取る/)).toBeInTheDocument();
    expect(screen.getByText(/D-Confiaアプリが自動的に起動します/)).toBeInTheDocument();
  });

  it('renders the QR code placeholder', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('img', { name: 'QRコード' })).toBeInTheDocument();
  });

  it('renders the timeout hint', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/このQRコードは10分間有効です/)).toBeInTheDocument();
  });

  it('does NOT render any step-progress indicator', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByText(/ステップ中/)).not.toBeInTheDocument();
  });

  it('calls onProceed when 次へ is clicked', () => {
    const onProceed = vi.fn();
    render(<StepQrTransition onProceed={onProceed} onBack={vi.fn()} />);
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when 前のステップに戻る is clicked', () => {
    const onBack = vi.fn();
    render(<StepQrTransition onProceed={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getAllByText('前のステップに戻る')[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

});
```

**Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/components/__tests__/StepQrTransition.test.tsx
```

Expected: all tests **FAIL** with `Cannot find module '../StepQrTransition'`

**Step 3: Commit the test file**

```bash
git add src/components/__tests__/StepQrTransition.test.tsx
git commit -m "test: add failing tests for StepQrTransition"
```

---

### Task 2: Implement `StepQrTransition`

**Files:**
- Create: `src/components/StepQrTransition.tsx`

**Step 1: Create the component**

```tsx
import { HeaderLogo } from "./HeaderLogo";

interface Props {
  onProceed: () => void;
  onBack: () => void;
}

const STEPS = [
  { text: 'スマートフォンのカメラを起動する', note: null },
  { text: '下記のQRコードを読み取る', note: null },
  {
    text: 'D-Confiaアプリが自動的に起動します',
    note: '（アプリが未インストールの場合はストアへ誘導されます）',
  },
] as const;

// Static 13×13 QR-like placeholder.
// Finder patterns at TL / TR / BL corners + timing rows + pseudo-random data.
const QR_SIZE = 13;

function buildQrCells(): boolean[] {
  const dark = new Array<boolean>(QR_SIZE * QR_SIZE).fill(false);
  const at = (r: number, c: number) => r * QR_SIZE + c;

  function finder(sr: number, sc: number) {
    for (let r = sr; r < sr + 5; r++) {
      for (let c = sc; c < sc + 5; c++) {
        const lr = r - sr;
        const lc = c - sc;
        dark[at(r, c)] =
          lr === 0 || lr === 4 || lc === 0 || lc === 4 || (lr === 2 && lc === 2);
      }
    }
  }
  finder(0, 0);
  finder(0, 8);
  finder(8, 0);

  for (let i = 2; i < QR_SIZE - 2; i++) {
    dark[at(6, i)] = i % 2 === 0;
    dark[at(i, 6)] = i % 2 === 0;
  }

  let seed = 42;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  for (let r = 0; r < QR_SIZE; r++) {
    for (let c = 0; c < QR_SIZE; c++) {
      const inFinder =
        (r <= 4 && c <= 4) || (r <= 4 && c >= 8) || (r >= 8 && c <= 4);
      if (!inFinder && r !== 6 && c !== 6) {
        dark[at(r, c)] = rand() > 0.5;
      }
    }
  }
  return dark;
}

const QR_CELLS = buildQrCells();

function QrPlaceholder() {
  return (
    <div
      className="relative border-2 border-gray-300 rounded-xl bg-white p-3.5"
      style={{ width: 200, height: 200 }}
    >
      <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#1F2329] rounded-tl pointer-events-none" aria-hidden="true" />
      <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#1F2329] rounded-br pointer-events-none" aria-hidden="true" />
      <div
        role="img"
        aria-label="QRコード"
        className="w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)`,
          gap: '1.5px',
        }}
      >
        {QR_CELLS.map((isDark, i) => (
          <div
            key={i}
            style={{ background: isDark ? '#1F2329' : '#fff', borderRadius: 1 }}
          />
        ))}
      </div>
    </div>
  );
}

export function StepQrTransition({ onProceed, onBack }: Props) {
  const nextBtn = (fullWidth: boolean) => (
    <button
      type="button"
      onClick={onProceed}
      className={[
        'button-background rounded-[10px] py-4',
        'text-[17px] font-bold tracking-wide text-white bg-accent-primary',
        'transition-[colors,box-shadow,transform] duration-200',
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

      {/* Logo-only header — no step counter (transition screen, not a numbered step) */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2">
        <div style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto' }}>
          <HeaderLogo />
        </div>
      </div>

      <main className="flex-1 flex justify-center py-5 pb-24 sm:pb-5">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
        >

          <div className="mb-5 text-center">
            <h1 className="text-xl font-bold text-[#1F2329] leading-snug mb-2">
              スマートフォンで本人確認を行ってください
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              この手順はスマートフォンで完了する必要があります。
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            {STEPS.map(({ text, note }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-[#1F2329]">{i + 1}</span>
                </div>
                <p className="text-sm text-[#1F2329] leading-relaxed">
                  {text}
                  {note && <span className="text-xs text-gray-400"> {note}</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 mb-6">
            <QrPlaceholder />
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              このQRコードは10分間有効です
            </div>
          </div>

          {/* CTA — desktop */}
          <div className="hidden sm:flex flex-col items-center gap-3">
            {nextBtn(false)}
            {backBtn()}
          </div>

        </div>
      </main>

      {/* Sticky CTA — mobile */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-5 py-3.5">
        {nextBtn(true)}
        {backBtn('w-full mt-2 py-1.5 block text-center')}
      </div>

    </div>
  );
}
```

**Step 2: Run tests — expect all to pass**

```bash
npx vitest run src/components/__tests__/StepQrTransition.test.tsx
```

Expected: all 8 tests **PASS**

**Step 3: Commit**

```bash
git add src/components/StepQrTransition.tsx
git commit -m "feat: add StepQrTransition component with QR placeholder"
```

---

### Task 3: Wire `StepQrTransition` into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Step 1: Make the following changes to `App.tsx`**

1. Add `"qr"` to the `AppStep` union type:
   ```ts
   type AppStep = "consent" | "ekyc" | "step1" | "step2" | "step3" | "qr";
   ```

2. Add the import at the top:
   ```ts
   import { StepQrTransition } from "./components/StepQrTransition";
   ```

3. Change Step 3's `onProceed` to navigate to `"qr"` instead of calling `alert`:
   ```tsx
   // BEFORE
   onProceed={(method) => {
     setIdentityMethod(method);
     alert("✅ ステップ3完了。\n確認方法：" + method);
   }}

   // AFTER
   onProceed={(method) => {
     setIdentityMethod(method);
     setStep("qr");
   }}
   ```

4. Add a new `if` block for the `"qr"` step, just before the final `return` (which renders Step 3):
   ```tsx
   if (step === "qr") {
     return (
       <StepQrTransition
         onProceed={() => alert("✅ 本人確認手続きを完了しました。")}
         onBack={() => setStep("step3")}
       />
     );
   }
   ```

**Step 2: Run the full test suite to confirm nothing regressed**

```bash
npm test
```

Expected: all existing tests + the 8 new tests **PASS**

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire StepQrTransition into app flow after step3"
```
