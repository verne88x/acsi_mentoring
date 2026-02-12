"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";

export default function Plan() {
  const params = useParams();
  const schoolId = String((params as any).id);

  return (
    <AppShell title="90-Day Action Plan">
      <p style={{ opacity: 0.8 }}>Placeholder. We'll migrate your working Plan module into v2 next.</p>
      <pre style={{ opacity: 0.8 }}>schoolId: {schoolId}</pre>
    </AppShell>
  );
}
