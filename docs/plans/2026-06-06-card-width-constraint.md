# Card Width Constraint (560px) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Constrain every step's card/content container to a max of 560px using `clamp()` for fluid mobile-first scaling, with no media queries.

**Architecture:** Three components each render their own full-page layout. Step1 and Step2 share the same pattern (sticky header + scrollable main + white card). ConsentGate has a simpler wrapper with no white card. Each needs its horizontal-gutter source consolidated to one place: the card's own `clamp()` width. The parent `<main>` in Step1/Step2 currently holds `px-4` — removing it prevents double-guttering when the card uses `calc(100% - 2rem)`.

**Tech Stack:** React, Tailwind CSS v4, inline `style` prop for the clamp value (Tailwind arbitrary values cannot cleanly express nested `calc()` inside `clamp()`).

---

### Task 1: Fix ConsentGate card width

**Files:**
- Modify: `src/components/ConsentGate.tsx:24`

**Step 1: Apply the clamp style to the content wrapper**

At line 24 in `ConsentGate.tsx`, the wrapper is:
```tsx
<div className="mx-auto w-full max-w-4xl p-4 pb-5">
```

Change it to — remove `mx-auto w-full max-w-4xl`, add inline style:
```tsx
<div
  className="p-4 pb-5"
  style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
>
```

The `<main className="flex-grow">` parent has no horizontal padding, so 100% here is the viewport width. The clamp gives 1rem gutters on mobile and caps at 560px.

**Step 2: Visually verify**

Run `npm run dev` and open the consent screen. Resize between 320px and 800px wide. Confirm:
- At 390px: card is `390 - 32 = 358px` wide, centered with ~1rem space each side
- At 600px+: card locks to 560px and is centered on the page
- Internal content (terms box, checkbox, button) unchanged

**Step 3: Commit**

```bash
git add src/components/ConsentGate.tsx
git commit -m "fix: constrain ConsentGate content to 560px with clamp()"
```

---

### Task 2: Fix Step1PersonalInfo card width

**Files:**
- Modify: `src/components/Step1PersonalInfo.tsx:300-301`

**Step 1: Remove `px-4` from `<main>` to prevent double-guttering**

At line 300:
```tsx
<main className="flex-1 flex justify-center px-4 py-5 pb-24 sm:pb-5">
```
Change to (remove `px-4` only):
```tsx
<main className="flex-1 flex justify-center py-5 pb-24 sm:pb-5">
```

**Step 2: Apply the clamp style to the white card**

At line 301:
```tsx
<div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8">
```
Change to — remove `w-full max-w-3xl`, add inline style:
```tsx
<div
  className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
  style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
>
```

The `justify-center` on `<main>` still handles vertical flex alignment; the card centers itself horizontally via `margin: 0 auto` within the flex container.

**Step 3: Visually verify**

Check the personal info form at multiple widths. Confirm:
- Mobile (390px): card is ~358px wide, 1rem space each side, no double gutters
- Desktop (800px): card is 560px, centered
- All form fields, sticky header, sticky mobile CTA unaffected

**Step 4: Run existing tests to confirm no regressions**

```bash
npm test
```
Expected: all tests pass (tests are behaviour-only, not layout).

**Step 5: Commit**

```bash
git add src/components/Step1PersonalInfo.tsx
git commit -m "fix: constrain Step1 card to 560px with clamp(), remove double-gutter px-4"
```

---

### Task 3: Fix Step2BankRegistration card width

**Files:**
- Modify: `src/components/Step2BankRegistration.tsx:355-356`

**Step 1: Remove `px-4` from `<main>`**

At line 355:
```tsx
<main className="flex-1 flex justify-center px-4 py-5 pb-24 sm:pb-5">
```
Change to:
```tsx
<main className="flex-1 flex justify-center py-5 pb-24 sm:pb-5">
```

**Step 2: Apply the clamp style to the white card**

At line 356:
```tsx
<div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8">
```
Change to:
```tsx
<div
  className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
  style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
>
```

**Step 3: Visually verify**

Check the bank registration form. Confirm:
- Card width behaves identically to Step1
- Bank/branch dropdowns, mode toggle, sticky CTA all unaffected

**Step 4: Commit**

```bash
git add src/components/Step2BankRegistration.tsx
git commit -m "fix: constrain Step2 card to 560px with clamp(), remove double-gutter px-4"
```

---

## Why no media queries

`clamp(320px, calc(100% - 2rem), 560px)` is self-contained:
- `320px` — minimum (prevents overflow on tiny screens)
- `calc(100% - 2rem)` — fluid (fills viewport minus 1rem each side)
- `560px` — maximum (prevents eye strain on wide screens)

The transition from fluid to capped happens automatically at `560 + 32 = 592px` viewport width.
