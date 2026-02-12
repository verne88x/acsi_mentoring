"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type School = { id: string; name: string; county: string | null; status: string };

export default function AdminSchools() {
  const [name, setName] = useState("");
  const [county, setCounty] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);

  async function load() {
    const { data, error } = await supabase.from("schools").select("id,name,county,status").order("name");
    if (error) setErr(error.message);
    setSchools((data ?? []) as any);
  }

  useEffect(() => { load(); }, []);

  async function createSchool() {
    setMsg(null); setErr(null);
    if (!name.trim()) { setErr("Name required"); return; }
    const { error } = await supabase.from("schools").insert({ name: name.trim(), county: county.trim() || null });
    if (error) setErr(error.message);
    else { setMsg("School created"); setName(""); setCounty(""); await load(); }
  }

  return (
    <AppShell title="Admin · Schools" requireRole="acsi_admin">
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {msg && <div style={{ opacity: 0.85 }}>{msg}</div>}

      <div style={card}>
        <div style={{ fontWeight: 900 }}>Create school</div>
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="School name (required)" style={inp} />
          <input value={county} onChange={(e) => setCounty(e.target.value)} placeholder="County (optional)" style={inp} />
          <button onClick={createSchool} style={btn}>Create</button>
        </div>
      </div>

      <h2 style={{ marginTop: 18, fontSize: 14, fontWeight: 900 }}>Schools</h2>
      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {schools.map((s) => (
          <div key={s.id} style={row}>
            <div style={{ fontWeight: 900 }}>{s.name}</div>
            <div style={{ opacity: 0.75, fontSize: 12 }}>{s.county ?? ""}</div>
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
