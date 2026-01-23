import { supabase } from "@/utils/supabaseClient";

const API_BASE = "http://localhost:5050";

export async function logAction(params: {
  action: string;
  entity: string;
  entity_id?: string | null;
  details?: any;
}) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    await fetch(`${API_BASE}/admin/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor_user_id: user.id,
        actor_email: user.email,
        action: params.action,
        entity: params.entity,
        entity_id: params.entity_id || null,
        details: params.details || {},
      }),
    });
  } catch (e) {
    // ignore
  }
}
