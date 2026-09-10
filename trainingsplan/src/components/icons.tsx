type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const DumbbellIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M6.5 6.5h11v11h-11z" /><path d="M3 9v6M21 9v6" /></svg>
);
export const CalendarIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
);
export const TrendIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}><polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" /></svg>
);
export const PersonIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /></svg>
);
export const CheckIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={3} className={className}><polyline points="20 6 9 17 4 12" /></svg>
);
export const ChevronRightIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.5} className={className}><polyline points="9 18 15 12 9 6" /></svg>
);
export const ChevronLeftIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.5} className={className}><polyline points="15 18 9 12 15 6" /></svg>
);
export const PlusIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.5} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.5} className={className}><path d="M5 12h14" /></svg>
);
export const SparkIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M12 2v6M12 22v-6M4.9 4.9l4.2 4.2M19.1 19.1l-4.2-4.2M2 12h6M22 12h-6M4.9 19.1l4.2-4.2M19.1 4.9l-4.2 4.2" /></svg>
);
export const InfoIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>
);
export const TrashIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" /></svg>
);
export const LogoMark = ({ size = 40, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
    <rect x="12" y="12" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2.5" />
    <path d="M5 15v10M35 15v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9 17v6M31 17v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
  </svg>
);
