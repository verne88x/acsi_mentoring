"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type School = { id: string; name: string };
type Profile = { id: string; email: string | null; full_name: string | null; role: string };

export default function AdminUsers() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("mentor");
  const [schoolId, setSchoolId] = useState<string>("");
  const [memberRole, setMemberRole] = useState("mentor");

  const [schools, setSchools] = useState<School[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const s = await supabase.from("schools").select("id,name").order("name");
    if (!s.error) setSchools((s.data ?? []) as any);

    const p = await supabase.from("profiles").select("id,email,full_name,role").order("created_at", { ascending: false });
    if (!p.error) setProfiles((p.data ?? []) as any);
  }

  useEffect(() => {
    load();
  }, []);

  async function invite() {
    setBusy(true);
    setErr(null);
    setMsg(null);

    try {
      if (!email.trim()) {
        setErr("Email required");
        return;
      }

      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;
      if (!token) {
        setErr("Not signed in");
        return;
      }

      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim() || null,
          role,
          school_id: schoolId || null,
          member_role: schoolId ? memberRole : null,
        }),
      });

      const out = await res.json();
      if (!res.ok) throw new Error(out?.error ?? "Invite failed");

      setMsg("Invite sent. User will receive an email to set password.");
      setEmail("");
      setFullName("");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Admin · Users" requireRole="acsi_admin">
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {msg && <div style={{ opacity: 0.85 }}>{msg}</div>}

      <div style={card}>
        <div style={{ fontWeight: 900 }}>Invite new user</div>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inp} />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name (optional)" style={inp} />

          <select value={role} onChange={(e) => setRole(e.target.value)} style={inp}>
            <option value="mentor">mentor</option>
            <option value="school_admin">school_admin</option>
            <option value="acsi_admin">acsi_admin</option>
            <option value="viewer">viewer</option>
          </select>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 12, opacity: 0.8 }}>Optional: assign to a school</div>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} style={inp}>
              <option value="">(no school)</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {schoolId && (
              <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)} style={inp}>
                <option value="mentor">mentor</option>
                <option value="school_admin">school_admin</option>
                <option value="viewer">viewer</option>
              </select>
            )}
          </div>

          <button onClick={invite} disabled={busy} style={btn}>
            Send invite
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: 18, fontSize: 14, fontWeight: 900 }}>Latest users</h2>
      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {profiles.slice(0, 25).map((p) => (
          <div key={p.id} style={row}>
            <div style={{ fontWeight: 900 }}>{p.email}</div>
            <div style={{ opacity: 0.75, fontSize: 12 }}>{p.full_name ?? ""}</div>
            <div style={{ opacity: 0.75, fontSize: 12 }}>{p.role}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

const card: React.CSSProperties = { border: "1px solid #ddd", borderRadius: 14, padding: 12 };
const inp: React.CSSProperties = { padding: 12, borderRadius: 12, border: "1px solid #ddd" };
const btn: React.CSSProperties = { padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", fontWeight: 900, background: "white" };
const row: React.CSSProperties = { border: "1px solid #eee", borderRadius: 14, padding: 12 };
