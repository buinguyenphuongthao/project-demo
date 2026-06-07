# Demo Entry Page (成約便/直便) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a version-selection entry page that routes testers into either the
existing 成約便 flow (separate ToS screen) or a condensed 直便 flow (ToS merged
into Step 1 via an inline field + modal), with all steps after Step 1 fully shared.

**Architecture:** New `VersionSelectEntry` screen becomes the app's initial step;
App.tsx tracks a `flowVersion` state that drives routing (which screens appear
before/within Step 1). A new `TermsModal` component (built on the existing
`TermsBox` + `termsSections`) is conditionally mounted inside `Step1PersonalInfo`
via a new `showTermsField` prop — no step component is duplicated.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind utility classes, Vitest +
React Testing Library.

**Design reference:** `docs/plans/2026-06-07-flow-version-entry-design.md`

---

## Note on the design doc's TermsModal scroll-hint

The design doc mentions an additional "最後までスクロールしてください" hint
gated on scroll position. On closer inspection, `TermsBox` (used by
`ConsentGate` today) **already** renders its own internal "↓ スクロールして
全文をご確認ください" hint that fades out at the bottom — and `ConsentGate`
does **not** gate its checkbox on scroll position; the checkbox is freely
checkable at any time. To stay consistent with that existing, already-approved
pattern (and avoid modifying the shared `TermsBox`), `TermsModal` reuses
`TermsBox` as-is and places a freely-checkable checkbox below it — exactly
mirroring `ConsentGate`'s structure inside a modal shell. This is simpler, more
consistent, and avoids brittle scroll-position testing in jsdom.

---

### Task 1: `TermsModal` component

**Files:**
- Create: `src/components/TermsModal.tsx`
- Test: `src/components/__tests__/TermsModal.test.tsx`

**Step 1: Write the failing tests**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TermsModal } from '../TermsModal';

describe('TermsModal', () => {
  it('renders nothing when closed', () => {
    render(<TermsModal open={false} agreed={false} onAgreedChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByText('利用規約')).not.toBeInTheDocument();
  });

  it('renders the terms content when open', () => {
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: '利用規約' })).toBeInTheDocument();
    expect(screen.getByText(/本規約は、株式会社マーケットエンタープライズ/)).toBeInTheDocument();
  });

  it('reflects the agreed prop in the checkbox', () => {
    render(<TermsModal open={true} agreed={true} onAgreedChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onAgreedChange when the checkbox is toggled', () => {
    const onAgreedChange = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={onAgreedChange} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onAgreedChange).toHaveBeenCalledWith(true);
  });

  it('calls onClose when the × button is clicked', () => {
    const onClose = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'モーダルを閉じる' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the 閉じる button is clicked', () => {
    const onClose = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the panel', () => {
    const onClose = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('heading', { name: '利用規約' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/__tests__/TermsModal.test.tsx`
Expected: FAIL — `Cannot find module '../TermsModal'`

**Step 3: Write the implementation**

```tsx
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
```

**Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/__tests__/TermsModal.test.tsx`
Expected: PASS (8 tests)

**Step 5: Commit**

```bash
git add src/components/TermsModal.tsx src/components/__tests__/TermsModal.test.tsx
git commit -m "feat: add TermsModal wrapping shared TermsBox with agree checkbox"
```

---

### Task 2: `VersionSelectEntry` component

**Files:**
- Create: `src/components/VersionSelectEntry.tsx`
- Test: `src/components/__tests__/VersionSelectEntry.test.tsx`

**Step 1: Write the failing tests**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VersionSelectEntry } from '../VersionSelectEntry';

describe('VersionSelectEntry', () => {
  it('renders the heading', () => {
    render(<VersionSelectEntry onSelect={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /デモバージョンを選択/ })).toBeInTheDocument();
  });

  it('renders both version options with their descriptions', () => {
    render(<VersionSelectEntry onSelect={vi.fn()} />);
    expect(screen.getByText('成約便')).toBeInTheDocument();
    expect(screen.getByText('規約は専用画面で表示されます')).toBeInTheDocument();
    expect(screen.getByText('直便')).toBeInTheDocument();
    expect(screen.getByText('規約はステップ1内で確認します')).toBeInTheDocument();
  });

  it('calls onSelect with "seiyaku" when 成約便 is clicked', () => {
    const onSelect = vi.fn();
    render(<VersionSelectEntry onSelect={onSelect} />);
    fireEvent.click(screen.getByText('成約便'));
    expect(onSelect).toHaveBeenCalledWith('seiyaku');
  });

  it('calls onSelect with "choku" when 直便 is clicked', () => {
    const onSelect = vi.fn();
    render(<VersionSelectEntry onSelect={onSelect} />);
    fireEvent.click(screen.getByText('直便'));
    expect(onSelect).toHaveBeenCalledWith('choku');
  });

  it('does not render a step-progress indicator', () => {
    render(<VersionSelectEntry onSelect={vi.fn()} />);
    expect(screen.queryByText(/ステップ中/)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/__tests__/VersionSelectEntry.test.tsx`
Expected: FAIL — `Cannot find module '../VersionSelectEntry'`

**Step 3: Write the implementation**

```tsx
import { HeaderLogo } from "./HeaderLogo";

export type DemoFlowVersion = "seiyaku" | "choku";

interface VersionSelectEntryProps {
  onSelect: (version: DemoFlowVersion) => void;
}

const VERSIONS: { id: DemoFlowVersion; title: string; description: string }[] = [
  { id: "seiyaku", title: "成約便", description: "規約は専用画面で表示されます" },
  { id: "choku",   title: "直便",   description: "規約はステップ1内で確認します" },
];

// Demo-only entry point: lets a tester pick which flow variant to walk through.
// No progress bar / back button — mirrors StepEkycIntro/ConsentGate's pre-flow treatment.
export function VersionSelectEntry({ onSelect }: VersionSelectEntryProps) {
  return (
    <div className="min-h-screen flex flex-col bg-page" style={{ fontFamily: 'var(--font-base)' }}>
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2">
        <div style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto' }}>
          <HeaderLogo />
        </div>
      </div>

      <main className="flex-1 flex justify-center py-5">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
        >
          <h1 className="text-xl font-bold text-[#1F2329] leading-snug mb-2">
            デモバージョンを選択してください
          </h1>
          <p className="mb-5 text-sm text-gray-500 leading-relaxed">
            テストするフローのバージョンを選択してください。
          </p>

          <div className="flex flex-col gap-3">
            {VERSIONS.map(v => (
              <button
                key={v.id}
                type="button"
                className="flex flex-col items-start gap-1 rounded-[8px] border-2 border-gray-200 bg-white px-4 py-3.5 text-left transition-colors duration-150 hover:border-accent-primary hover:bg-[#f0faf0]"
                onClick={() => onSelect(v.id)}
              >
                <span className="text-base font-semibold text-[#1F2329]">{v.title}</span>
                <span className="text-xs text-[#6B7280]">{v.description}</span>
              </button>
            ))}
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
```

**Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/__tests__/VersionSelectEntry.test.tsx`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add src/components/VersionSelectEntry.tsx src/components/__tests__/VersionSelectEntry.test.tsx
git commit -m "feat: add VersionSelectEntry demo flow picker screen"
```

---

### Task 3: Add `showTermsField` to `Step1PersonalInfo`

**Files:**
- Modify: `src/components/Step1PersonalInfo.tsx`
- Test: `src/components/__tests__/Step1PersonalInfo.terms.test.tsx`

**Step 1: Write the failing tests**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step1PersonalInfo } from '../Step1PersonalInfo';
import type { PersonalInfoForm } from '../../types';

const emptyForm: PersonalInfoForm = {
  name: '', kana: '', dobYear: '', dobMonth: '', dobDay: '',
  postalCode: '', prefecture: '', address: '', occupation: '',
  email: '', invoiceNotIssuer: false, invoiceNumber: '',
};

describe('Step1PersonalInfo — inline terms field (showTermsField)', () => {
  it('does not render the 利用規約 field by default', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByText('利用規約')).not.toBeInTheDocument();
  });

  it('renders the 利用規約 field with required badge and "not yet agreed" status when showTermsField is true', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} showTermsField />);
    expect(screen.getByText('利用規約')).toBeInTheDocument();
    expect(screen.getByText('内容を確認して同意する')).toBeInTheDocument();
  });

  it('opens the terms modal when the field row is tapped', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} showTermsField />);
    fireEvent.click(screen.getByText('内容を確認して同意する'));
    expect(screen.getByRole('heading', { name: '利用規約' })).toBeInTheDocument();
  });

  it('shows "✓ 同意済み" after checking agree in the modal and closing it', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} showTermsField />);
    fireEvent.click(screen.getByText('内容を確認して同意する'));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(screen.getByText('✓ 同意済み')).toBeInTheDocument();
  });
});
```

**Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/__tests__/Step1PersonalInfo.terms.test.tsx`
Expected: FAIL — `利用規約` text not found (field not rendered yet; prop doesn't exist)

**Step 3: Write the implementation**

3a. Add the import near the top of `src/components/Step1PersonalInfo.tsx` (after the existing `PersonalInfoForm` import, around line 2):

```tsx
import type { PersonalInfoForm } from "../types";
import { TermsModal } from "./TermsModal";
import takakuLogo from "../assets/takaku_logo.svg";
```

3b. Extend the `Props` interface (around line 151-155):

```tsx
interface Props {
  initialData: PersonalInfoForm;
  onProceed: (data: PersonalInfoForm) => void;
  onBack: () => void;
  showTermsField?: boolean;
}
```

3c. Update the component signature (line 157) and add new state/ref alongside the
existing invoice state (after line 173, `const [invoiceNumber, ...]`):

```tsx
export function Step1PersonalInfo({ initialData, onProceed, onBack, showTermsField = false }: Props) {
  // ... existing state declarations unchanged ...
  const [invoiceNumber, setInvoiceNumber] = useState(initialData.invoiceNumber);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
```

3d. Add a `termsRef` next to the other scroll-to-error refs (after line 185, `const emailRef`):

```tsx
  const emailRef  = useRef<HTMLDivElement>(null);
  const termsRef  = useRef<HTMLDivElement>(null);
```

3e. Update `isAllValid` (lines 190-192) to require terms agreement only when the field is shown:

```tsx
  const isAllValid =
    name !== '' && kana !== '' && dobFilled &&
    postal.length === 7 && prefecture !== '' && address !== '' && emailOk &&
    (!showTermsField || termsAgreed);
```

3f. Update `handleNext` (lines 280-303) to validate and scroll to the terms field:

```tsx
  function handleNext() {
    const errs: Record<string, string> = {};
    if (!name)               errs.name       = 'この項目は必須です。';
    if (!kana)               errs.kana       = 'この項目は必須です。';
    if (!dobFilled)          errs.dob        = '生年月日を選択してください。';
    if (postal.length !== 7) errs.postal     = '有効な7桁の郵便番号を入力してください。';
    if (!prefecture)         errs.prefecture = 'この項目は必須です。';
    if (!address)            errs.address    = 'この項目は必須です。';
    if (!emailOk)            errs.email      = '有効なメールアドレスを入力してください。';
    if (showTermsField && !termsAgreed) errs.terms = '規約に同意してください。';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = errs.name       ? nameRef
                  : errs.kana       ? kanaRef
                  : errs.dob        ? dobRef
                  : errs.postal     ? postalRef
                  : errs.prefecture ? prefRef
                  : errs.address    ? addrRef
                  : errs.email      ? emailRef
                  : termsRef;
      first.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onProceed({ name, kana, dobYear, dobMonth, dobDay, postalCode: postal, prefecture, address, occupation, email, invoiceNotIssuer, invoiceNumber });
  }
```

(Note: the original `first` chain ended with a bare `: emailRef` fallback — adding
`errs.email ?` makes the email branch explicit so `termsRef` can be the new fallback.)

3g. Add the field row right after the invoice-number field and before the
"CTA buttons — desktop only" comment (after line 518, the closing `)}` of the
`{!invoiceNotIssuer && (...)}` block):

```tsx
          {showTermsField && (
            <Field label="利用規約" badge="required" error={errors.terms} fieldRef={termsRef}>
              <button
                type="button"
                className={[
                  'block w-full h-[52px] px-4 text-base text-left rounded-lg',
                  'bg-white border border-gray-300 transition-colors duration-150',
                  'hover:border-gray-400',
                  termsAgreed ? 'text-accent-primary font-semibold' : 'text-[#A8AEB8]',
                ].join(' ')}
                onClick={() => setTermsModalOpen(true)}
              >
                {termsAgreed ? '✓ 同意済み' : '内容を確認して同意する'}
              </button>
            </Field>
          )}
```

3h. Mount the modal once, near the end of the component's JSX — right before the
closing `</div>` of the root container (after line 564, the closing `</div>` of
the mobile sticky CTA bar):

```tsx
      </div>

      {showTermsField && (
        <TermsModal
          open={termsModalOpen}
          agreed={termsAgreed}
          onAgreedChange={v => { setTermsAgreed(v); if (errors.terms) clearError('terms'); }}
          onClose={() => setTermsModalOpen(false)}
        />
      )}
    </div>
  );
}
```

(The first `</div>` here is the existing mobile sticky-CTA wrapper's closing tag;
the modal mounts as a sibling of `main`/the sticky bars, just before the
component's outermost closing `</div>`.)

**Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/__tests__/Step1PersonalInfo.terms.test.tsx`
Expected: PASS (4 tests)

Then run the full Step1 suite to confirm no regressions:

Run: `npx vitest run src/components/__tests__/Step1PersonalInfo.postal.test.tsx`
Expected: PASS (all existing tests still green)

**Step 5: Commit**

```bash
git add src/components/Step1PersonalInfo.tsx src/components/__tests__/Step1PersonalInfo.terms.test.tsx
git commit -m "feat: add optional inline terms field + modal to Step1PersonalInfo"
```

---

### Task 4: Wire the entry page and flow routing into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

There is no existing `App.test.tsx` (routing is verified by manually exercising
the app — see Task 5), so this task is implementation + manual verification only.

**Step 1: Update the `AppStep` type and imports**

At the top of `src/App.tsx`, add the import and extend the union type:

```tsx
import { VersionSelectEntry, type DemoFlowVersion } from "./components/VersionSelectEntry";
// ... existing imports ...

type AppStep = "entry" | "consent" | "ekyc" | "step1" | "step2" | "step3" | "qr" | "complete";
```

**Step 2: Add `flowVersion` state and change the initial step**

```tsx
export default function App() {
  const [step, setStep]                     = useState<AppStep>("entry");
  const [flowVersion, setFlowVersion]       = useState<DemoFlowVersion | null>(null);
  const [personalInfo, setPersonalInfo]     = useState<PersonalInfoForm>(emptyPersonalInfo);
  // ... rest unchanged ...
```

**Step 3: Add the `"entry"` route as the first branch**

Insert before the existing `if (step === "consent")` branch:

```tsx
  if (step === "entry") {
    return (
      <VersionSelectEntry
        onSelect={(version) => {
          setFlowVersion(version);
          setStep(version === "seiyaku" ? "consent" : "ekyc");
        }}
      />
    );
  }

  if (step === "consent") {
    return <ConsentGate onProceed={() => setStep("ekyc")} />;
  }
```

**Step 4: Adjust `StepEkycIntro`'s `onBack` to route based on `flowVersion`**

Change the `"ekyc"` branch's `onBack` from `() => setStep("consent")` to:

```tsx
  if (step === "ekyc") {
    return (
      <StepEkycIntro
        onProceed={() => setStep("step1")}
        onBack={() => setStep(flowVersion === "seiyaku" ? "consent" : "entry")}
      />
    );
  }
```

**Step 5: Pass `showTermsField` to `Step1PersonalInfo`**

```tsx
  if (step === "step1") {
    return (
      <Step1PersonalInfo
        initialData={personalInfo}
        showTermsField={flowVersion === "choku"}
        onProceed={(data) => {
          setPersonalInfo(data);
          setBankInfo(prev => ({ ...prev, holder: prev.holder || data.kana }));
          setStep("step2");
        }}
        onBack={() => setStep("ekyc")}
      />
    );
  }
```

**Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites green, including the three new test files from Tasks 1-3.

**Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: route demo entry selection into seiyaku/choku flows"
```

---

### Task 5: Manual end-to-end verification in the browser

**Files:** none (verification only)

**Step 1: Start the dev server**

Run: `npm run dev` (or use the project's `run` skill if available)

**Step 2: Walk the 成約便 path**

1. Load the app — confirm it starts on the new "デモバージョンを選択してください" screen with no progress bar/back button.
2. Click **成約便** — confirm it lands on the existing `ConsentGate` (separate ToS) screen.
3. Proceed through `ConsentGate → StepEkycIntro → Step1` — confirm Step1 has **no** "利用規約" field (identical to current behavior).
4. Click "戻る" on `StepEkycIntro` — confirm it returns to `ConsentGate` (not the entry screen).
5. Continue through Step2 → Step3 → QR → Complete — confirm nothing changed from current behavior.

**Step 3: Walk the 直便 path**

1. Reload, click **直便** — confirm it skips `ConsentGate` and lands directly on `StepEkycIntro`.
2. Click "戻る" on `StepEkycIntro` — confirm it returns to the entry/version-select screen (not `ConsentGate`).
3. Proceed to Step1 — confirm a "利用規約" field with `必須` badge appears, initially showing "内容を確認して同意する".
4. Tap the field — confirm `TermsModal` opens showing the same terms text as `ConsentGate`, with a scrollable box, scroll-fade hint, checkbox, × button, and "閉じる" button.
5. Close without checking — confirm the field still shows "内容を確認して同意する" and the CTA stays disabled if it's the only missing requirement.
6. Reopen, check "規約に同意する", click "閉じる" — confirm the field now shows "✓ 同意済み" in accent color.
7. Fill in the rest of Step1's required fields and confirm "次へ" becomes enabled and proceeds to Step2.
8. Continue through Step2 → Step3 → QR → Complete — confirm these are pixel-identical to the 成約便 path (shared components).

**Step 4: Report results**

Summarize what was verified and flag any visual or behavioral issues found, fixing them before considering the feature complete (per `superpowers:verification-before-completion`).

---

## Summary of new/changed files

- **New:** `src/components/TermsModal.tsx`, `src/components/__tests__/TermsModal.test.tsx`
- **New:** `src/components/VersionSelectEntry.tsx`, `src/components/__tests__/VersionSelectEntry.test.tsx`
- **New:** `src/components/__tests__/Step1PersonalInfo.terms.test.tsx`
- **Modified:** `src/components/Step1PersonalInfo.tsx` (optional `showTermsField` prop + inline terms field/modal)
- **Modified:** `src/App.tsx` (`"entry"` step, `flowVersion` state, routing)
- **Unchanged:** `types.ts`, `data/terms.ts`, `Step2BankRegistration`, `Step3IdentityVerification`, `StepQrTransition`, `StepComplete`, `ConsentGate`, `TermsBox`
