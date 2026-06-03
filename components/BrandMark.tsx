export function BrandMark({ size = 30, color = "#52c871" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <g fill={color}>
        <rect x="46" y="20" width="8" height="40" rx="4" />
        <g stroke={color} strokeWidth="8" strokeLinecap="round">
          <line x1="50" y1="34" x2="50" y2="14" />
          <line x1="49" y1="32" x2="29" y2="20" />
          <line x1="51" y1="32" x2="71" y2="20" />
          <line x1="48" y1="40" x2="25" y2="34" />
          <line x1="52" y1="40" x2="75" y2="34" />
          <line x1="48" y1="48" x2="27" y2="49" />
          <line x1="52" y1="48" x2="73" y2="49" />
        </g>
        <path d="M28 68 Q50 56 72 68" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <path d="M24 82 Q50 66 76 82" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
