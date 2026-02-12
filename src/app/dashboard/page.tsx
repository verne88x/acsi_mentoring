"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getMyProfile, Profile } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

type School = { id: string; name: string; county: string | null };

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getMyProfile();
      setProfile(p);
      if (!p) return;

      const { data, error } = await supabase.from("schools").select("id,name,county").order("name");
      if (error) setErr(error.message);
      setSchools((data ?? []) as any);
    })();
  }, []);

  return (
    <AppShell title="Dashboard">
      {profile?.role === "acsi_admin" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/admin/schools" style={chip}>Admin: Schools</Link>
          <Link href="/admin/users" style={chip}>Admin: Users</Link>
          <Link href="/reports" style={chip}>Exports</Link>
        </div>
      )}

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {schools.map((s) => (
          <Link key={s.id} href={`/schools/${s.id}`} style={card}>
            <div style={{ fontWeight: 900 }}>{s.name}</div>
            <div style={{ opacity: 0.75, fontSize: 12 }}>{s.county ?? ""}</div>
          </Link>
        ))}
        {schools.length === 0 && <div style={{ opacity: 0.8 }}>No schools yet.</div>}
      </div>
    </AppShell>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 12,
  textDecoration: "none",
  color: "inherit",
  background: "white",
};

const chip: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 999,
  padding: "8px 12px",
  textDecoration: "none",
  color: "inherit",
  fontWeight: 800,
};
