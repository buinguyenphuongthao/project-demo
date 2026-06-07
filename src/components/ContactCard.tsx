import React from "react";

interface ContactCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  meta: string;
  hint: string;
  emphasis?: 'large' | 'small';
}

export function ContactCard({ icon, value, meta, hint, emphasis = 'large' }: ContactCardProps) {
  return (
    <div className="flex items-start gap-4 p-[18px_20px] bg-white border border-gray-200 rounded-[14px] transition-[border-color,box-shadow] duration-150 hover:border-[#c2ddc2] hover:shadow-[0_4px_14px_rgba(56,142,49,0.08)]">
      <div className="w-[42px] h-[42px] rounded-[11px] bg-[#f0faf0] flex items-center justify-center flex-shrink-0" style={{ color: 'var(--color-accent-primary)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={emphasis === 'large' ? 'text-xl font-bold text-[#1F2329] mb-1.5' : 'text-base font-bold text-[#1F2329] mb-1.5'}>{value}</div>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{meta}</p>
        <p className="text-xs text-gray-400 leading-relaxed pt-2.5 border-t border-dashed border-gray-200">{hint}</p>
      </div>
    </div>
  );
}
