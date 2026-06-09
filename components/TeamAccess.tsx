"use client";
import { useState } from "react";
import { useApp, useFarm } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ACCESS_ROLES, ACCESS_ROLE_LABEL, caps, toAccessRole, type AccessRole } from "@/lib/permissions";

// Team & access card: who's on the farm, what each role can reach, and (for the
// owner/manager) inviting people. Invites are a demo mock today — when Supabase
// lands this writes a membership row and sends the email.
export function TeamAccess() {
  const farm = useFarm();
  const { role, toast } = useApp();
  const t = useT();
  const canManage = caps(role).canManageTeam;

  const members = farm.members ?? [];
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AccessRole>("harvester");
  const [pending, setPending] = useState<{ email: string; role: AccessRole }[]>([]);

  function invite() {
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    if (!ok) { toast(t("Enter a valid email")); return; }
    setPending((p) => [...p, { email: email.trim(), role: inviteRole }]);
    toast(`${t("Invitation sent (demo)")}: ${email.trim()}`);
    setEmail("");
  }

  // One-line summary of what a role can reach.
  function reach(r: AccessRole): string {
    const c = caps(r);
    if (r === "owner") return t("Everything, incl. team & billing");
    if (r === "manager") return t("Everything incl. finances; can invite");
    return c.canEditPlan ? t("Operations & planning · no finances/simulator") : t("View only · no finances/simulator/edits");
  }

  return (
    <div className="card p-6 mb-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h4 className="text-[15px] font-bold">{t("Team & access")}</h4>
        <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "var(--bg)", color: "var(--muted)" }}>{members.length + pending.length} {t("members")}</span>
      </div>
      <p className="text-xs mb-4 text-muted">{t("Each role sees only what it needs. Sensitive areas stay private.")}</p>

      {/* Roster */}
      <div className="space-y-2 mb-4">
        {members.length === 0 && pending.length === 0 && (
          <p className="text-sm text-muted py-2">{t("No team members yet.")}</p>
        )}
        {members.map((m) => {
          const ar = toAccessRole(m.role);
          return (
            <div key={m.id} className="flex items-center gap-3 py-2 border-t border-line first:border-t-0">
              <span className="h-8 w-8 rounded-lg grid place-items-center text-xs font-bold shrink-0" style={{ background: "var(--lime)" }}>{m.name.slice(0, 2).toUpperCase()}</span>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{m.name}</p><p className="text-[11px] text-muted truncate">{reach(ar)}</p></div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: "var(--bg)" }}>{t(ACCESS_ROLE_LABEL[ar])}</span>
            </div>
          );
        })}
        {pending.map((p, i) => (
          <div key={`p${i}`} className="flex items-center gap-3 py-2 border-t border-line" style={{ opacity: 0.7 }}>
            <span className="h-8 w-8 rounded-lg grid place-items-center text-xs font-bold shrink-0" style={{ background: "var(--bg)" }}>@</span>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{p.email}</p><p className="text-[11px] text-muted">{t("Invitation pending")}</p></div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: "var(--bg)" }}>{t(ACCESS_ROLE_LABEL[p.role])}</span>
          </div>
        ))}
      </div>

      {/* Invite */}
      {canManage ? (
        <div className="border-t border-line pt-4">
          <label className="block text-xs font-medium mb-1.5 text-muted">{t("Invite by email")}</label>
          <div className="flex flex-wrap gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@farm.com" className="setinput flex-1 min-w-[180px]" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as AccessRole)} className="setinput" style={{ width: "auto" }}>
              {ACCESS_ROLES.map((r) => <option key={r} value={r}>{t(ACCESS_ROLE_LABEL[r])}</option>)}
            </select>
            <button onClick={invite} className="rounded-full px-5 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Send invite")}</button>
          </div>
          <p className="text-[11px] text-muted mt-2">{t("Demo: no email is actually sent.")}</p>
        </div>
      ) : (
        <p className="text-xs text-muted border-t border-line pt-4">{t("Only the owner and farm manager can invite people.")}</p>
      )}
    </div>
  );
}
