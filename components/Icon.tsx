import { ICONS } from "@/lib/icons";

export function Icon({ name, size = 18, className = "", style = {} }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}
      dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }}
    />
  );
}
