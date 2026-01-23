import { supabase } from "@/utils/supabaseClient";

export function subscribeDashboardRealtime(onChange: () => void) {
  const donationsChannel = supabase
    .channel("realtime-donations")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "donations" },
      () => onChange()
    )
    .subscribe();

  const volunteersChannel = supabase
    .channel("realtime-volunteers")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "volunteer_applications" },
      () => onChange()
    )
    .subscribe();

  const blogsChannel = supabase
    .channel("realtime-blogs")
    .on("postgres_changes", { event: "*", schema: "public", table: "blogs" }, () => onChange())
    .subscribe();

  const announcementsChannel = supabase
    .channel("realtime-announcements")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "announcements" },
      () => onChange()
    )
    .subscribe();

  const internshipsChannel = supabase
    .channel("realtime-internships")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "internships" },
      () => onChange()
    )
    .subscribe();

  const programsChannel = supabase
    .channel("realtime-programs")
    .on("postgres_changes", { event: "*", schema: "public", table: "programs" }, () => onChange())
    .subscribe();

  return () => {
    supabase.removeChannel(donationsChannel);
    supabase.removeChannel(volunteersChannel);
    supabase.removeChannel(blogsChannel);
    supabase.removeChannel(announcementsChannel);
    supabase.removeChannel(internshipsChannel);
    supabase.removeChannel(programsChannel);
  };
}
