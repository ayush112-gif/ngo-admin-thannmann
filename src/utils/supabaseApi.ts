import { supabase } from "@/utils/supabaseClient";

/* ---------------------------------------------
   TYPES (optional but useful)
---------------------------------------------- */
export type RoleName = "super_admin" | "manager" | "editor" | "none";

/* ---------------------------------------------
   ✅ VOLUNTEERS API
   Table: volunteer_applications
---------------------------------------------- */
export const supaVolunteers = {
  async create(payload: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    interest?: string;
  }) {
    const { data, error } = await supabase
      .from("volunteer_applications")
      .insert([
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          city: payload.city || null,
          interest: payload.interest || null,
          status: "Pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("volunteer_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateStatus(id: string, status: "Pending" | "Approved" | "Rejected") {
    const { error } = await supabase
      .from("volunteer_applications")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from("volunteer_applications")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

/* ---------------------------------------------
   ✅ DONATIONS API
   Table: donations
---------------------------------------------- */
export const supaDonations = {
  async create(payload: {
    name: string;
    email: string;
    phone?: string;
    amount: number;
    type: string;
    paymentMethod: string;
    anonymous?: boolean;
    taxBenefit?: boolean;
    pan?: string | null;
    address?: string | null;
  }) {
    const { data, error } = await supabase
      .from("donations")
      .insert([
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          amount: payload.amount,
          type: payload.type,
          payment_method: payload.paymentMethod,
          anonymous: payload.anonymous || false,
          tax_benefit: payload.taxBenefit || false,
          pan: payload.pan || null,
          address: payload.address || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

/* ---------------------------------------------
   ✅ ANNOUNCEMENTS API
---------------------------------------------- */
export const supabaseAnnouncements = {
  async getAll() {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPublishedForHome() {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("status", "published")
      .eq("visibility", "home")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ✅ ALIAS (old code support)
  async getPublishedHome() {
    return await supabaseAnnouncements.getPublishedForHome();
  },

  async create(payload: { title: string; message: string; visibility: string }) {
    const { data, error } = await supabase
      .from("announcements")
      .insert([{ ...payload, status: "draft" }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publish(id: string) {
    const { error } = await supabase
      .from("announcements")
      .update({ status: "published" })
      .eq("id", id);

    if (error) throw error;
  },

  async unpublish(id: string) {
    const { error } = await supabase
      .from("announcements")
      .update({ status: "draft" })
      .eq("id", id);

    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
  },
};

// ✅ BACKWARD COMPATIBILITY EXPORT
export const supaAnnouncements = supabaseAnnouncements;

/* ---------------------------------------------
   ✅ BLOGS API
---------------------------------------------- */
export const supabaseBlogs = {
  async getAll() {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPublished() {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(payload: {
    title: string;
    category: string;
    content: string;
    cover_image?: string;
    meta_description?: string;
  }) {
    const { data, error } = await supabase
      .from("blogs")
      .insert([
        {
          title: payload.title,
          category: payload.category,
          content: payload.content,
          cover_image: payload.cover_image || null,
          meta_description: payload.meta_description || null,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publish(id: string) {
    const { error } = await supabase
      .from("blogs")
      .update({ status: "published" })
      .eq("id", id);

    if (error) throw error;
  },

  async unpublish(id: string) {
    const { error } = await supabase
      .from("blogs")
      .update({ status: "draft" })
      .eq("id", id);

    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) throw error;
  },
};

// ✅ BACKWARD COMPATIBILITY EXPORT
export const supaBlogs = supabaseBlogs;

/* ---------------------------------------------
   ✅ PROGRAMS API
---------------------------------------------- */
export const supabasePrograms = {
  async getAll() {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPublished() {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(payload: {
    title: string;
    description: string;
    category: string;
    image_url?: string;
  }) {
    const { data, error } = await supabase
      .from("programs")
      .insert([
        {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          image_url: payload.image_url || null,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publish(id: string) {
    const { error } = await supabase
      .from("programs")
      .update({ status: "published" })
      .eq("id", id);

    if (error) throw error;
  },

  async unpublish(id: string) {
    const { error } = await supabase
      .from("programs")
      .update({ status: "draft" })
      .eq("id", id);

    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) throw error;
  },
};

/* ---------------------------------------------
   ✅ INTERNSHIPS API
---------------------------------------------- */
export const supabaseInternships = {
  async getAll() {
    const { data, error } = await supabase
      .from("internships")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPublished() {
    const { data, error } = await supabase
      .from("internships")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(payload: {
    title: string;
    description: string;
    location?: string;
    duration?: string;
  }) {
    const { data, error } = await supabase
      .from("internships")
      .insert([
        {
          title: payload.title,
          description: payload.description,
          location: payload.location || null,
          duration: payload.duration || null,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publish(id: string) {
    const { error } = await supabase
      .from("internships")
      .update({ status: "published" })
      .eq("id", id);

    if (error) throw error;
  },

  async unpublish(id: string) {
    const { error } = await supabase
      .from("internships")
      .update({ status: "draft" })
      .eq("id", id);

    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase.from("internships").delete().eq("id", id);
    if (error) throw error;
  },
};

export const supabaseDashboard = {
  async getLiveStats() {
    // Donations (total)
    const { count: totalDonationsCount } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true });

    // Volunteers
    const { count: volunteerCount } = await supabase
      .from("volunteer_applications")
      .select("*", { count: "exact", head: true });

    // Internships
    const { count: internshipCount } = await supabase
      .from("internships")
      .select("*", { count: "exact", head: true });

    // Programs
    const { count: programCount } = await supabase
      .from("programs")
      .select("*", { count: "exact", head: true });

    // Blogs Published
    const { count: publishedBlogs } = await supabase
      .from("blogs")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    // Announcements Published
    const { count: publishedAnnouncements } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    // Recent donations list
    const { data: recentDonations } = await supabase
      .from("donations")
      .select("id,name,email,amount,type,payment_method,created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    // Recent volunteers list
    const { data: recentVolunteers } = await supabase
      .from("volunteer_applications")
      .select("id,name,email,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      counts: {
        totalDonationsCount: totalDonationsCount || 0,
        volunteerCount: volunteerCount || 0,
        internshipCount: internshipCount || 0,
        programCount: programCount || 0,
        publishedBlogs: publishedBlogs || 0,
        publishedAnnouncements: publishedAnnouncements || 0,
      },
      recentDonations: recentDonations || [],
      recentVolunteers: recentVolunteers || [],
    };
  },
};
 
// ✅ CONTACT MESSAGES API
export const supabaseContact = {
  async create(payload: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          subject: payload.subject || null,
          message: payload.message,
          status: "unread",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markRead(id: string) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: "read" })
      .eq("id", id);

    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  },
};


/* ---------------------------------------------
   ✅ IMPACT RULES API
   Table: impact_rules
---------------------------------------------- */
export const supaImpactRules = {
  async getAll() {
    const { data, error } = await supabase
      .from("impact_rules")
      .select("*")
      .order("amount", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async upsertRule(payload: {
    amount: number;
    label: string;
    impact_text: string;
  }) {
    const { error } = await supabase
      .from("impact_rules")
      .upsert([payload], { onConflict: "amount" });

    if (error) throw error;
  },

  async removeByAmount(amount: number) {
    const { error } = await supabase
      .from("impact_rules")
      .delete()
      .eq("amount", amount);

    if (error) throw error;
  },
};

/* ---------------------------------------------
   ✅ IMPACT STATS API
---------------------------------------------- */
export const supaImpactStats = {
  async getLiveStats() {
    // total raised
    const { data: donations } = await supabase
      .from("donations")
      .select("amount");

    const totalRaised =
      donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    // total donors
    const totalDonors = donations?.length || 0;

    // today donors
    const today = new Date().toISOString().slice(0, 10);

    const { count: todayDonors } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    return {
      totalRaised,
      totalDonors,
      todayDonors: todayDonors || 0,
    };
  },
};

export const supaDonationGoal = {
  async getGoal() {
    const { data, error } = await supabase
      .from("donation_goals")
      .select("*")
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },
};


export const supaLeaderboard = {
  async getTopDonors() {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("amount", { ascending: false })
      .limit(10);

    if (error) throw error;

    return (data || []).map((d: any) => ({
      name: d.name,
      amount: d.amount,
      anonymous: d.anonymous,
    }));
  },
};

