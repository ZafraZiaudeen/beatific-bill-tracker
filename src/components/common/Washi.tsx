import washiImg from "@/assets/washi.png";

export function Washi({ className = "" }: { className?: string }) {
  return (
    <img
      src={washiImg}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={1600}
      height={320}
      className={`absolute object-contain opacity-90 ${className}`}
    />
  );
}
