"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";

export default function Assessment() {
  const params = useParams();
  const schoolId = String((params as any).id);

  return (
    <AppShell title="Health Check">
      <p style={{ opacity: 0.8 }}>
        Placeholder. Next: plug in your Health Check v2 (buttons + detailed questions).
      </p>
      <pre style={{ opacity: 0.8 }}>schoolId: {schoolId}</pre>
    </AppShell>
  );
}
