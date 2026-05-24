import { cn } from "~/lib/utils";

interface BatLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  glow?: boolean;
}

export function BatLogo({ className, glow = true, ...props }: BatLogoProps) {
  return (
    <svg
      viewBox="0 0 100 60"
      className={cn(
        "w-16 h-10 select-none transition-all duration-300",
        glow && "drop-shadow-[0_0_12px_rgba(245,185,33,0.45)]",
        className,
      )}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="bat-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="50%" stopColor="#F5B921" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <filter id="bat-heavy-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Shadow Ring (Bat-Signal style) */}
      <path
        d="M 50,18 C 46,13 43,12 41,12 C 34,12 28,17 12,12 C 6,10 0,14 0,19 C 0,25 6,28 18,30 C 30,32 36,29 41,34 C 43,36 45,42 48,46 C 51,46 53,42 55,34 C 60,29 66,32 78,30 C 90,28 96,25 96,19 C 96,14 90,10 84,12 C 68,17 62,12 55,12 C 53,12 50,13 46,18 Z"
        fill="black"
        opacity="0.6"
        transform="translate(1, 2)"
      />

      {/* Main Bat Silhouette */}
      <path
        d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z"
        fill="url(#bat-gold-grad)"
        stroke="#8B6508"
        strokeWidth="1"
      />

      {/* Sleek Concrete Highlight */}
      <path
        d="M 41,11 C 35,11 29,15 15,11 C 10,9.5 5.5,12.5 4,16"
        stroke="#FFFFFF"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
