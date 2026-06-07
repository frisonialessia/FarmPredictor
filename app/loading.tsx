import { BrandMark } from "@/components/BrandMark";

// Route-level loading UI: shown during navigation/data loads. Quiet and on-brand.
export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center" style={{ background: "var(--bg)" }} role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-3">
        <BrandMark size={36} />
        <span aria-hidden="true" className="h-7 w-7 rounded-full animate-spin" style={{ border: "3px solid var(--line)", borderTopColor: "var(--green)" }} />
      </div>
    </div>
  );
}
