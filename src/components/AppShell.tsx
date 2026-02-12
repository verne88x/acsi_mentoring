"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getMyProfile, Profile } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

export function AppShell({
  title,
  children,
  requireRole,
}: {
  title: string;
  children: React.ReactNode;
  requireRole?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getMyProfile();
      setProfile(p);

      if (!p && pathname !== "/login") {
        router.push("/login");
        return;
      }
      if (requireRole && p?.role !== requireRole) {
        router.push("/dashboard");
      }
    })();
  }, [router, pathname, requireRole]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <header style={hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/dashboard" style={homeBtn} aria-label="Home / Dashboard">
            🏠 Home
          </Link>
          <div style={{ fontWeight: 900 }}>
            {process.env.NEXT_PUBLIC_APP_NAME ?? "ACSI Platform"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{profile?.role ?? ""}</div>
          {profile && (
            <button onClick={signOut} style={btnSmall}>
              Logout
            </button>
          )}
        </div>
      </header>

      <main style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, margin: "6px 0 12px" }}>
          {title}
        </h1>
        {children}
      </main>
    </div>
  );
}

const hdr: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  borderBottom: "1px solid #eee",
  position: "sticky",
  top: 0,
  background: "white",
  zIndex: 10,
};

const homeBtn: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid #ddd",
  padding: "8px 10px",
  borderRadius: 12,
  fontWeight: 800,
  color: "inherit",
};

const btnSmall: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px 10px",
  borderRadius: 12,
  fontWeight: 800,
  background: "white",
};
