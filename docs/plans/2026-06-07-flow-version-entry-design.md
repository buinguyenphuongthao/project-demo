# Design: Demo Entry Page for 成約便 / 直便 Flow Selection

## Goal

Support two versions of the multi-step registration form in this demo:

- **成約便** — current flow, where the Terms of Service is a separate screen
  (`ConsentGate`) shown before Step 1.
- **直便** — condensed flow, where the Terms of Service is merged into Step 1
  as an inline field row that opens a modal. All steps after Step 1 are
  identical between the two versions.

A new entry page sits in front of both flows, letting a tester choose which
version to walk through. Selecting a version routes straight to that version's
correct starting screen.

## Section 1 — Flow & state architecture

Add `"entry"` as a new initial `AppStep`, before `"consent"`. `App.tsx` gains:

```ts
const [flowVersion, setFlowVersion] = useState<"seiyaku" | "choku" | null>(null);
```

Routing:

- `"entry"` renders `VersionSelectEntry` with two choices.
- **成約便** → `flowVersion = "seiyaku"`, `step = "consent"` → existing flow
  unchanged: `consent → ekyc → step1 (no terms field) → step2 → step3 → qr → complete`.
- **直便** → `flowVersion = "choku"`, `step = "ekyc"` (skips `consent`) →
  `ekyc → step1 (with inline terms field + modal) → step2 → step3 → qr → complete`.

Everything from Step 1 onward is fully shared — no duplicated step components.
The only difference is which screens appear before/within Step 1.

`onBack` adjustments needed:

- `StepEkycIntro`'s `onBack` → `"consent"` for 成約便, `"entry"` for 直便.
- `Step1PersonalInfo`'s `onBack` already targets `"ekyc"` in both cases — no change.

Routing stays centralized in `App.tsx`; no branching inside shared step
components (other than Step 1's terms field, see Section 3).

## Section 2 — Entry page (`VersionSelectEntry`)

New component, structurally similar to `StepEkycIntro` (logo-only sticky
header, no progress bar — pre-flow screen, not a counted step):

- Sticky header with `HeaderLogo`, centered.
- White card (`bg-white rounded-2xl border border-gray-200 shadow-...`),
  centered, same `clamp(320px, calc(100% - 2rem), 560px)` width constraint
  used throughout the app.
- Heading: 「デモバージョンを選択してください」+ short sub-line explaining
  this is a testing/demo entry point.
- Two stacked, tappable cards (single column, mobile-first):
  - **成約便**: title + one-line note "規約は専用画面で表示されます"
  - **直便**: title + one-line note "規約はステップ1内で確認します"
  - Styled like `CheckCard` (border, rounded corners, hover/active state),
    but each acts as an immediate navigation trigger — tapping calls
    `onSelect("seiyaku" | "choku")` directly. No separate CTA button.
- No back button (entry point, mirrors `ConsentGate`).
- Same `© MarketEnterprise Co.,Ltd.` footer as `ConsentGate`.

## Section 3 — Merged ToS field + modal in Step 1 (直便 only)

New optional prop on `Step1PersonalInfo`: `showTermsField?: boolean`.

When `true`, render an additional field row near the bottom of the form
(after the invoice section, before the CTA):

- Label "利用規約" + `必須` badge.
- Tappable row showing status: "内容を確認して同意する" (not agreed, muted)
  or "✓ 同意済み" (agreed, accent-colored) — same visual language as other
  tappable Step1 rows.
- Tapping opens `TermsModal`.

`TermsModal` (new component):

- Overlay + centered white rounded-2xl panel, width matching the card
  constraint, internal scroll.
- Header: "利用規約" + close (×).
- Body: reuses `TermsBox`, bound to `termsSections` from `../data/terms`
  (same data source as `ConsentGate` — identical content across flows).
- Footer: checkbox "規約に同意する" with a "最後までスクロールしてください"
  hint shown until the user scrolls to the bottom (mirrors `ConsentGate`'s
  scroll-hint pattern), plus a "閉じる" button that closes the modal and
  commits the checkbox state back to the field row.
- Closing without checking leaves the field row in "not agreed" state.

Validation: `termsAgreed` joins `isAllValid` and the `handleNext` required-field
check, with its own scroll-to-error ref — exactly like other required fields.
It is **not** added to `PersonalInfoForm` / the `onProceed` payload; it's a
flow-gating concern, not submitted data (mirrors `ConsentGate`'s `agreed` state,
which also isn't persisted).

## Section 4 — Files & changes

**New files:**
- `src/components/VersionSelectEntry.tsx`
- `src/components/TermsModal.tsx`

**Modified files:**
- `src/App.tsx` — add `"entry"` step + `flowVersion` state, wire
  `VersionSelectEntry.onSelect`, adjust `StepEkycIntro.onBack` routing, pass
  `showTermsField={flowVersion === "choku"}` to `Step1PersonalInfo`.
- `src/components/Step1PersonalInfo.tsx` — add `showTermsField` prop,
  `termsAgreed` state/ref, field row, modal mount, validation/CTA integration.

**Unchanged:** `types.ts`, `Step2BankRegistration`, `Step3IdentityVerification`,
`StepQrTransition`, `StepComplete`, `data/terms` — fully shared across both
flows.

**Verification:** manually walk both flows end-to-end in the browser (entry →
correct starting screen → Step1 behaves correctly with/without the terms field
→ shared steps proceed identically), plus run the existing test suite to check
for regressions.
