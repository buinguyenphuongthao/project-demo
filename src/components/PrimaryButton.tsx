interface PrimaryButtonProps {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

// Primary action button using the design reference's "physical button" gesture:
// green face + offset depth shadow + press translate. Disabled = muted, no depth.
export function PrimaryButton({ label, disabled = false, onClick }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "button-background h-[69px] w-full rounded-[10px] py-5 pr-[17px] pl-[8px] text-white transition-[colors,box-shadow,transform] duration-200 " +
        (disabled
          ? "bg-gray-300 shadow-[0_8px_0_0_#b0b0b0] cursor-not-allowed"
          : "bg-accent-primary shadow-[0_8px_0_0_var(--color-accent-primary-depth)] cursor-pointer")
      }
    >
      <div className="leading-[10px]">
        <span className="block text-[20px] font-semibold tracking-[0]">{label}</span>
      </div>
    </button>
  );
}
