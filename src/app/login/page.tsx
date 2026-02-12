"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMsg(error.message);
    else router.push("/dashboard");
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontWeight: 900 }}>Sign in</h1>
      <p style={{ opacity: 0.8 }}>
        If you were invited, set your password from the invite email first.
      </p>

      {msg && <div style={{ color: "crimson", marginTop: 10 }}>{msg}</div>}

      <label style={lbl}>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
      </label>

      <label style={lbl}>
        Password
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={inp} />
      </label>

      <button onClick={signIn} disabled={busy} style={btn}>
        Sign in
      </button>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 6, marginTop: 10 };
const inp: React.CSSProperties = { padding: 12, borderRadius: 12, border: "1px solid #ddd" };
const btn: React.CSSProperties = {
  marginTop: 12,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontWeight: 900,
  background: "white",
};
