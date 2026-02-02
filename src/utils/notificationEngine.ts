import { supabase } from "@/utils/supabaseClient";
import { toast } from "sonner";

export function startNotificationEngine(onNew: () => void) {
  supabase
    .channel("admin-notifications")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "admin_notifications" },
      (payload) => {
        toast(payload.new.title);
        onNew(); // update badge counter
        playSound();
      }
    )
    .subscribe();
}

function playSound() {
  const audio = new Audio("/notification.mp3");
  audio.play().catch(() => {});
}
