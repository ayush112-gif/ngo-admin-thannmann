import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export function AdminNotificationPanel() {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    setItems(data || []);
  }

  async function markRead() {
    await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
    load();
  }

  useEffect(() => {
    load();
    markRead();
  }, []);

  return (
    <div className="absolute right-4 top-14 w-96 bg-white border rounded-xl shadow-xl p-4 max-h-96 overflow-auto">
      <h3 className="font-bold mb-3">Notifications</h3>

      {items.map((n) => (
        <div key={n.id} className="border-b py-2">
          <div className="font-semibold">{n.title}</div>
          <div className="text-sm text-gray-600">{n.message}</div>
        </div>
      ))}
    </div>
  );
}
