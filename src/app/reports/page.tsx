"use client";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

export default function Reports() {
  async function exportSchoolsCsv() {
    const { data, error } = await supabase.from("schools").select("id,name,county,status,created_at").order("name");
    if (error) { alert(error.message); return; }

    const rows = data ?? [];
    const header = ["id","name","county","status","created_at"];
    const lines = [header.join(",")].concat(
      rows.map((r: any) => header.map((k) => JSON.stringify(r[k] ?? "")).join(","))
    );

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schools.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="Exports" requireRole="acsi_admin">
      <button onClick={exportSchoolsCsv} style={btn}>Export schools (CSV)</button>
      <p style={{ marginTop: 10, opacity: 0.75 }}>Next: assessments/plans exports + PDF reports.</p>
    </AppShell>
  );
}

const btn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ddd",
  fontWeight: 900,
  background: "white",
};
