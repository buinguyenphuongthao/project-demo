# Step 1 Personal Info — Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `Step1PersonalInfo.tsx` so its layout matches the centered-card reference style while staying visually consistent with the ConsentGate (Step 0) — same warm page background, green accents, white card — and replacing the tap-to-edit pattern with always-visible inputs.

**Architecture:** The existing component keeps all its state, validation, postal-lookup, DoB day recalculation, scroll-to-first-error, and form state preservation logic. Only the rendering layer changes: replace the tap-to-edit list rows with a centered white card containing standard form fields, and update the visual tokens (input height, radius, badges, progress pills, button color).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite 8, Noto Sans JP (already loaded), Playwright for screenshots.

---

## Design tokens (reference for all tasks)

| Token | Value | Usage |
|---|---|---|
| Page bg | `bg-page` (`#f9f5ee`) | outer wrapper (same as ConsentGate) |
| Card bg | `bg-white` | centered form card |
| Card border | `border border-gray-200` | subtle card edge |
| Card radius | `rounded-2xl` | 16 px |
| Card shadow | `shadow-[0_2px_12px_rgba(0,0,0,0.04)]` | lifted feeling |
| Input fill | `bg-[#F6F7F9]` | resting state |
| Input height | `h-14` (56 px) | tall, generous |
| Input radius | `rounded-[10px]` | matches card feel |
| Input focus | `focus:bg-white focus:border-[#4A90D9] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.18)]` | blue ring |
| Required badge | `bg-[#F36B6B] text-white` | red pill, 11 px bold |
| Optional badge | `bg-[#6B7280] text-white` | gray pill, 11 px bold |
| Progress pill (active) | `bg-accent-primary` (green) | current step |
| Progress pill (inactive) | `bg-gray-300` | future steps |
| Next button | green, same style as ConsentGate's PrimaryButton | consistency |
| Section icon | `stroke-[color:var(--color-accent-primary)]` | green person icon |

---

### Task 1: Add shared sub-components (`Badge`, `Field`, `SelectWrap`, `CheckCard`)

These replace `Badge`, `FieldLabel`, and `DisplayVal` from the old design.

**Files:**
- Modify: `src/components/Step1PersonalInfo.tsx` — replace the three old sub-components (lines 47–67) with four new ones

**Step 1: Remove old sub-components and add new ones**

Replace the three sub-component functions (Badge, FieldLabel, DisplayVal) with:

```tsx
// ── Design tokens ─────────────────────────────────────────────
const INPUT = [
  'block w-full h-14 px-[18px] text-base text-[#1F2329]',
  'bg-[#F6F7F9] border-[1.5px] border-transparent rounded-[10px]',
  'outline-none appearance-none transition-all duration-150',
  'placeholder:text-[#A8AEB8]',
  'hover:bg-[#F1F2F4]',
  'focus:bg-white focus:border-[#4A90D9] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.18)]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

function ReqBadge() {
  return (
    <span className="inline-flex items-center text-[11px] font-bold px-2 py-[3px] rounded-[5px] bg-[#F36B6B] text-white leading-none">
      必須
    </span>
  );
}

function OptBadge() {
  return (
    <span className="inline-flex items-center text-[11px] font-bold px-2 py-[3px] rounded-[5px] bg-[#6B7280] text-white leading-none">
      任意
    </span>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span
        className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-[30%] rotate-45 w-[9px] h-[9px] border-r-2 border-b-2 border-[#6B7280]"
        aria-hidden="true"
      />
    </div>
  );
}

function Field({
  label, badge, error, children, fieldRef,
}: {
  label: string;
  badge?: 'required' | 'optional';
  error?: string;
  children: React.ReactNode;
  fieldRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className="mb-6" ref={fieldRef}>
      <div className="flex items-center gap-2.5 mb-[10px]">
        <span className="text-[15px] font-bold text-[#1F2329]">{label}</span>
        {badge === 'required' && <ReqBadge />}
        {badge === 'optional' && <OptBadge />}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-[12px] text-[#F36B6B] font-medium">{error}</p>
      )}
    </div>
  );
}

function CheckCard({
  checked, onChange, label, sublabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sublabel?: string;
}) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className={[
        'flex items-start gap-3.5 px-5 py-[18px] rounded-[10px] cursor-pointer select-none mb-4',
        'border-2 transition-colors duration-150',
        checked
          ? 'border-accent-primary bg-[#f0faf0]'
          : 'border-gray-200 bg-white',
      ].join(' ')}
      onClick={() => onChange(!checked)}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); }
      }}
    >
      <div className={[
        'flex-shrink-0 mt-0.5 w-6 h-6 rounded-[5px] border-2 flex items-center justify-center',
        checked ? 'border-accent-primary' : 'border-gray-300',
      ].join(' ')}>
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <polyline
              points="2,7 6,11 12,3"
              stroke="var(--color-accent-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className={`text-[15px] font-bold ${checked ? 'text-accent-primary' : 'text-[#1F2329]'}`}>
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5 text-sm text-[#6B7280]">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Type-check**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo && npx tsc --noEmit
```

Expected: 0 errors (or only errors in the main component body that reference old DisplayVal/FieldLabel — that's fine, Task 2 fixes those).

---

### Task 2: Rewrite the main component's state and header

Drop tap-to-edit state (`activeField`, `editVal`) and rewrite the sticky progress header to use the current token scheme.

**Files:**
- Modify: `src/components/Step1PersonalInfo.tsx` — main component body

**Step 1: Add logo import at the top of the file**

Add after the existing imports:
```tsx
import takakuLogo from "../assets/takaku_logo.svg";
```

**Step 2: Replace state inside `Step1PersonalInfo`**

Remove these state variables:
```tsx
// REMOVE:
const [activeField, setActiveField] = useState<string | null>(null);
const [editVal, setEditVal] = useState('');
```

Remove these derived values from old design:
```tsx
// REMOVE:
const age = computeAge(dobYear, dobMonth, dobDay);
```

Remove helper functions that rely on `activeField`/`editVal`:
```tsx
// REMOVE: activate(), commit(), rowCls(), inputCls constant
```

Simplify postal state: replace `postalMode` + `postalInputVal` with just:
```tsx
const [postalLoading, setPostalLoading] = useState(false);
```

Update `emailValid` to be derived (not state):
```tsx
// REPLACE:
const [emailValid, setEmailValid] = useState(validateEmail(initialData.email));
// WITH:
const emailOk = validateEmail(email);
```

Update `isAllValid`:
```tsx
const isAllValid =
  name !== '' && kana !== '' && dobFilled &&
  postal.length === 7 && prefecture !== '' && address !== '' && emailOk;
```

**Step 3: Rewrite postal handlers**

```tsx
function handlePostalChange(e: React.ChangeEvent<HTMLInputElement>) {
  const v = e.target.value.replace(/\D/g, '').slice(0, 7);
  setPostal(v);
  if (errors.postal) clearError('postal');
}

function handlePostalBlur() {
  if (postal.length === 0) return;
  if (postal.length !== 7) {
    setError('postal', '有効な7桁の郵便番号を入力してください。');
    return;
  }
  setPostalLoading(true);
  setPrefecture('');
  setAddress('');
  setTimeout(() => {
    setPrefecture('東京都');
    setAddress('千代田区有楽町');
    clearError('prefecture');
    clearError('address');
    setPostalLoading(false);
  }, 900);
}
```

(Rename `postalRaw` → `postal` throughout, rename `postalError` → use `errors.postal`)

**Step 4: Rewrite `handleNext` to use new variable names**

```tsx
function handleNext() {
  const errs: Record<string, string> = {};
  if (!name)           errs.name       = 'この項目は必須です。';
  if (!kana)           errs.kana       = 'この項目は必須です。';
  if (!dobFilled)      errs.dob        = '生年月日を選択してください。';
  if (postal.length !== 7) errs.postal = '有効な7桁の郵便番号を入力してください。';
  if (!prefecture)     errs.prefecture = 'この項目は必須です。';
  if (!address)        errs.address    = 'この項目は必須です。';
  if (!emailOk)        errs.email      = '有効なメールアドレスを入力してください。';

  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    const first = errs.name      ? nameRef
                : errs.kana      ? kanaRef
                : errs.dob       ? dobRef
                : errs.postal    ? postalRef
                : errs.prefecture? prefRef
                : errs.address   ? addrRef
                : emailRef;
    first.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  onProceed({ name, kana, dobYear, dobMonth, dobDay, postalCode: postal, prefecture, address, occupation, email, invoiceNotIssuer, invoiceNumber });
}
```

**Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors only in the JSX return (not yet rewritten) — state/logic errors = 0.

---

### Task 3: Rewrite the JSX return — outer wrapper and header

**Files:**
- Modify: `src/components/Step1PersonalInfo.tsx` — JSX `return (...)` block

**Step 1: Replace the outer wrapper + sticky progress header**

```tsx
return (
  <div
    className="min-h-screen flex flex-col bg-page"
    style={{ fontFamily: 'var(--font-base)' }}
  >
    {/* ── Sticky progress header ── */}
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-5 pt-3 pb-3">
      <div className="mx-auto max-w-3xl flex items-center justify-between">
        <img src={takakuLogo} alt="高く売れるドットコム" className="h-[44px]" />
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">4ステップ中 1</p>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full transition-colors ${i === 0 ? 'bg-accent-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ── Page body (Tasks 4–5 go here) ── */}

  </div>
);
```

**Step 2: Type-check + take screenshot**

```bash
npx tsc --noEmit
```

Then take a Playwright screenshot to verify the header renders:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:5173');
  // Click through ConsentGate to reach Step 1
  await p.click('input[type=checkbox]');
  await p.click('button');
  await p.screenshot({ path: '/tmp/step1-header.png', fullPage: false });
  await b.close();
})();
"
```

Expected: Logo on left, small progress pills on right, green first pill.

---

### Task 4: Rewrite the JSX return — centered form card with all fields

**Files:**
- Modify: `src/components/Step1PersonalInfo.tsx` — inside the `<main>` after the header

**Step 1: Add the centered card + all form fields**

Inside the outer wrapper, after the sticky header, add:

```tsx
{/* ── Scrollable content ── */}
<main className="flex-1 flex justify-center px-4 py-8 pb-28 sm:pb-8">
  <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-7 sm:p-10">

    {/* Section heading */}
    <h1 className="flex items-center gap-[10px] text-[22px] font-bold text-[#1F2329] mb-8">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="var(--color-accent-primary)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      お申込み情報
    </h1>

    {/* お名前（漢字） */}
    <Field label="お名前（漢字）" badge="required" error={errors.name} fieldRef={nameRef}>
      <input
        className={INPUT}
        type="text"
        placeholder="例）買取 太郎"
        value={name}
        maxLength={250}
        onChange={e => { setName(e.target.value); if (errors.name) clearError('name'); }}
      />
    </Field>

    {/* お名前（カタカナ） */}
    <Field label="お名前（カタカナ）" badge="required" error={errors.kana} fieldRef={kanaRef}>
      <input
        className={INPUT}
        type="text"
        placeholder="例）カイトリ　タロウ"
        value={kana}
        maxLength={250}
        onChange={e => { setKana(e.target.value); if (errors.kana) clearError('kana'); }}
      />
    </Field>

    {/* 生年月日 */}
    <Field label="生年月日" badge="required" error={errors.dob} fieldRef={dobRef}>
      <div className="flex gap-2">
        <div className="flex-[2]">
          <SelectWrap>
            <select
              className={INPUT}
              value={dobYear}
              onChange={e => handleYearChange(e.target.value)}
            >
              <option value="">----</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
          </SelectWrap>
        </div>
        <div className="flex-1">
          <SelectWrap>
            <select
              className={INPUT}
              value={dobMonth}
              onChange={e => handleMonthChange(e.target.value)}
            >
              <option value="">--</option>
              {monthOptions.map(m => <option key={m} value={m}>{m}月</option>)}
            </select>
          </SelectWrap>
        </div>
        <div className="flex-1">
          <SelectWrap>
            <select
              className={INPUT}
              value={dobDay}
              onChange={e => { setDobDay(e.target.value); if (errors.dob) clearError('dob'); }}
            >
              <option value="">--</option>
              {dayOptions.map(d => <option key={d} value={d}>{d}日</option>)}
            </select>
          </SelectWrap>
        </div>
      </div>
    </Field>

    {/* メールアドレス */}
    <Field label="メールアドレス" badge="required" error={errors.email} fieldRef={emailRef}>
      <input
        className={INPUT}
        type="email"
        placeholder="例）info@takakuureru.com"
        value={email}
        maxLength={254}
        onChange={e => { setEmail(e.target.value); if (errors.email) clearError('email'); }}
        onBlur={() => {
          if (email && !validateEmail(email))
            setError('email', '有効なメールアドレスを入力してください。');
          else if (email) clearError('email');
        }}
      />
    </Field>

    {/* 郵便番号 */}
    <Field label="郵便番号" badge="required" error={errors.postal} fieldRef={postalRef}>
      <div className="relative">
        <input
          className={INPUT}
          type="text"
          inputMode="numeric"
          maxLength={7}
          placeholder="例）1040061"
          value={postal}
          onChange={handlePostalChange}
          onBlur={handlePostalBlur}
          disabled={postalLoading}
        />
        {postalLoading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2.5" opacity="0.3"/>
              <path d="M10 3 A7 7 0 0 1 17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </span>
        )}
      </div>
      {postalLoading && (
        <p className="mt-1.5 text-xs text-gray-500">住所を検索中…</p>
      )}
    </Field>

    {/* 都道府県 */}
    <Field label="都道府県" badge="required" error={errors.prefecture} fieldRef={prefRef}>
      <SelectWrap>
        <select
          className={INPUT}
          value={prefecture}
          disabled={postalLoading}
          onChange={e => { setPrefecture(e.target.value); if (errors.prefecture) clearError('prefecture'); }}
        >
          <option value="">---</option>
          {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </SelectWrap>
    </Field>

    {/* 住所 */}
    <Field label="住所" badge="required" error={errors.address} fieldRef={addrRef}>
      <input
        className={INPUT}
        type="text"
        placeholder="例）千代田区有楽町 1-1-1"
        value={address}
        maxLength={250}
        disabled={postalLoading}
        onChange={e => { setAddress(e.target.value); if (errors.address) clearError('address'); }}
      />
    </Field>

    {/* 職業 */}
    <Field label="職業" badge="optional">
      <SelectWrap>
        <select
          className={INPUT}
          value={occupation}
          onChange={e => setOccupation(e.target.value)}
        >
          <option value="">---</option>
          {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </SelectWrap>
    </Field>

    {/* 適格請求書 */}
    <CheckCard
      checked={invoiceNotIssuer}
      onChange={setInvoiceNotIssuer}
      label="適格請求書発行事業者ではありません"
      sublabel="インボイス制度の登録事業者でない場合はチェックしてください"
    />

    {!invoiceNotIssuer && (
      <Field label="適格請求書発行事業者 登録番号" badge="optional">
        <input
          className={INPUT}
          type="text"
          placeholder="例）T0123456789012"
          value={invoiceNumber}
          onChange={e => setInvoiceNumber(e.target.value)}
        />
      </Field>
    )}

    {/* CTA buttons — desktop only (mobile uses sticky bar below) */}
    <div className="hidden sm:flex flex-col items-center gap-3 mt-10">
      <button
        className={[
          'button-background w-full max-w-[480px] rounded-[10px] py-4',
          'text-[17px] font-bold tracking-wide text-white',
          'transition-[colors,box-shadow,transform] duration-200',
          isAllValid ? 'bg-accent-primary cursor-pointer' : 'bg-gray-300 cursor-not-allowed',
        ].join(' ')}
        onClick={handleNext}
        disabled={!isAllValid}
      >
        次へ
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
```

**Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

### Task 5: Rewrite the sticky mobile CTA and remove leftover refs

**Files:**
- Modify: `src/components/Step1PersonalInfo.tsx` — end of the JSX return + ref declarations

**Step 1: Replace the sticky CTA block**

Replace the existing `{/* ── Sticky CTA ── */}` block with:

```tsx
{/* ── Sticky CTA — mobile only ── */}
<div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-5 py-3.5">
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
  <button
    className="w-full mt-2 py-1.5 text-sm text-gray-500 underline underline-offset-2"
    onClick={onBack}
  >
    前のステップに戻る
  </button>
</div>
```

**Step 2: Update ref declarations to match simplified field set**

Replace `addressRef` with `addrRef` and remove `postalError` state (now in `errors.postal`). Rename `prefectureRef` → `prefRef`:

```tsx
// Keep these:
const nameRef    = useRef<HTMLDivElement>(null);
const kanaRef    = useRef<HTMLDivElement>(null);
const dobRef     = useRef<HTMLDivElement>(null);
const postalRef  = useRef<HTMLDivElement>(null);
const prefRef    = useRef<HTMLDivElement>(null);
const addrRef    = useRef<HTMLDivElement>(null);
const emailRef   = useRef<HTMLDivElement>(null);
// Remove: addressRef, prefectureRef, postalError state
```

**Step 3: Remove now-unused helpers**

Delete: `computeAge`, `formatPostal`, `pad` — none are used in the new design.
Keep: `validateEmail`, `daysInMonth`.

**Step 4: Final type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

### Task 6: Visual verification with Playwright

**Files:** None changed — just verification.

**Step 1: Start dev server (if not running)**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo && npm run dev &
sleep 3
```

**Step 2: Take top-of-page screenshot**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:5173');
  await p.click('input[type=checkbox]');
  await p.click('button');
  await p.screenshot({ path: '/tmp/step1-top.png' });
  await b.close();
})();
"
```

**Step 3: Take bottom-of-page screenshot**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:5173');
  await p.click('input[type=checkbox]');
  await p.click('button');
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.screenshot({ path: '/tmp/step1-bottom.png' });
  await b.close();
})();
"
```

**Step 4: Check**

Review both screenshots. Verify:
- [ ] Warm `bg-page` outside the white card
- [ ] White card, rounded corners, subtle shadow
- [ ] Tall gray-fill inputs with placeholder text
- [ ] Red "必須" badges next to field labels
- [ ] Green first progress pill; gray remaining pills
- [ ] Logo visible in sticky header
- [ ] Green sticky CTA bar at bottom (mobile)
- [ ] DoB: 3 selects with custom chevrons
- [ ] Invoice CheckCard with green border when checked

---

### Task 7: Desktop verification

**Step 1: Desktop screenshot**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.goto('http://localhost:5173');
  await p.click('input[type=checkbox]');
  await p.click('button');
  await p.screenshot({ path: '/tmp/step1-desktop.png', fullPage: true });
  await b.close();
})();
"
```

**Step 2: Check**

Verify:
- [ ] Card is centered with generous white space on both sides
- [ ] In-card 次へ / 戻る buttons visible (not the sticky bar)
- [ ] 次へ button uses green `button-background` arrow icon style

---
