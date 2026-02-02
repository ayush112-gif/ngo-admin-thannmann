import { supabase } from "@/utils/supabaseClient";
import { toast } from "sonner";

export function startAdminNotifications() {
  // Donations
  supabase
    .channel("donations-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "donations" },
      (payload) => {
        toast.success(`💰 New donation: ₹${payload.new.amount}`);
      }
    )
    .subscribe();

  // Volunteers
  supabase
    .channel("volunteers-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "volunteer_applications" },
      () => {
        toast(`🙋 New volunteer application received`);
      }
    )
    .subscribe();

  // Contact messages
  supabase
    .channel("messages-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "contact_messages" },
      () => {
        toast(`📩 New contact message`);
      }
    )
    .subscribe();
}
