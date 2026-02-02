import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Bell } from "lucide-react";

export function AdminBell({ onOpen }: { onOpen: () => void }) {
  const [count, setCount] = useState(0);

  async function load() {
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("read", false);

    setCount(data?.length || 0);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <button onClick={onOpen} className="relative">
      <Bell size={22} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
          {count}
        </span>
      )}
    </button>
  );
}
