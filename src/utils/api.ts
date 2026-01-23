import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5d248a0f`;

// Create Supabase client for frontend
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API client with auth token
async function apiClient(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || publicAnonKey;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// Auth API
export const authAPI = {
  signUp: (data: { email: string; password: string; name: string; role?: string }) =>
    apiClient('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  
  signOut: () => supabase.auth.signOut(),
  
  getSession: () => supabase.auth.getSession(),
};

// Announcements API
export const announcementsAPI = {
  getAll: () => apiClient('/announcements'),
  create: (data: any) => apiClient('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient(`/announcements/${id}`, { method: 'DELETE' }),
};

// Programs API
export const programsAPI = {
  getAll: () => apiClient('/programs'),
  create: (data: any) => apiClient('/programs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient(`/programs/${id}`, { method: 'DELETE' }),
};

// Volunteers API
export const volunteersAPI = {
  submit: (data: any) => apiClient('/volunteers', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiClient('/volunteers'),
  updateStatus: (id: string, status: string) => apiClient(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// Internships API
export const internshipsAPI = {
  getAll: () => apiClient('/internships'),
  create: (data: any) => apiClient('/internships', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient(`/internships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  apply: (id: string, data: any) => apiClient(`/internships/${id}/apply`, { method: 'POST', body: JSON.stringify(data) }),
  getApplications: (id: string) => apiClient(`/internships/${id}/applications`),
};

// Donations API
export const donationsAPI = {
  create: (data: any) => apiClient('/donations', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiClient('/donations'),
  getStats: () => apiClient('/donations/stats'),
};

// Blogs API
export const blogsAPI = {
  getAll: () => apiClient('/blogs'),
  create: (data: any) => apiClient('/blogs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Contact API
export const contactAPI = {
  submit: (data: any) => apiClient('/contact', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiClient('/contact'),
  updateStatus: (id: string, status: string) => apiClient(`/contact/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiClient('/dashboard/stats'),
};
