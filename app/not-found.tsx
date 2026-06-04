import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6" style={{ background: "linear-gradient(135deg,#0B0F0C,#143b1f 60%,#1d5c2e)" }}>
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6"><BrandMark size={48} /></div>
        <p className="mono text-7xl font-bold" style={{ color: "var(--lime)" }}>404</p>
        <h1 className="text-white text-2xl font-extrabold tracking-tight mt-4">This field isn&apos;t on the map.</h1>
        <p className="mt-3" style={{ color: "rgba(255,255,255,.7)" }}>The page you&apos;re looking for doesn&apos;t exist — but your margin is still waiting on the dashboard.</p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link href="/dashboard" className="rounded-full px-6 py-3 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Open the dashboard →</Link>
          <Link href="/" className="rounded-full px-6 py-3 text-sm font-semibold border btn-press" style={{ borderColor: "rgba(255,255,255,.25)", color: "#fff" }}>Back home</Link>
        </div>
      </div>
    </div>
  );
}
