import { HeaderLogo } from "./HeaderLogo";

export type DemoFlowVersion = "seiyaku" | "choku";

interface VersionSelectEntryProps {
  onSelect: (version: DemoFlowVersion) => void;
}

const VERSIONS: { id: DemoFlowVersion; title: string; description: string }[] = [
  { id: "seiyaku", title: "成約便", description: "規約はステップ1内で確認します" },
  { id: "choku",   title: "直便",   description: "規約は専用画面で表示されます" },
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
