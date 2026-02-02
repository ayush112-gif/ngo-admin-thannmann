import { supabase } from "./supabaseClient";

/* ---------------------------------------------
   API BASE
---------------------------------------------- */

// Replace with your Supabase project URL
const API_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

/* ---------------------------------------------
   API CLIENT
---------------------------------------------- */

async function apiClient(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  const token = session?.access_token;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Request failed",
    }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

/* ---------------------------------------------
   AUTH
---------------------------------------------- */

export const authAPI = {
  signUp: (data: any) =>
    apiClient("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
};

/* ---------------------------------------------
   VOLUNTEERS
---------------------------------------------- */

export const volunteersAPI = {
  submit: (data: any) =>
    apiClient("/volunteers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: () => apiClient("/volunteers"),

  updateStatus: (id: string, status: string) =>
    apiClient(`/volunteers/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

/* ---------------------------------------------
   ANNOUNCEMENTS
---------------------------------------------- */

export const announcementsAPI = {
  getAll: () => apiClient("/announcements"),
  create: (data: any) =>
    apiClient("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ---------------------------------------------
   DASHBOARD
---------------------------------------------- */

export const dashboardAPI = {
  getStats: () => apiClient("/dashboard/stats"),
};
