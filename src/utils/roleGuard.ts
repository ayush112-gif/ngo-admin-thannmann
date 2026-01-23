import { supabase } from "@/utils/supabaseClient";

export async function getMyRole(): Promise<"super_admin" | "editor" | "manager" | "none"> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) return "none";

  const { data, error } = await supabase
    .from("user_roles")
    .select("role_name")
    .eq("user_id", user.id)
    .single();

  if (error || !data?.role_name) return "none";

  return data.role_name as any;
}

export function canAccess(route: string, role: string) {
  // super_admin can access everything
  if (role === "super_admin") return true;

  // editor permissions
  if (role === "editor") {
    return ["/admin/blogs", "/admin/announcements", "/admin/dashboard"].includes(route);
  }

  // manager permissions
  if (role === "manager") {
    return [
      "/admin/programs",
      "/admin/internships",
      "/admin/volunteers",
      "/admin/donations",
      "/admin/dashboard",
    ].includes(route);
  }

  return false;
}
