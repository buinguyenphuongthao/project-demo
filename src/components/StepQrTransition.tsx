import { useState, useEffect } from "react";
import takakuLogo from "../assets/takaku_logo.svg";

interface Props {
  onProceed: () => void;
  onBack: () => void;
}

// Build a 21×21 boolean flat array representing a QR v1-like placeholder.
// Proper 7×7 finder patterns at TL/TR/BL + timing strips + LCG data fill.
function buildQrGrid(): boolean[] {
  const SIZE = 21;
  const cells = new Array<boolean>(SIZE * SIZE).fill(false);
  const at = (r: number, c: number) => r * SIZE + c;

  function finder(sr: number, sc: number) {
    for (let r = sr; r < sr + 7; r++) {
      for (let c = sc; c < sc + 7; c++) {
        const lr = r - sr, lc = c - sc;
        const outer = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const inner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        cells[at(r, c)] = outer || inner;
      }
    }
  }

  finder(0, 0);   // top-left
  finder(0, 14);  // top-right
  finder(14, 0);  // bottom-left

  // Timing strips between finders (row 6 and col 6, cols/rows 8–12)
  for (let i = 8; i <= 12; i++) {
    cells[at(6, i)] = i % 2 === 0;
    cells[at(i, 6)] = i % 2 === 0;
  }

  let seed = 42;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed > 0x7fffffff;
  };

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const inTL = r <= 7 && c <= 7;
      const inTR = r <= 7 && c >= 13;
      const inBL = r >= 13 && c <= 7;
      const onTiming = (r === 6 && c >= 8 && c <= 12) || (c === 6 && r >= 8 && r <= 12);
      if (inTL || inTR || inBL || onTiming) { rand(); continue; }
      cells[at(r, c)] = rand();
    }
  }

  return cells;
}

const QR_GRID = buildQrGrid();

const nextBtn = (fullWidth: boolean, onProceed: () => void) => (
  <button
    type="button"
    onClick={onProceed}
    className={[
      "button-background rounded-[10px] py-4",
      "text-[17px] font-bold tracking-wide text-white",
      "bg-accent-primary transition-[colors,box-shadow,transform] duration-200",
      "cursor-pointer",
      fullWidth ? "w-full" : "w-full max-w-[480px]",
    ].join(" ")}
  >
    次へ
  </button>
);

const backBtn = (onBack: () => void, extraClass = "") => (
  <button
    type="button"
    onClick={onBack}
    className={`text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors ${extraClass}`}
  >
    前のステップに戻る
  </button>
);

export function StepQrTransition({ onProceed, onBack }: Props) {
  const [timerSecs, setTimerSecs] = useState(600);
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const startTimeout = setTimeout(() => {
      setTimerStarted(true);
      interval = setInterval(() => {
        setTimerSecs(s => {
          if (s <= 1) { clearInterval(interval); return 0; }
          return s - 1;
        });
      }, 1000);
    }, 5000);
    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, []);

  const timerText = !timerStarted
    ? 'このQRコードは10分間有効です'
    : timerSecs === 0
      ? 'QRコードの有効期限が切れました'
      : `このQRコードは ${Math.floor(timerSecs / 60)}:${String(timerSecs % 60).padStart(2, '0')} 後に期限切れになります`;
  const timerExpired = timerStarted && timerSecs === 0;

  return (
    <div className="min-h-screen flex flex-col bg-page" style={{ fontFamily: "var(--font-base)" }}>

      {/* Sticky progress header — same as Step 3 */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] pt-3 pb-3">
        <div className="flex items-center justify-between"
          style={{ width: "clamp(320px, calc(100% - 2rem), 560px)", margin: "0 auto" }}>
          <img src={takakuLogo} alt="高く売れるドットコム" className="h-[64px]" />
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1.5">4ステップ中 3</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-12 h-2 rounded-full transition-colors ${i <= 2 ? "bg-accent-primary" : "bg-gray-300"}`}
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
          style={{ width: "clamp(320px, calc(100% - 2rem), 560px)", margin: "0 auto", boxSizing: "border-box", animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
        >

          {/* Section heading — matches Step 3 exactly */}
          <h1 className="flex items-center gap-2 text-xl font-bold text-[#1F2329] mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent-primary)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            本人確認方法
          </h1>
          <div className="h-px bg-gray-200 mb-5" />

          {/* QR sub-heading + subtitle */}
          <h2 className="text-base font-bold text-[#1F2329] text-center mb-1">
            スマートフォンで本人確認を行ってください
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed text-center mb-4">
            この手順はスマートフォンで完了する必要があります。
          </p>

          {/* Instruction steps */}
          <div role="list" aria-label="手順" style={{ marginBottom: 22 }}>
            {/* Step 1: camera */}
            <div role="listitem" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 12, paddingTop: 2, animation: 'fadeInStep 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '0.08s' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef6ee', border: '1px solid #c2ddc2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1e5a1e' }} aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </div>
              <div style={{ flex: 1, paddingTop: 7 }}>
                <p style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500, lineHeight: 1.4 }}>スマートフォンのカメラを起動する</p>
              </div>
            </div>

            {/* Step 2: scan */}
            <div role="listitem" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingTop: 12, paddingBottom: 12, borderTop: '1px solid #e2dbd0', animation: 'fadeInStep 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '0.16s' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef6ee', border: '1px solid #c2ddc2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1e5a1e' }} aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <path d="M7 12h10"/>
                </svg>
              </div>
              <div style={{ flex: 1, paddingTop: 7 }}>
                <p style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500, lineHeight: 1.4 }}>下記のQRコードを読み取る</p>
              </div>
            </div>

            {/* Step 3: smartphone */}
            <div role="listitem" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingTop: 12, paddingBottom: 2, borderTop: '1px solid #e2dbd0', animation: 'fadeInStep 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '0.24s' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef6ee', border: '1px solid #c2ddc2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1e5a1e' }} aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                  <path d="M12 18h.01"/>
                </svg>
              </div>
              <div style={{ flex: 1, paddingTop: 7 }}>
                <p style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500, lineHeight: 1.4 }}>D-Confiaアプリが自動的に起動します</p>
                <p style={{ fontSize: 10.5, color: '#6b6b6b', marginTop: 3, lineHeight: 1.5 }}>アプリが未インストールの場合はストアへ誘導されます</p>
              </div>
            </div>
          </div>

          {/* QR code card */}
          <div style={{ position: 'relative', background: '#eef6ee', border: '1px solid #c2ddc2', borderRadius: 14, padding: '22px 18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1e5a1e', marginBottom: 14, letterSpacing: '0.02em' }}>このQRコードをスキャン</p>

            <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 2px 10px rgba(43,122,43,0.10)' }}>
              <div style={{ position: 'relative' }}>
                {/* Green corner brackets */}
                <svg aria-hidden="true" style={{ position: 'absolute', top: -5, left: -5, width: 20, height: 20 }} viewBox="0 0 20 20" fill="none" stroke="#2b7a2b" strokeWidth="3" strokeLinecap="round"><polyline points="0,18 0,0 18,0"/></svg>
                <svg aria-hidden="true" style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, transform: 'scaleX(-1)' }} viewBox="0 0 20 20" fill="none" stroke="#2b7a2b" strokeWidth="3" strokeLinecap="round"><polyline points="0,18 0,0 18,0"/></svg>
                <svg aria-hidden="true" style={{ position: 'absolute', bottom: -5, left: -5, width: 20, height: 20, transform: 'scaleY(-1)' }} viewBox="0 0 20 20" fill="none" stroke="#2b7a2b" strokeWidth="3" strokeLinecap="round"><polyline points="0,18 0,0 18,0"/></svg>
                <svg aria-hidden="true" style={{ position: 'absolute', bottom: -5, right: -5, width: 20, height: 20, transform: 'scale(-1)' }} viewBox="0 0 20 20" fill="none" stroke="#2b7a2b" strokeWidth="3" strokeLinecap="round"><polyline points="0,18 0,0 18,0"/></svg>

                <div
                  role="img"
                  aria-label="本人確認用QRコード"
                  style={{
                    width: 168,
                    height: 168,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(21, 1fr)',
                    gridTemplateRows: 'repeat(21, 1fr)',
                    padding: 6,
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                  }}
                >
                  {QR_GRID.map((dark, i) => (
                    <div key={i} style={{ backgroundColor: dark ? '#1a1a1a' : '#fff' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, fontSize: 10.5, color: timerExpired ? '#c0392b' : '#1e5a1e', opacity: timerExpired ? 1 : 0.85 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{timerText}</span>
            </div>
            {/* Visually-hidden expiry announcement only */}
            {timerExpired && (
              <span role="alert" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
                QRコードの有効期限が切れました
              </span>
            )}
          </div>

          {/* CTA — desktop */}
          <div className="hidden sm:flex flex-col items-center gap-3">
            {nextBtn(false, onProceed)}
            {backBtn(onBack)}
          </div>

        </div>
      </main>

      {/* Sticky CTA — mobile */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-5 py-3.5">
        {nextBtn(true, onProceed)}
        {backBtn(onBack, "w-full mt-2 py-1.5 block text-center")}
      </div>

    </div>
  );
}
