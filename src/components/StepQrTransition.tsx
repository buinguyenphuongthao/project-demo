import { HeaderLogo } from "./HeaderLogo";

interface Props {
  onProceed: () => void;
  onBack: () => void;
}

// LCG pseudo-random generator (seed=42) for QR data area fill
function lcgRandom(seed: number): () => boolean {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) % 2 === 0;
  };
}

// Build a 13×13 boolean grid representing a minimal QR-like pattern
function buildQrGrid(): boolean[][] {
  const SIZE = 13;
  const grid: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));

  // Finder pattern helper: fills a 5×5 pattern at (r, c)
  function finder(r: number, c: number) {
    for (let dr = 0; dr < 5; dr++) {
      for (let dc = 0; dc < 5; dc++) {
        const isOuter = dr === 0 || dr === 4 || dc === 0 || dc === 4;
        const isInner = dr === 2 && dc === 2;
        grid[r + dr][c + dc] = isOuter || isInner;
      }
    }
  }

  // Top-left finder at (0, 0)
  finder(0, 0);
  // Top-right finder at (0, 8)
  finder(0, 8);
  // Bottom-left finder at (8, 0)
  finder(8, 0);

  // Timing patterns: row 6 and col 6 (alternating, between finders)
  for (let i = 5; i < 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Fill data area with pseudo-random LCG
  const rand = lcgRandom(42);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      // Skip finder pattern zones and timing rows/cols
      const inTopLeft = r < 6 && c < 6;
      const inTopRight = r < 6 && c >= 7;
      const inBottomLeft = r >= 7 && c < 6;
      const onTiming = r === 6 || c === 6;
      if (inTopLeft || inTopRight || inBottomLeft || onTiming) {
        rand(); // consume RNG to keep sequence stable
        continue;
      }
      grid[r][c] = rand();
    }
  }

  return grid;
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
  return (
    <div className="min-h-screen flex flex-col bg-page" style={{ fontFamily: "var(--font-base)" }}>

      {/* Sticky logo-only header */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2">
        <div
          style={{ width: "clamp(320px, calc(100% - 2rem), 560px)", margin: "0 auto" }}
        >
          <HeaderLogo />
        </div>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 flex justify-center py-5 pb-24 sm:pb-5">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-8"
          style={{ width: "clamp(320px, calc(100% - 2rem), 560px)", margin: "0 auto", boxSizing: "border-box" }}
        >

          {/* Heading + subtitle */}
          <h1 className="text-xl font-bold text-[#1F2329] text-center mb-2">
            スマートフォンで本人確認を行ってください
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed text-center mb-6">
            この手順はスマートフォンで完了する必要があります。
          </p>

          {/* Instruction steps */}
          <ol className="flex flex-col gap-4 mb-6">
            {/* Step 1 */}
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-[#1F2329]">1</span>
              </div>
              <div>
                <p className="text-sm text-[#1F2329] leading-relaxed">スマートフォンのカメラを起動する</p>
              </div>
            </li>

            {/* Step 2 */}
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-[#1F2329]">2</span>
              </div>
              <div>
                <p className="text-sm text-[#1F2329] leading-relaxed">下記のQRコードを読み取る</p>
              </div>
            </li>

            {/* Step 3 */}
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-[#1F2329]">3</span>
              </div>
              <div>
                <p className="text-sm text-[#1F2329] leading-relaxed">D-Confiaアプリが自動的に起動します</p>
                <p className="text-xs text-gray-400">（アプリが未インストールの場合はストアへ誘導されます）</p>
              </div>
            </li>
          </ol>

          {/* QR code placeholder */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative inline-block">
              {/* Corner bracket — top-left */}
              <span
                aria-hidden="true"
                className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-gray-400"
              />
              {/* Corner bracket — bottom-right */}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-gray-400"
              />

              <div
                role="img"
                aria-label="QRコード"
                style={{
                  width: 200,
                  height: 200,
                  display: "grid",
                  gridTemplateColumns: `repeat(13, 1fr)`,
                  gridTemplateRows: `repeat(13, 1fr)`,
                  padding: 4,
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                }}
              >
                {QR_GRID.flat().map((dark, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: dark ? "#1a1a1a" : "#fff" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Timeout hint */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[11px] text-gray-400">このQRコードは10分間有効です</span>
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
