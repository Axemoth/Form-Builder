import { cn } from "~/lib/utils";

interface StrawHatProps {
  className?: string;
}

export function StrawHat({ className }: StrawHatProps) {
  return (
    <svg
      viewBox="0 0 100 60"
      className={cn("w-16 h-10 select-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hat Brim */}
      <path
        d="M 5,45 C 5,30 95,30 95,45 C 95,58 5,58 5,45 Z"
        fill="#e5c158"
        stroke="#b08c26"
        strokeWidth="1.5"
      />
      {/* Hat Brim shadow / inner line */}
      <path d="M 12,45 C 12,35 88,35 88,45 C 88,54 12,54 12,45 Z" fill="#d2ac42" opacity="0.3" />
      <ellipse
        cx="50"
        cy="45"
        rx="36"
        ry="7"
        fill="none"
        stroke="#927118"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {/* Red Ribbon Band */}
      <path
        d="M 24,42 C 24,42 32,36 50,36 C 68,36 76,42 76,42 L 77,46 C 77,46 68,40 50,40 C 32,40 23,46 23,46 Z"
        fill="#c41e3a"
      />
      {/* Hat Crown */}
      <path
        d="M 25,41 C 23,20 38,10 50,10 C 62,10 77,20 75,41 Z"
        fill="#f3d06a"
        stroke="#b08c26"
        strokeWidth="1.5"
      />
      {/* Red Ribbon overlay (covering the boundary perfectly) */}
      <path
        d="M 23.5,41 C 24,37 32,32 50,32 C 68,32 76,37 76.5,41 C 76.8,43.5 76,45 76,45 C 76,45 68,39.5 50,39.5 C 32,39.5 24,45 24,45 C 24,45 23.2,43.5 23.5,41 Z"
        fill="#c41e3a"
        stroke="#901428"
        strokeWidth="0.5"
      />
    </svg>
  );
}
