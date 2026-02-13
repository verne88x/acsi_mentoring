"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);

        // 1) PKCE flow: ?code=...
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace("/auth/set-password");
          return;
        }

        // 2) Verify flow: ?token=...&type=invite (or token_hash)
        const type = url.searchParams.get("type");
        const token = url.searchParams.get("token") || url.searchParams.get("token_hash");
        if (type && token) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash: token,
          });
          if (error) throw error;
          router.replace("/auth/set-password");
          return;
        }

        // 3) Implicit flow: #access_token=...&refresh_token=...
        const hash = window.location.hash.replace("#", "");
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          router.replace("/auth/set-password");
          return;
        }

        setMsg("Invite link is missing tokens. Please request a new invite.");
      } catch (e: any) {
        setMsg(e?.message ?? "Failed to sign in from invite link.");
      }
    })();
  }, [router]);

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontWeight: 900 }}>Invite</h1>
      <p style={{ opacity: 0.8 }}>{msg}</p>
    </div>
  );
}
