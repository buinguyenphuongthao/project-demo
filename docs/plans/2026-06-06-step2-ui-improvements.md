# Step 2 Bank Form — UI Improvements Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply seven focused UI/UX improvements to `Step2BankRegistration.tsx`: replace inconsistent tab icons with Lucide B-2 (Languages + Hash), increase helper and sub-label font sizes, fix label accessibility, improve the clear-button touch target, add a search empty state, and synchronise the mobile CTA's `disabled` state.

**Architecture:** All changes are confined to `src/components/Step2BankRegistration.tsx` (one file). One dependency is added (`lucide-react`). No new files, no API changes, no type changes. The component is a controlled-form React component using Tailwind CSS v4.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite 8, `lucide-react` (new), Vitest + @testing-library/react for tests.

---

## Context

The only file you will touch (besides `package.json` for the new dep) is:

```
src/components/Step2BankRegistration.tsx
```

The component structure to keep in mind:
- `ReqBadge` — red "必須" badge
- `Field` — label + badge + error wrapper (lines ~70–88)
- `ResolvedChip` — confirmed bank/branch display with clear button (lines ~92–109)
- `Dropdown` — search results list (lines ~117–136)
- Main component: tab toggle is around lines 386–418, name-mode sub-labels around 430/450, code-mode sub-labels around 477/499, helper texts at 373, 420, 540, 576, mobile CTA around 607–625.

---

## Task 1: Install lucide-react

**Files:**
- Modify: `package.json` (via npm)

**Step 1: Install the package**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo
npm install lucide-react
```

Expected output: `added 1 package` (or similar). Should complete without errors.

**Step 2: Verify it installed**

```bash
node -e "require('lucide-react'); console.log('ok')"
```

Expected: `ok`

---

## Task 2: Replace tab icons with Lucide Languages + Hash

**Files:**
- Modify: `src/components/Step2BankRegistration.tsx`

This fixes the inconsistent `あ` (styled text, not an icon) and `123` (no icon at all) with proper icons that inherit `currentColor` so active/inactive states work automatically.

**Step 1: Add the import at the top of the file**

Find line 1–3 (the existing imports). Add the lucide import after the React import:

```tsx
import { Languages, Hash } from "lucide-react";
```

The top of the file should look like:

```tsx
import { useState, useRef } from "react";
import { Languages, Hash } from "lucide-react";
import type { BankInfoForm, BankEntry, BranchEntry } from "../types";
import takakuLogo from "../assets/takaku_logo.svg";
```

**Step 2: Replace the tab toggle buttons**

Find the Mode toggle section (around line 387). The current code has two buttons where:
- Button 1 contains `<span className={searchMode === 'name' ? 'text-white' : 'text-[#4A7BF7]'} style={{ fontSize: '16px', fontWeight: 400 }}>あ</span>`
- Button 2 contains `<span className="font-mono text-sm">123</span>`

Replace the entire mode toggle `<div>` with:

```tsx
{/* Mode toggle */}
<div className="flex rounded-lg overflow-hidden border border-gray-300 mb-3">
  <button
    type="button"
    onClick={() => switchMode('name')}
    className={[
      'flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors',
      searchMode === 'name'
        ? 'bg-accent-primary text-white'
        : 'bg-white text-gray-500 hover:bg-gray-50',
    ].join(' ')}
  >
    <Languages size={16} aria-hidden />
    銀行名
  </button>
  <button
    type="button"
    onClick={() => switchMode('code')}
    className={[
      'flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5',
      'transition-colors border-l border-gray-300',
      searchMode === 'code'
        ? 'bg-accent-primary text-white'
        : 'bg-white text-gray-500 hover:bg-gray-50',
    ].join(' ')}
  >
    <Hash size={16} aria-hidden />
    銀行コード
  </button>
</div>
```

**Step 3: Verify the dev server renders the icons**

```bash
npm run dev
```

Open the app, navigate to Step 2. The tab toggle should show a globe-like Languages icon on the left and a # Hash icon on the right. Both icons should turn white when their tab is active and be gray when inactive.

---

## Task 3: Increase helper text and sub-label font sizes

**Files:**
- Modify: `src/components/Step2BankRegistration.tsx`

All `text-xs` (12px) helper texts and sub-labels need to become `text-sm` (14px). There are 8 occurrences.

**Step 1: Fix the 4 helper / guide texts**

These are informational paragraphs below inputs. Change `text-xs` → `text-sm` on each:

| Location (approx line) | Old class string | New class string |
|---|---|---|
| Below 口座名義人 input (~373) | `mt-1 text-xs text-gray-500` | `mt-1 text-sm text-gray-500` |
| Below mode toggle (~420) | `text-xs text-gray-500 mb-3` | `text-sm text-gray-500 mb-3` |
| Below 口座番号 input (~540) | `mt-1 text-xs text-gray-500` | `mt-1 text-sm text-gray-500` |
| Below 査定連絡設定 radios (~576) | `mt-2 text-xs text-gray-500` | `mt-2 text-sm text-gray-500` |

**Step 2: Fix the 4 sub-labels inside the bank/branch section**

These are the small `<p>` labels directly above each search input (銀行名, 支店名, 銀行コード, 支店コード):

| Location (approx line) | Old | New |
|---|---|---|
| 銀行名 label (~430) | `text-xs text-gray-500 mb-1` | `text-sm text-gray-500 mb-1` |
| 支店名 label (~450) | `text-xs text-gray-500 mb-1` | `text-sm text-gray-500 mb-1` |
| 銀行コード label (~477) | `text-xs text-gray-500 mb-1` | `text-sm text-gray-500 mb-1` |
| 支店コード label (~499) | `text-xs text-gray-500 mb-1` | `text-sm text-gray-500 mb-1` |

**Step 3: Visual check**

In the running dev server, confirm all helper texts and sub-labels are slightly larger and easier to read without disrupting hierarchy (main field labels at `text-base` should still look bigger).

---

## Task 4: Fix label accessibility in the Field component

**Files:**
- Modify: `src/components/Step2BankRegistration.tsx`

`Field` currently wraps the label in a `<span>`, which screen readers cannot associate with the input. Fix it to use a `<label htmlFor>` when an id is provided.

**Step 1: Update the `Field` component definition**

Find the `Field` function (around line 70). Replace it entirely with:

```tsx
function Field({
  label, badge, error, htmlFor, children,
}: {
  label: string;
  badge?: 'required';
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        {htmlFor
          ? <label htmlFor={htmlFor} className="text-base font-normal text-[#1F2329]">{label}</label>
          : <span className="text-base font-normal text-[#1F2329]">{label}</span>
        }
        {badge === 'required' && <ReqBadge />}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-[#F36B6B] font-medium">{error}</p>}
    </div>
  );
}
```

**Step 2: Wire up 口座名義人**

Find the `<Field label="口座名義人" ...>` usage (around line 361). Add `htmlFor="holder"`:

```tsx
<Field label="口座名義人" badge="required" error={errors.holder} htmlFor="holder">
  <input
    id="holder"
    className={INPUT}
    type="text"
    placeholder="例）カイトリ タロウ"
    value={holder}
    maxLength={250}
    onChange={e => {
      setHolder(e.target.value);
      if (errors.holder) setErrors(er => ({ ...er, holder: '' }));
    }}
  />
  <p className="mt-1 text-sm text-gray-500">
    通帳・キャッシュカードと同じカタカナ氏名をご入力ください。
  </p>
</Field>
```

**Step 3: Wire up 口座番号**

Find `<Field label="口座番号" ...>` (around line 530). Add `htmlFor="accountNumber"`:

```tsx
<Field label="口座番号" badge="required" error={errors.accountNumber} htmlFor="accountNumber">
  <input
    id="accountNumber"
    className={INPUT}
    type="text"
    inputMode="numeric"
    maxLength={7}
    placeholder="例：1234567"
    value={accountNumber}
    onChange={e => onAccountChange(e.target.value)}
  />
  <p className="mt-1 text-sm text-gray-500">※ 普通預金口座のみ対応</p>
</Field>
```

**Step 4: Verify with browser dev tools**

In the running app, click the label "口座名義人" — the cursor should jump into the input (confirms htmlFor/id association works).

---

## Task 5: Fix ResolvedChip clear button touch target

**Files:**
- Modify: `src/components/Step2BankRegistration.tsx`

The current `×` character in a `text-xl` button has an effective tap target of ~14×14 px, well below the 44×44 px minimum for mobile. Replace with a proper 32×32 button containing a small SVG cross.

**Step 1: Replace the `ResolvedChip` component**

Find the `ResolvedChip` function (around line 92). Replace it entirely with:

```tsx
function ResolvedChip({ name, code, onClear }: { name: string; code: string; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between h-[52px] px-4 bg-white border border-gray-300 rounded-lg text-[#1F2329]">
      <span className="text-base">{name}</span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 font-mono">{code}</span>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center w-8 h-8 -mr-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="クリア"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="1" y1="1" x2="11" y2="11"/>
            <line x1="11" y1="1" x2="1" y2="11"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Visual check**

Select a bank in name mode so the `ResolvedChip` appears. The clear button should be a 32×32 rounded area with a small × SVG inside. Hovering should show a light gray circle.

---

## Task 6: Add "見つかりませんでした" empty state to Dropdown

**Files:**
- Modify: `src/components/Step2BankRegistration.tsx`

Currently, when a query has 0 results the dropdown simply doesn't appear (all call sites check `items.length > 0`). Users get no feedback. Fix: show the dropdown with an empty-state message, then remove the `&& items.length > 0` guards at the call sites.

**Step 1: Update the `Dropdown` component**

Find the `Dropdown` function (around line 117). Replace it entirely with:

```tsx
function Dropdown({ items, onSelect }: {
  items: PickItem[];
  onSelect: (item: PickItem) => void;
}) {
  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg max-h-44 overflow-y-auto z-30 shadow-md">
      {items.length === 0 ? (
        <p className="px-4 py-3 text-sm text-gray-400 text-center">見つかりませんでした</p>
      ) : items.map(item => (
        <button
          key={item.code}
          type="button"
          onMouseDown={() => onSelect(item)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 text-left"
        >
          <span className="text-[#1F2329]">{item.name}</span>
          <span className="text-xs text-gray-400 font-mono">{item.code}</span>
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Remove the `items.length > 0` guards at the 4 Dropdown call sites**

There are 4 places where the dropdown is rendered conditionally. Find each one and remove the `&& <results>.length > 0` check. The `open` flag alone is sufficient.

Before (name mode, bank — around line 443):
```tsx
{bankNameOpen && bankNameResults.length > 0 && (
  <Dropdown items={bankNameResults} onSelect={selectBankByName} />
)}
```

After:
```tsx
{bankNameOpen && (
  <Dropdown items={bankNameResults} onSelect={selectBankByName} />
)}
```

Apply the same change to the other three call sites:
- `branchNameOpen && branchNameResults.length > 0` → `branchNameOpen`
- `bankCodeOpen && bankCodeResults.length > 0` → `bankCodeOpen`
- `branchCodeOpen && branchCodeResults.length > 0` → `branchCodeOpen`

**Step 3: Verify**

Type a query that returns no results (e.g., type "zzz" in the bank name field). A dropdown should appear with "見つかりませんでした" in gray centered text.

---

## Task 7: Add `disabled` to mobile CTA button

**Files:**
- Modify: `src/components/Step2BankRegistration.tsx`

The desktop 次へ button has `disabled={!isAllValid}` to prevent accidental submission. The mobile sticky button at the bottom of the file does not — it shows the gray styling but can still be clicked. Add the prop to match desktop behaviour.

**Step 1: Find the mobile sticky CTA**

Look for the comment `{/* Sticky CTA — mobile */}` (around line 607). The `<button>` inside it looks like:

```tsx
<button
  className={[
    'button-background w-full rounded-[10px] py-4',
    'text-[17px] font-bold text-white',
    'transition-[colors,box-shadow,transform] duration-200',
    isAllValid ? 'bg-accent-primary cursor-pointer' : 'bg-gray-300 cursor-not-allowed',
  ].join(' ')}
  onClick={handleNext}
>
  次へ
</button>
```

**Step 2: Add the `disabled` prop**

```tsx
<button
  className={[
    'button-background w-full rounded-[10px] py-4',
    'text-[17px] font-bold text-white',
    'transition-[colors,box-shadow,transform] duration-200',
    isAllValid ? 'bg-accent-primary cursor-pointer' : 'bg-gray-300 cursor-not-allowed',
  ].join(' ')}
  onClick={handleNext}
  disabled={!isAllValid}
>
  次へ
</button>
```

**Step 3: Verify on mobile viewport**

In the browser, switch DevTools to a mobile viewport (e.g., iPhone 14, 390×844). On Step 2 with an incomplete form, tap the 次へ button at the bottom — nothing should happen and the form should not submit/validate.

---

## Final verification

After all 7 tasks, run the full dev flow and check every change:

```bash
npm run dev
```

Checklist:
- [ ] Tab toggle shows Languages icon (name) and Hash icon (code), both icons turn white when active
- [ ] Helper texts (カタカナ氏名、コード入力案内、普通預金口座のみ、不要選択時注意) are visibly larger
- [ ] Sub-labels 銀行名/支店名/銀行コード/支店コード are visibly larger
- [ ] Clicking the label "口座名義人" focuses the input (label association works)
- [ ] ResolvedChip clear button shows a 32×32 hover area on mouse-over
- [ ] Typing a no-match query shows "見つかりませんでした" in the dropdown
- [ ] On mobile viewport, tapping the gray 次へ button does nothing until form is complete

If tests exist, run them:

```bash
npm test
```

Expected: all existing tests still pass (no behaviour was changed, only visual and accessibility).
