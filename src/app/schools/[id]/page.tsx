"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

export default function SchoolPage() {
  const params = useParams();
  const schoolId = String((params as any).id);
  const [school, setSchool] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("schools").select("id,name,county").eq("id", schoolId).single();
      if (error) setErr(error.message);
      else setSchool(data);
    })();
  }, [schoolId]);

  return (
    <AppShell title="School">
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {!school && !err && <div>Loading…</div>}
      {school && (
        <>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{school.name}</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>{school.county ?? ""}</div>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <Link href={`/schools/${schoolId}/assessment`} style={btn}>Health Check</Link>
            <Link href={`/schools/${schoolId}/plan`} style={btn}>90-Day Action Plan</Link>
            <Link href={`/schools/${schoolId}/notes`} style={btn}>Mentor Notes</Link>
          </div>
        </>
      )}
    </AppShell>
  );
}

const btn: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 12,
  textDecoration: "none",
  color: "inherit",
  fontWeight: 900,
};
