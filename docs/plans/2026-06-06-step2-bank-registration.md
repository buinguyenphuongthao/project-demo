# Step 2 Bank Registration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Step 2 (お振込み口座情報) to the tos-gate-demo React app, wired between Step 1 and a placeholder completion alert, with full form-state preservation across back-navigation.

**Architecture:** Mirror `Step1PersonalInfo.tsx` exactly — one self-contained component file with local state, sticky progress header, white card body, sticky mobile CTA bar. The bank/branch section renders a toggle (name-search mode ↔ code-entry mode); each mode has its own search inputs with inline dropdowns and resolved-chip display. Shared type definitions live in `types.ts`. `App.tsx` owns navigation state and passes `initialData` down so values survive back/forward navigation. The account holder field is pre-filled from Step 1's kana on first visit and preserved thereafter.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite 8, Noto Sans JP (already loaded). No test runner — verification is TypeScript type-check (`tsc --noEmit`) plus browser smoke-test.

---

## Design tokens (carry forward from Step 1)

| Token | Value |
|---|---|
| Page bg | `bg-page` (`#f9f5ee`) |
| Card bg | `bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]` |
| Input | `h-[52px] px-4 bg-white border border-gray-300 rounded-lg` + focus blue ring |
| Required badge | `bg-[#F36B6B] text-white` red pill, 11 px |
| Progress pill active | `bg-accent-primary` (green `#388e31`) |
| Progress pill inactive | `bg-gray-300` |
| Next button | `bg-accent-primary button-background` (same as Step 1) |

---

## Task 1 — Extend `types.ts` with bank-related interfaces

**Files:**
- Modify: `src/types.ts`

**Step 1: Add the three interfaces**

Append to the bottom of `src/types.ts`:

```ts
export interface BankEntry {
  code: string;
  name: string;
  kana: string;
}

export interface BranchEntry {
  code: string;
  name: string;
  kana: string;
}

export interface BankInfoForm {
  holder: string;
  bank: BankEntry | null;
  branch: BranchEntry | null;
  accountNumber: string;
  appraisalNotify: 'required' | 'not-needed';
}
```

**Step 2: Type-check**

```bash
cd /Users/phuongthao/Downloads/tos-gate-demo
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add BankEntry, BranchEntry, BankInfoForm types"
```

---

## Task 2 — Create `Step2BankRegistration.tsx`

**Files:**
- Create: `src/components/Step2BankRegistration.tsx`

**Step 1: Create the file with mock data, shared atoms, and sub-components**

Create `src/components/Step2BankRegistration.tsx` with the following complete content:

```tsx
import { useState, useRef } from "react";
import type { BankInfoForm, BankEntry, BranchEntry } from "../types";
import takakuLogo from "../assets/takaku_logo.svg";

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BANKS: BankEntry[] = [
  { code: '0001', name: 'みずほ銀行',   kana: 'みずほ' },
  { code: '0005', name: '三菱UFJ銀行',  kana: 'みつびし' },
  { code: '0009', name: '三井住友銀行', kana: 'みつい' },
  { code: '0010', name: 'りそな銀行',   kana: 'りそな' },
  { code: '0033', name: 'PayPay銀行',   kana: 'ぺいぺい' },
  { code: '0036', name: '楽天銀行',     kana: 'らくてん' },
  { code: '0116', name: '北海道銀行',   kana: 'ほっかいどう' },
  { code: '0119', name: '秋田銀行',     kana: 'あきた' },
  { code: '0150', name: '京都銀行',     kana: 'きょうと' },
  { code: '9900', name: 'ゆうちょ銀行', kana: 'ゆうちょ' },
];

const MOCK_BRANCHES: Record<string, BranchEntry[]> = {
  '0001': [
    { code: '001', name: '東京営業部',   kana: 'とうきょう' },
    { code: '004', name: '丸の内支店',   kana: 'まるのうち' },
    { code: '015', name: '新宿支店',     kana: 'しんじゅく' },
  ],
  '0005': [
    { code: '001', name: '本店',         kana: 'ほんてん' },
    { code: '048', name: '渋谷支店',     kana: 'しぶや' },
    { code: '110', name: '池袋支店',     kana: 'いけぶくろ' },
  ],
  '0009': [
    { code: '001', name: '本店営業部',   kana: 'ほんてん' },
    { code: '259', name: '横浜支店',     kana: 'よこはま' },
  ],
  '0119': [
    { code: '001', name: '本店',             kana: 'ほんてん' },
    { code: '002', name: '秋田駅前支店',     kana: 'あきたえきまえ' },
    { code: '010', name: '大曲支店',         kana: 'おおまがり' },
  ],
  '_default': [
    { code: '001', name: '本店',     kana: 'ほんてん' },
    { code: '002', name: '駅前支店', kana: 'えきまえ' },
  ],
};

function getBranches(bankCode: string): BranchEntry[] {
  return MOCK_BRANCHES[bankCode] ?? MOCK_BRANCHES['_default'];
}

// ── Shared atoms ─────────────────────────────────────────────────────────────

const INPUT = [
  'block w-full h-[52px] px-4 text-base text-[#1F2329]',
  'bg-white border border-gray-300 rounded-lg',
  'outline-none appearance-none transition-all duration-150',
  'placeholder:text-[#A8AEB8]',
  'hover:border-gray-400',
  'focus:border-[#4A90D9] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.18)]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

function ReqBadge() {
  return (
    <span className="inline-flex items-center text-[11px] font-normal px-2 py-[3px] rounded-[5px] bg-[#F36B6B] text-white leading-none">
      必須
    </span>
  );
}

function Field({
  label, badge, error, children,
}: {
  label: string;
  badge?: 'required';
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base font-normal text-[#1F2329]">{label}</span>
        {badge === 'required' && <ReqBadge />}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-[#F36B6B] font-medium">{error}</p>}
    </div>
  );
}

// ── ResolvedChip — shown once bank or branch is confirmed ─────────────────────

function ResolvedChip({ name, code, onClear }: { name: string; code: string; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between h-[52px] px-4 bg-white border border-gray-300 rounded-lg text-[#1F2329]">
      <span className="text-base">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-mono">{code}</span>
        <button
          type="button"
          onClick={onClear}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors"
          aria-label="クリア"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── Dropdown — search results list ────────────────────────────────────────────
// onMouseDown fires before the input's onBlur, so the selection registers
// before the 150 ms blur-close timer fires.

type PickItem = { code: string; name: string; kana: string };

function Dropdown({ items, onSelect }: {
  items: PickItem[];
  onSelect: (item: PickItem) => void;
}) {
  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg max-h-44 overflow-y-auto z-30 shadow-md">
      {items.map(item => (
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

// ── Main component ────────────────────────────────────────────────────────────

type SearchMode = 'name' | 'code';

interface Props {
  initialData: BankInfoForm;
  onProceed: (data: BankInfoForm) => void;
  onBack: () => void;
}

export function Step2BankRegistration({ initialData, onProceed, onBack }: Props) {

  // ── Form state ──
  const [holder, setHolder]                   = useState(initialData.holder);
  const [searchMode, setSearchMode]           = useState<SearchMode>('name');
  const [selectedBank, setSelectedBank]       = useState<BankEntry | null>(initialData.bank);
  const [selectedBranch, setSelectedBranch]   = useState<BranchEntry | null>(initialData.branch);

  // Name-mode search state
  const [bankNameQ,     setBankNameQ]     = useState('');
  const [branchNameQ,   setBranchNameQ]   = useState('');
  const [bankNameOpen,  setBankNameOpen]  = useState(false);
  const [branchNameOpen,setBranchNameOpen]= useState(false);

  // Code-mode search state
  const [bankCodeQ,     setBankCodeQ]     = useState('');
  const [branchCodeQ,   setBranchCodeQ]   = useState('');
  const [bankCodeOpen,  setBankCodeOpen]  = useState(false);
  const [branchCodeOpen,setBranchCodeOpen]= useState(false);

  const [accountNumber,   setAccountNumber]   = useState(initialData.accountNumber);
  const [appraisalNotify, setAppraisalNotify] = useState<'required' | 'not-needed'>(initialData.appraisalNotify);
  const [errors, setErrors]                   = useState<Record<string, string>>({});

  // Scroll-to-first-error refs
  const holderRef  = useRef<HTMLDivElement>(null);
  const bankRef    = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // ── Derived ──
  const isAllValid =
    holder !== '' && selectedBank !== null && selectedBranch !== null && accountNumber.length === 7;

  // ── Mode switch — clears bank/branch selections and all search queries ──
  function switchMode(mode: SearchMode) {
    if (mode === searchMode) return;
    setSearchMode(mode);
    setSelectedBank(null);
    setSelectedBranch(null);
    setBankNameQ('');    setBranchNameQ('');
    setBankCodeQ('');    setBranchCodeQ('');
    setBankNameOpen(false);  setBranchNameOpen(false);
    setBankCodeOpen(false);  setBranchCodeOpen(false);
    setErrors(e => ({ ...e, bank: '', branch: '' }));
  }

  // ── Name-mode handlers ────────────────────────────────────────────────────

  function onBankNameChange(q: string) {
    setBankNameQ(q);
    setSelectedBank(null);
    setSelectedBranch(null);
    setBranchNameQ('');
    setBankNameOpen(q.length > 0);
  }
  function selectBankByName(bank: PickItem) {
    setSelectedBank(bank as BankEntry);
    setSelectedBranch(null);
    setBankNameOpen(false);
    setBranchNameQ('');
    setErrors(e => ({ ...e, bank: '' }));
  }
  function clearBankByName() {
    setSelectedBank(null);
    setSelectedBranch(null);
    setBankNameQ('');
    setBranchNameQ('');
  }

  function onBranchNameChange(q: string) {
    setBranchNameQ(q);
    setSelectedBranch(null);
    setBranchNameOpen(q.length > 0 && selectedBank !== null);
  }
  function selectBranchByName(branch: PickItem) {
    setSelectedBranch(branch as BranchEntry);
    setBranchNameOpen(false);
    setErrors(e => ({ ...e, branch: '' }));
  }
  function clearBranchByName() {
    setSelectedBranch(null);
    setBranchNameQ('');
  }

  // ── Code-mode handlers ────────────────────────────────────────────────────

  function onBankCodeChange(raw: string) {
    const v = raw.replace(/\D/g, '').slice(0, 4);
    setBankCodeQ(v);
    setSelectedBank(null);
    setSelectedBranch(null);
    setBranchCodeQ('');
    setBankCodeOpen(v.length > 0);
  }
  function selectBankByCode(bank: PickItem) {
    setSelectedBank(bank as BankEntry);
    setSelectedBranch(null);
    setBankCodeOpen(false);
    setBranchCodeQ('');
    setErrors(e => ({ ...e, bank: '' }));
  }
  function clearBankByCode() {
    setSelectedBank(null);
    setSelectedBranch(null);
    setBankCodeQ('');
    setBranchCodeQ('');
  }

  function onBranchCodeChange(raw: string) {
    const v = raw.replace(/\D/g, '').slice(0, 3);
    setBranchCodeQ(v);
    setSelectedBranch(null);
    setBranchCodeOpen(v.length > 0 && selectedBank !== null);
  }
  function selectBranchByCode(branch: PickItem) {
    setSelectedBranch(branch as BranchEntry);
    setBranchCodeOpen(false);
    setErrors(e => ({ ...e, branch: '' }));
  }
  function clearBranchByCode() {
    setSelectedBranch(null);
    setBranchCodeQ('');
  }

  // ── Account number ────────────────────────────────────────────────────────

  function onAccountChange(raw: string) {
    const v = raw.replace(/\D/g, '').slice(0, 7);
    setAccountNumber(v);
    if (errors.accountNumber) setErrors(e => ({ ...e, accountNumber: '' }));
  }

  // ── Validation and submit ─────────────────────────────────────────────────

  function handleNext() {
    const errs: Record<string, string> = {};
    if (!holder)                           errs.holder        = 'この項目は必須です。';
    if (!selectedBank)                     errs.bank          = '銀行を選択してください。';
    if (selectedBank && !selectedBranch)   errs.branch        = '支店を選択してください。';
    if (accountNumber.length !== 7)        errs.accountNumber = '7桁の口座番号を入力してください。';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = errs.holder ? holderRef : errs.bank || errs.branch ? bankRef : accountRef;
      first.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onProceed({
      holder,
      bank: selectedBank!,
      branch: selectedBranch!,
      accountNumber,
      appraisalNotify,
    });
  }

  // ── Filtered results (derived, not state) ─────────────────────────────────

  const bankNameResults  = bankNameQ
    ? MOCK_BANKS.filter(b => b.name.includes(bankNameQ) || b.kana.includes(bankNameQ.toLowerCase()))
    : [];
  const branchNameResults = (selectedBank && branchNameQ)
    ? getBranches(selectedBank.code).filter(b => b.name.includes(branchNameQ) || b.kana.includes(branchNameQ.toLowerCase()))
    : [];
  const bankCodeResults  = bankCodeQ
    ? MOCK_BANKS.filter(b => b.code.startsWith(bankCodeQ))
    : [];
  const branchCodeResults = (selectedBank && branchCodeQ)
    ? getBranches(selectedBank.code).filter(b => b.code.startsWith(branchCodeQ))
    : [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-page" style={{ fontFamily: 'var(--font-base)' }}>

      {/* Sticky progress header */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-5 pt-3 pb-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <img src={takakuLogo} alt="高く売れるドットコム" className="h-[64px]" />
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1.5">4ステップ中 2</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-12 h-2 rounded-full transition-colors ${i <= 1 ? 'bg-accent-primary' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 flex justify-center px-4 py-5 pb-24 sm:pb-5">
        <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8">

          {/* Section heading */}
          <h1 className="flex items-center gap-2 text-xl font-bold text-[#1F2329] mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent-primary)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="8" width="18" height="12" rx="2"/>
              <path d="M7 8V6a5 5 0 0 1 10 0v2"/>
              <line x1="12" y1="13" x2="12" y2="15"/>
            </svg>
            お振込み口座情報
          </h1>

          {/* ── 口座名義人 ── */}
          <div ref={holderRef}>
            <Field label="口座名義人" badge="required" error={errors.holder}>
              <input
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
              <p className="mt-1 text-xs text-gray-500">
                通帳・キャッシュカードと同じカタカナ氏名をご入力ください。
              </p>
            </Field>
          </div>

          {/* ── 銀行・支店 ── */}
          <div ref={bankRef} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-normal text-[#1F2329]">銀行・支店</span>
              <ReqBadge />
            </div>

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
                <span className={searchMode === 'name' ? 'text-white' : 'text-[#4A7BF7]'}
                  style={{ fontSize: '16px', fontWeight: 400 }}>
                  あ
                </span>
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
                <span className="font-mono text-sm">123</span>
                銀行コード
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              {searchMode === 'name'
                ? '銀行名またはかなで検索してください。'
                : '通帳またはキャッシュカードに記載されているコードを入力してください。'}
            </p>

            {/* Name mode */}
            {searchMode === 'name' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">銀行名</p>
                  {selectedBank ? (
                    <ResolvedChip name={selectedBank.name} code={selectedBank.code} onClear={clearBankByName} />
                  ) : (
                    <div className="relative">
                      <input
                        className={INPUT}
                        type="text"
                        placeholder="例：秋田銀行"
                        value={bankNameQ}
                        onChange={e => onBankNameChange(e.target.value)}
                        onBlur={() => setTimeout(() => setBankNameOpen(false), 150)}
                      />
                      {bankNameOpen && bankNameResults.length > 0 && (
                        <Dropdown items={bankNameResults} onSelect={selectBankByName} />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">支店名</p>
                  {selectedBranch ? (
                    <ResolvedChip name={selectedBranch.name} code={selectedBranch.code} onClear={clearBranchByName} />
                  ) : (
                    <div className="relative">
                      <input
                        className={INPUT}
                        type="text"
                        placeholder={selectedBank ? '例：本店' : '先に銀行を選択してください'}
                        value={branchNameQ}
                        disabled={!selectedBank}
                        onChange={e => onBranchNameChange(e.target.value)}
                        onBlur={() => setTimeout(() => setBranchNameOpen(false), 150)}
                      />
                      {branchNameOpen && branchNameResults.length > 0 && (
                        <Dropdown items={branchNameResults} onSelect={selectBranchByName} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Code mode */}
            {searchMode === 'code' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">銀行コード</p>
                  {selectedBank ? (
                    <ResolvedChip name={selectedBank.name} code={selectedBank.code} onClear={clearBankByCode} />
                  ) : (
                    <div className="relative">
                      <input
                        className={INPUT}
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="例：0119"
                        value={bankCodeQ}
                        onChange={e => onBankCodeChange(e.target.value)}
                        onBlur={() => setTimeout(() => setBankCodeOpen(false), 150)}
                      />
                      {bankCodeOpen && bankCodeResults.length > 0 && (
                        <Dropdown items={bankCodeResults} onSelect={selectBankByCode} />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">支店コード</p>
                  {selectedBranch ? (
                    <ResolvedChip name={selectedBranch.name} code={selectedBranch.code} onClear={clearBranchByCode} />
                  ) : (
                    <div className="relative">
                      <input
                        className={INPUT}
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder={selectedBank ? '例：001' : '先に銀行を選択してください'}
                        value={branchCodeQ}
                        disabled={!selectedBank}
                        onChange={e => onBranchCodeChange(e.target.value)}
                        onBlur={() => setTimeout(() => setBranchCodeOpen(false), 150)}
                      />
                      {branchCodeOpen && branchCodeResults.length > 0 && (
                        <Dropdown items={branchCodeResults} onSelect={selectBranchByCode} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {errors.bank   && <p className="mt-2 text-xs text-[#F36B6B] font-medium">{errors.bank}</p>}
            {errors.branch && <p className="mt-1 text-xs text-[#F36B6B] font-medium">{errors.branch}</p>}
          </div>

          {/* ── 口座番号 ── */}
          <div ref={accountRef}>
            <Field label="口座番号" badge="required" error={errors.accountNumber}>
              <input
                className={INPUT}
                type="text"
                inputMode="numeric"
                maxLength={7}
                placeholder="例：1234567"
                value={accountNumber}
                onChange={e => onAccountChange(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">※ 普通預金口座のみ対応</p>
            </Field>
          </div>

          {/* ── 査定連絡設定 ── */}
          <div className="border-t border-gray-200 pt-5 mb-5">
            <h2 className="text-base font-bold text-[#1F2329] mb-3">査定連絡設定</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-normal text-[#1F2329]">最終査定連絡</span>
              <ReqBadge />
            </div>
            <div className="flex gap-3">
              {(['required', 'not-needed'] as const).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAppraisalNotify(val)}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-semibold transition-colors',
                    appraisalNotify === val
                      ? 'border-accent-primary bg-[#f0faf0] text-[#1F2329]'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span className={[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    appraisalNotify === val ? 'border-accent-primary' : 'border-gray-300',
                  ].join(' ')}>
                    {appraisalNotify === val && (
                      <span className="w-2 h-2 rounded-full bg-accent-primary" />
                    )}
                  </span>
                  {val === 'required' ? '必要' : '不要'}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              ※ 不要を選択した場合、最終査定後に通知なく直接お支払いとなります。
            </p>
          </div>

          {/* CTA — desktop */}
          <div className="hidden sm:flex flex-col items-center gap-3 mt-6">
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

      {/* Sticky CTA — mobile */}
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
    </div>
  );
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. If you see errors about `border-accent-primary` or `bg-accent-primary` — those are Tailwind CSS v4 custom tokens defined in `src/index.css` and are not TypeScript errors; only fix TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/Step2BankRegistration.tsx
git commit -m "feat: add Step2BankRegistration component"
```

---

## Task 3 — Wire Step 2 into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Step 1: Replace the full contents of `src/App.tsx`**

```tsx
import { useState } from "react";
import { ConsentGate } from "./components/ConsentGate";
import { Step1PersonalInfo } from "./components/Step1PersonalInfo";
import { Step2BankRegistration } from "./components/Step2BankRegistration";
import type { PersonalInfoForm, BankInfoForm } from "./types";

type AppStep = "consent" | "step1" | "step2";

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
  const [step, setStep]               = useState<AppStep>("consent");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>(emptyPersonalInfo);
  const [bankInfo, setBankInfo]         = useState<BankInfoForm>(emptyBankInfo);

  if (step === "consent") {
    return <ConsentGate onProceed={() => setStep("step1")} />;
  }

  if (step === "step1") {
    return (
      <Step1PersonalInfo
        initialData={personalInfo}
        onProceed={(data) => {
          setPersonalInfo(data);
          // Pre-fill holder from kana on first visit; preserve whatever was entered on return visits
          setBankInfo(prev => ({ ...prev, holder: prev.holder || data.kana }));
          setStep("step2");
        }}
        onBack={() => setStep("consent")}
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

**Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Start dev server and smoke-test**

```bash
npm run dev
```

Open `http://localhost:5173` and verify:

| Scenario | Expected |
|---|---|
| Consent → Step 1 → fill all fields → Next | Lands on Step 2 with progress showing 2/4 |
| Step 2: account holder pre-filled | Shows kana from Step 1 |
| Step 2: Back | Returns to Step 1 with all Step 1 fields intact |
| Step 1 → Next again | Step 2 shows previously entered holder value (not blanked) |
| Step 2: Next with empty fields | Errors shown, scroll to first error |
| Step 2 name mode: type "みず" | みずほ銀行 appears in dropdown |
| Select みずほ銀行 | Resolved chip appears; branch field unlocks |
| Type branch query | Branch dropdown shows filtered results |
| Select branch | Branch resolved chip appears; Next button activates when acct# = 7 digits |
| Step 2 code mode toggle | Clears bank/branch, switches helper text |
| Type "011" in bank code | 秋田銀行 (0119) appears |
| Select → type "00" in branch code | Branch list filtered by prefix |
| Complete all fields → Next | Alert shows bank name, branch name, account number |

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire Step2BankRegistration into app flow"
```

---

## Done

All three tasks complete. The combined demo HTML (`/Desktop/consent-form-ja/consent-form-complete-flow-ja.html`) already references `step2-bank-registration-ja.html` at nav index 4 — no changes needed there.
