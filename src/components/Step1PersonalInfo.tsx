import { useState, useRef } from "react";
import type { PersonalInfoForm } from "../types";
import takakuLogo from "../assets/takaku_logo.svg";

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県',
  '埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県',
  '佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
];

const OCCUPATIONS = ['会社員','自営業','公務員','主婦','学生','フリーター','自由業','その他'];

function validateEmail(v: string): boolean {
  if (!v || v.length > 254) return false;
  const at = v.indexOf('@');
  if (at === -1 || at !== v.lastIndexOf('@')) return false;
  const local = v.slice(0, at), domain = v.slice(at + 1);
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[a-zA-Z0-9._%+\-]+$/.test(local)) return false;
  if (!domain || !domain.includes('.') || domain.startsWith('-') || domain.includes('..')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function daysInMonth(year: string, month: string): number {
  if (!year || !month) return 31;
  return new Date(parseInt(year), parseInt(month), 0).getDate();
}

function pad(n: number): string { return String(n).padStart(2, '0'); }

// ── Design tokens ─────────────────────────────────────────────
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

function OptBadge() {
  return (
    <span className="inline-flex items-center text-[11px] font-normal px-2 py-[3px] rounded-[5px] bg-[#F59E0B] text-white leading-none">
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
    <div className="mb-5" ref={fieldRef}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base font-normal text-[#1F2329]">{label}</span>
        {badge === 'required' && <ReqBadge />}
        {badge === 'optional' && <OptBadge />}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-xs text-[#F36B6B] font-medium">{error}</p>
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
        'flex items-start gap-3 px-4 py-3.5 rounded-[8px] cursor-pointer select-none mb-4',
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
        <p className={`text-base font-normal ${checked ? 'text-accent-primary' : 'text-[#1F2329]'}`}>
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5 text-xs text-[#6B7280]">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface Props {
  initialData: PersonalInfoForm;
  onProceed: (data: PersonalInfoForm) => void;
  onBack: () => void;
}

export function Step1PersonalInfo({ initialData, onProceed, onBack }: Props) {
  // ── Form state ──
  const [name, setName] = useState(initialData.name);
  const [kana, setKana] = useState(initialData.kana);
  const [dobYear, setDobYear] = useState(initialData.dobYear);
  const [dobMonth, setDobMonth] = useState(initialData.dobMonth);
  const [dobDay, setDobDay] = useState(initialData.dobDay);
  const [postal, setPostal] = useState(initialData.postalCode);
  const [postalLoading, setPostalLoading] = useState(false);
  const postalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComposing = useRef(false);
  const [prefecture, setPrefecture] = useState(initialData.prefecture);
  const [address, setAddress] = useState(initialData.address);
  const [occupation, setOccupation] = useState(initialData.occupation);
  const [email, setEmail] = useState(initialData.email);
  const [invoiceNotIssuer, setInvoiceNotIssuer] = useState(initialData.invoiceNotIssuer);
  const [invoiceNumber, setInvoiceNumber] = useState(initialData.invoiceNumber);

  // ── Validation errors ──
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Scroll-to-error refs ──
  const nameRef   = useRef<HTMLDivElement>(null);
  const kanaRef   = useRef<HTMLDivElement>(null);
  const dobRef    = useRef<HTMLDivElement>(null);
  const postalRef = useRef<HTMLDivElement>(null);
  const prefRef   = useRef<HTMLDivElement>(null);
  const addrRef   = useRef<HTMLDivElement>(null);
  const emailRef  = useRef<HTMLDivElement>(null);

  // ── Derived ──
  const emailOk = validateEmail(email);
  const dobFilled = dobYear !== '' && dobMonth !== '' && dobDay !== '';
  const isAllValid =
    name !== '' && kana !== '' && dobFilled &&
    postal.length === 7 && prefecture !== '' && address !== '' && emailOk;

  const yearOptions  = Array.from({ length: 116 }, (_, i) => String(2025 - i));
  const monthOptions = Array.from({ length: 12 }, (_, i) => pad(i + 1));
  const dayOptions   = Array.from({ length: daysInMonth(dobYear, dobMonth) }, (_, i) => pad(i + 1));

  function setError(id: string, msg: string) {
    setErrors(prev => ({ ...prev, [id]: msg }));
  }

  function clearError(id: string) {
    setErrors(prev => ({ ...prev, [id]: '' }));
  }

  // ── Postal code ──
  function normalizePostal(v: string): string {
    return v
      .split('')
      .map(ch => {
        const code = ch.charCodeAt(0);
        return code >= 0xFF10 && code <= 0xFF19 ? String.fromCharCode(code - 0xFEE0) : ch;
      })
      .join('')
      .replace(/\D/g, '')
      .slice(0, 7);
  }

  function handlePostalChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isComposing.current) {
      setPostal(e.target.value);
      return;
    }
    const v = normalizePostal(e.target.value);
    setPostal(v);
    if (errors.postal) clearError('postal');
    if (postalTimerRef.current !== null) {
      clearTimeout(postalTimerRef.current);
      postalTimerRef.current = null;
      setPostalLoading(false);
    }
  }

  function handlePostalCompositionEnd(e: React.CompositionEvent<HTMLInputElement>) {
    isComposing.current = false;
    const v = normalizePostal(e.currentTarget.value);
    setPostal(v);
    if (errors.postal) clearError('postal');
    if (postalTimerRef.current !== null) {
      clearTimeout(postalTimerRef.current);
      postalTimerRef.current = null;
      setPostalLoading(false);
    }
  }

  function handlePostalBlur() {
    if (postal.length === 0) return;
    if (postal.length !== 7) {
      setError('postal', '有効な7桁の郵便番号を入力してください。');
      return;
    }
    if (postalTimerRef.current !== null) {
      clearTimeout(postalTimerRef.current);
    }
    setPostalLoading(true);
    setPrefecture('');
    setAddress('');
    postalTimerRef.current = setTimeout(() => {
      postalTimerRef.current = null;
      setPrefecture('東京都');
      setAddress('千代田区有楽町');
      clearError('prefecture');
      clearError('address');
      setPostalLoading(false);
    }, 900);
  }

  // ── DoB helpers ──
  function handleYearChange(y: string) {
    setDobYear(y);
    if (dobDay && parseInt(dobDay) > daysInMonth(y, dobMonth)) setDobDay('');
  }

  function handleMonthChange(m: string) {
    setDobMonth(m);
    if (dobDay && parseInt(dobDay) > daysInMonth(dobYear, m)) setDobDay('');
  }

  // ── Next ──
  function handleNext() {
    const errs: Record<string, string> = {};
    if (!name)               errs.name       = 'この項目は必須です。';
    if (!kana)               errs.kana       = 'この項目は必須です。';
    if (!dobFilled)          errs.dob        = '生年月日を選択してください。';
    if (postal.length !== 7) errs.postal     = '有効な7桁の郵便番号を入力してください。';
    if (!prefecture)         errs.prefecture = 'この項目は必須です。';
    if (!address)            errs.address    = 'この項目は必須です。';
    if (!emailOk)            errs.email      = '有効なメールアドレスを入力してください。';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = errs.name       ? nameRef
                  : errs.kana       ? kanaRef
                  : errs.dob        ? dobRef
                  : errs.postal     ? postalRef
                  : errs.prefecture ? prefRef
                  : errs.address    ? addrRef
                  : emailRef;
      first.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onProceed({ name, kana, dobYear, dobMonth, dobDay, postalCode: postal, prefecture, address, occupation, email, invoiceNotIssuer, invoiceNumber });
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-page"
      style={{ fontFamily: 'var(--font-base)' }}
    >
      {/* ── Sticky progress header ── */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] pt-3 pb-3">
        <div className="flex items-center justify-between" style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto' }}>
          <img src={takakuLogo} alt="高く売れるドットコム" className="h-[64px]" />
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1.5">4ステップ中 1</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-12 h-2 rounded-full transition-colors ${i === 0 ? 'bg-accent-primary' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <main className="flex-1 flex justify-center py-5 pb-24 sm:pb-5">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
          style={{ width: 'clamp(320px, calc(100% - 2rem), 560px)', margin: '0 auto', boxSizing: 'border-box' }}
        >

          {/* Section heading */}
          <h1 className="flex items-center gap-2 text-xl font-bold text-[#1F2329] mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
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
                onCompositionStart={() => { isComposing.current = true; }}
                onCompositionEnd={handlePostalCompositionEnd}
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

          {/* CTA buttons — desktop only */}
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
    </div>
  );
}
