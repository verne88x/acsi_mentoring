import { supabase } from "@/lib/supabaseClient";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
};

export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as any;
}
