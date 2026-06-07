import takakuLogo from "../assets/takaku_logo.svg";

export function HeaderLogo() {
  return (
    <img
      src={takakuLogo}
      className="h-[60px] sm:h-[61px]"
      alt="高く売れるドットコム"
    />
  );
}
