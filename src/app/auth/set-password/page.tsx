"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SetPasswordPage() {
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) router.replace("/login");
    })();
  }, [router]);

  async function setPassword() {
    setMsg(null);
    if (pw1.length < 8) return setMsg("Password must be at least 8 characters.");
    if (pw1 !== pw2) return setMsg("Passwords do not match.");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setBusy(false);

    if (error) return setMsg(error.message);
    router.replace("/dashboard");
  }

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontWeight: 900 }}>Set your password</h1>
      <p style={{ opacity: 0.8 }}>Choose a password to activate your account.</p>

      {msg && <div style={{ color: "crimson", marginTop: 10 }}>{msg}</div>}

      <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
        New password
        <input value={pw1} onChange={(e) => setPw1(e.target.value)} type="password"
               style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
      </label>

      <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
        Repeat password
        <input value={pw2} onChange={(e) => setPw2(e.target.value)} type="password"
               style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
      </label>

      <button onClick={setPassword} disabled={busy}
              style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", fontWeight: 900, background: "white" }}>
        Save password
      </button>
    </div>
  );
}
