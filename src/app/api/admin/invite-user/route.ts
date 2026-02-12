import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(bearer: string | null) {
  if (!bearer?.startsWith("Bearer ")) throw new Error("Missing Authorization");
  const token = bearer.slice("Bearer ".length);

  const admin = supabaseAdmin();

  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes?.user) throw new Error("Unauthorized");

  const callerId = userRes.user.id;

  const { data: prof, error: pErr } = await admin.from("profiles").select("role").eq("id", callerId).single();
  if (pErr || !prof) throw new Error("Unauthorized");
  if (prof.role !== "acsi_admin") throw new Error("Forbidden");

  return { admin };
}

export async function POST(req: Request) {
  try {
    const bearer = req.headers.get("authorization");
    const { admin } = await requireAdmin(bearer);

    const body = await req.json();
    const email = String(body.email || "").trim();
    const full_name = body.full_name ? String(body.full_name) : "";
    const role = String(body.role || "mentor");
    const school_id = body.school_id ? String(body.school_id) : null;
    const member_role = body.member_role ? String(body.member_role) : null;

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

const redirectTo =
  process.env.NEXT_PUBLIC_SITE_URL || "https://acsi-mentoring.vercel.app";

const { data: invite, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
  redirectTo,});
    if (invErr) return NextResponse.json({ error: invErr.message }, { status: 400 });

    const newUserId = invite.user?.id;
    if (!newUserId) return NextResponse.json({ error: "Invite failed" }, { status: 400 });

    const { error: upErr } = await admin
      .from("profiles")
      .upsert({ id: newUserId, email, full_name, role }, { onConflict: "id" });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

    if (school_id) {
      const { error: mErr } = await admin
        .from("school_members")
        .upsert(
          { school_id, user_id: newUserId, member_role: member_role || "mentor" },
          { onConflict: "school_id,user_id" }
        );
      if (mErr) return NextResponse.json({ error: mErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user_id: newUserId });
  } catch (e: any) {
    const msg = e?.message ?? "Server error";
    const status = msg === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: msg }, { status });
  }
}
