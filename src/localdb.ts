export type Announcement = {
  id: string;
  title: string;
  message: string;
  type: "Notice" | "Event" | "Urgent" | "General";
  createdAt: string;
  isPublished: boolean;
};

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  isPublished: boolean;
};

const ANN_KEY = "ngo_announcements_v1";
const BLOG_KEY = "ngo_blogs_v1";

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const localDB = {
  // ✅ Announcements
  getAnnouncements(): Announcement[] {
    return safeParse<Announcement[]>(localStorage.getItem(ANN_KEY), []);
  },

  saveAnnouncements(items: Announcement[]) {
    localStorage.setItem(ANN_KEY, JSON.stringify(items));
  },

  addAnnouncement(data: Omit<Announcement, "id" | "createdAt">) {
    const all = this.getAnnouncements();
    const newItem: Announcement = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    const updated = [newItem, ...all];
    this.saveAnnouncements(updated);
    return newItem;
  },

  toggleAnnouncementPublish(id: string) {
    const all = this.getAnnouncements();
    const updated = all.map((a) =>
      a.id === id ? { ...a, isPublished: !a.isPublished } : a
    );
    this.saveAnnouncements(updated);
  },

  deleteAnnouncement(id: string) {
    const all = this.getAnnouncements();
    const updated = all.filter((a) => a.id !== id);
    this.saveAnnouncements(updated);
  },

  // ✅ Blogs
  getBlogs(): BlogPost[] {
    return safeParse<BlogPost[]>(localStorage.getItem(BLOG_KEY), []);
  },

  saveBlogs(items: BlogPost[]) {
    localStorage.setItem(BLOG_KEY, JSON.stringify(items));
  },

  addBlog(data: Omit<BlogPost, "id" | "createdAt">) {
    const all = this.getBlogs();
    const newItem: BlogPost = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    const updated = [newItem, ...all];
    this.saveBlogs(updated);
    return newItem;
  },

  toggleBlogPublish(id: string) {
    const all = this.getBlogs();
    const updated = all.map((b) =>
      b.id === id ? { ...b, isPublished: !b.isPublished } : b
    );
    this.saveBlogs(updated);
  },

  deleteBlog(id: string) {
    const all = this.getBlogs();
    const updated = all.filter((b) => b.id !== id);
    this.saveBlogs(updated);
  },
};
