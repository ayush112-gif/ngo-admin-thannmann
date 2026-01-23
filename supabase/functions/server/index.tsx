import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// =======================
// AUTH ROUTES
// =======================

// Admin signup (creates user with auto-confirmed email)
app.post("/make-server-5d248a0f/auth/signup", async (c) => {
  try {
    const { email, password, name, role = 'admin' } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since email server hasn't been configured
      email_confirm: true
    });
    
    if (error) {
      console.log(`Error creating user: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user }, 201);
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// =======================
// ANNOUNCEMENTS ROUTES
// =======================

// Get all announcements
app.get("/make-server-5d248a0f/announcements", async (c) => {
  try {
    const announcements = await kv.getByPrefix('announcement:');
    const sortedAnnouncements = announcements.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ announcements: sortedAnnouncements });
  } catch (error) {
    console.log(`Error fetching announcements: ${error}`);
    return c.json({ error: 'Failed to fetch announcements' }, 500);
  }
});

// Create announcement (protected)
app.post("/make-server-5d248a0f/announcements", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const { title, message, type, publishNow, scheduleDate, expiryDate, pinned, visibility } = await c.req.json();
    
    const id = crypto.randomUUID();
    const announcement = {
      id,
      title,
      message,
      type: type || 'general',
      status: publishNow ? 'published' : 'draft',
      scheduleDate: scheduleDate || null,
      expiryDate: expiryDate || null,
      pinned: pinned || false,
      visibility: visibility || 'home',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    await kv.set(`announcement:${id}`, announcement);
    
    return c.json({ announcement }, 201);
  } catch (error) {
    console.log(`Error creating announcement: ${error}`);
    return c.json({ error: 'Failed to create announcement' }, 500);
  }
});

// Update announcement (protected)
app.put("/make-server-5d248a0f/announcements/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`announcement:${id}`);
    if (!existing) {
      return c.json({ error: 'Announcement not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`announcement:${id}`, updated);
    
    return c.json({ announcement: updated });
  } catch (error) {
    console.log(`Error updating announcement: ${error}`);
    return c.json({ error: 'Failed to update announcement' }, 500);
  }
});

// Delete announcement (protected)
app.delete("/make-server-5d248a0f/announcements/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    await kv.del(`announcement:${id}`);
    
    return c.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.log(`Error deleting announcement: ${error}`);
    return c.json({ error: 'Failed to delete announcement' }, 500);
  }
});

// =======================
// PROGRAMS ROUTES
// =======================

// Get all programs
app.get("/make-server-5d248a0f/programs", async (c) => {
  try {
    const programs = await kv.getByPrefix('program:');
    const sortedPrograms = programs.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ programs: sortedPrograms });
  } catch (error) {
    console.log(`Error fetching programs: ${error}`);
    return c.json({ error: 'Failed to fetch programs' }, 500);
  }
});

// Create program (protected)
app.post("/make-server-5d248a0f/programs", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const { title, description, category, featured, goal, activities, impact, imageUrl } = await c.req.json();
    
    const id = crypto.randomUUID();
    const program = {
      id,
      title,
      description,
      category: category || 'general',
      featured: featured || false,
      goal: goal || '',
      activities: activities || '',
      impact: impact || '',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    await kv.set(`program:${id}`, program);
    
    return c.json({ program }, 201);
  } catch (error) {
    console.log(`Error creating program: ${error}`);
    return c.json({ error: 'Failed to create program' }, 500);
  }
});

// Update program (protected)
app.put("/make-server-5d248a0f/programs/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`program:${id}`);
    if (!existing) {
      return c.json({ error: 'Program not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`program:${id}`, updated);
    
    return c.json({ program: updated });
  } catch (error) {
    console.log(`Error updating program: ${error}`);
    return c.json({ error: 'Failed to update program' }, 500);
  }
});

// Delete program (protected)
app.delete("/make-server-5d248a0f/programs/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    await kv.del(`program:${id}`);
    
    return c.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.log(`Error deleting program: ${error}`);
    return c.json({ error: 'Failed to delete program' }, 500);
  }
});

// =======================
// VOLUNTEER ROUTES
// =======================

// Submit volunteer application
app.post("/make-server-5d248a0f/volunteers", async (c) => {
  try {
    const { name, email, phone, city, interest, availability, message } = await c.req.json();
    
    const id = crypto.randomUUID();
    const application = {
      id,
      name,
      email,
      phone,
      city,
      interest,
      availability,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`volunteer:${id}`, application);
    
    return c.json({ application }, 201);
  } catch (error) {
    console.log(`Error submitting volunteer application: ${error}`);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

// Get all volunteer applications (protected)
app.get("/make-server-5d248a0f/volunteers", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const volunteers = await kv.getByPrefix('volunteer:');
    const sortedVolunteers = volunteers.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ volunteers: sortedVolunteers });
  } catch (error) {
    console.log(`Error fetching volunteers: ${error}`);
    return c.json({ error: 'Failed to fetch volunteers' }, 500);
  }
});

// Update volunteer status (protected)
app.put("/make-server-5d248a0f/volunteers/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const existing = await kv.get(`volunteer:${id}`);
    if (!existing) {
      return c.json({ error: 'Volunteer application not found' }, 404);
    }
    
    const updated = { ...existing, status, updatedAt: new Date().toISOString() };
    await kv.set(`volunteer:${id}`, updated);
    
    return c.json({ volunteer: updated });
  } catch (error) {
    console.log(`Error updating volunteer: ${error}`);
    return c.json({ error: 'Failed to update volunteer' }, 500);
  }
});

// =======================
// INTERNSHIP ROUTES
// =======================

// Get all internships
app.get("/make-server-5d248a0f/internships", async (c) => {
  try {
    const internships = await kv.getByPrefix('internship:');
    const sortedInternships = internships.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ internships: sortedInternships });
  } catch (error) {
    console.log(`Error fetching internships: ${error}`);
    return c.json({ error: 'Failed to fetch internships' }, 500);
  }
});

// Create internship (protected)
app.post("/make-server-5d248a0f/internships", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const { title, mode, duration, skills, deadline, status, description } = await c.req.json();
    
    const id = crypto.randomUUID();
    const internship = {
      id,
      title,
      mode: mode || 'remote',
      duration,
      skills: skills || [],
      deadline,
      status: status || 'open',
      description: description || '',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    await kv.set(`internship:${id}`, internship);
    
    return c.json({ internship }, 201);
  } catch (error) {
    console.log(`Error creating internship: ${error}`);
    return c.json({ error: 'Failed to create internship' }, 500);
  }
});

// Update internship (protected)
app.put("/make-server-5d248a0f/internships/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`internship:${id}`);
    if (!existing) {
      return c.json({ error: 'Internship not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`internship:${id}`, updated);
    
    return c.json({ internship: updated });
  } catch (error) {
    console.log(`Error updating internship: ${error}`);
    return c.json({ error: 'Failed to update internship' }, 500);
  }
});

// Submit internship application
app.post("/make-server-5d248a0f/internships/:id/apply", async (c) => {
  try {
    const internshipId = c.req.param('id');
    const { name, email, phone, college, skills, portfolio, resumeUrl } = await c.req.json();
    
    const id = crypto.randomUUID();
    const application = {
      id,
      internshipId,
      name,
      email,
      phone,
      college,
      skills,
      portfolio: portfolio || '',
      resumeUrl: resumeUrl || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`internship-application:${id}`, application);
    
    return c.json({ application }, 201);
  } catch (error) {
    console.log(`Error submitting internship application: ${error}`);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

// Get internship applications (protected)
app.get("/make-server-5d248a0f/internships/:id/applications", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const internshipId = c.req.param('id');
    const allApplications = await kv.getByPrefix('internship-application:');
    const applications = allApplications.filter(app => app.internshipId === internshipId);
    
    return c.json({ applications });
  } catch (error) {
    console.log(`Error fetching applications: ${error}`);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// =======================
// DONATION ROUTES
// =======================

// Record donation
app.post("/make-server-5d248a0f/donations", async (c) => {
  try {
    const { amount, type, name, email, phone, message, paymentMethod } = await c.req.json();
    
    const id = crypto.randomUUID();
    const receiptId = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const donation = {
      id,
      receiptId,
      amount,
      type: type || 'one-time',
      name: name || 'Anonymous',
      email: email || '',
      phone: phone || '',
      message: message || '',
      paymentMethod: paymentMethod || 'upi',
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`donation:${id}`, donation);
    
    return c.json({ donation }, 201);
  } catch (error) {
    console.log(`Error recording donation: ${error}`);
    return c.json({ error: 'Failed to record donation' }, 500);
  }
});

// Get all donations (protected)
app.get("/make-server-5d248a0f/donations", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const donations = await kv.getByPrefix('donation:');
    const sortedDonations = donations.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ donations: sortedDonations });
  } catch (error) {
    console.log(`Error fetching donations: ${error}`);
    return c.json({ error: 'Failed to fetch donations' }, 500);
  }
});

// Get donation stats
app.get("/make-server-5d248a0f/donations/stats", async (c) => {
  try {
    const donations = await kv.getByPrefix('donation:');
    
    const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const monthly = donations.filter(d => {
      const donationDate = new Date(d.createdAt);
      const now = new Date();
      return donationDate.getMonth() === now.getMonth() && 
             donationDate.getFullYear() === now.getFullYear();
    }).reduce((sum, d) => sum + (d.amount || 0), 0);
    
    return c.json({ total, monthly, count: donations.length });
  } catch (error) {
    console.log(`Error fetching donation stats: ${error}`);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// =======================
// BLOG ROUTES
// =======================

// Get all blog posts
app.get("/make-server-5d248a0f/blogs", async (c) => {
  try {
    const blogs = await kv.getByPrefix('blog:');
    const publishedBlogs = blogs.filter(b => b.status === 'published');
    const sortedBlogs = publishedBlogs.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ blogs: sortedBlogs });
  } catch (error) {
    console.log(`Error fetching blogs: ${error}`);
    return c.json({ error: 'Failed to fetch blogs' }, 500);
  }
});

// Create blog (protected)
app.post("/make-server-5d248a0f/blogs", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const { title, content, coverImage, tags, slug, metaTitle, metaDescription, status } = await c.req.json();
    
    const id = crypto.randomUUID();
    const blog = {
      id,
      title,
      content,
      coverImage: coverImage || '',
      tags: tags || [],
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || '',
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    await kv.set(`blog:${id}`, blog);
    
    return c.json({ blog }, 201);
  } catch (error) {
    console.log(`Error creating blog: ${error}`);
    return c.json({ error: 'Failed to create blog' }, 500);
  }
});

// Update blog (protected)
app.put("/make-server-5d248a0f/blogs/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`blog:${id}`);
    if (!existing) {
      return c.json({ error: 'Blog not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`blog:${id}`, updated);
    
    return c.json({ blog: updated });
  } catch (error) {
    console.log(`Error updating blog: ${error}`);
    return c.json({ error: 'Failed to update blog' }, 500);
  }
});

// =======================
// CONTACT ROUTES
// =======================

// Submit contact message
app.post("/make-server-5d248a0f/contact", async (c) => {
  try {
    const { name, email, message } = await c.req.json();
    
    const id = crypto.randomUUID();
    const contact = {
      id,
      name,
      email,
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`contact:${id}`, contact);
    
    return c.json({ contact }, 201);
  } catch (error) {
    console.log(`Error submitting contact: ${error}`);
    return c.json({ error: 'Failed to submit message' }, 500);
  }
});

// Get all contact messages (protected)
app.get("/make-server-5d248a0f/contact", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const messages = await kv.getByPrefix('contact:');
    const sortedMessages = messages.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.log(`Error fetching messages: ${error}`);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Update contact message status (protected)
app.put("/make-server-5d248a0f/contact/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const existing = await kv.get(`contact:${id}`);
    if (!existing) {
      return c.json({ error: 'Message not found' }, 404);
    }
    
    const updated = { ...existing, status, updatedAt: new Date().toISOString() };
    await kv.set(`contact:${id}`, updated);
    
    return c.json({ message: updated });
  } catch (error) {
    console.log(`Error updating message: ${error}`);
    return c.json({ error: 'Failed to update message' }, 500);
  }
});

// =======================
// DASHBOARD STATS (PROTECTED)
// =======================

app.get("/make-server-5d248a0f/dashboard/stats", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const donations = await kv.getByPrefix('donation:');
    const volunteers = await kv.getByPrefix('volunteer:');
    const internshipApps = await kv.getByPrefix('internship-application:');
    const programs = await kv.getByPrefix('program:');
    const blogs = await kv.getByPrefix('blog:');
    
    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const monthlyDonations = donations.filter(d => {
      const donationDate = new Date(d.createdAt);
      const now = new Date();
      return donationDate.getMonth() === now.getMonth() && 
             donationDate.getFullYear() === now.getFullYear();
    }).reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const newVolunteers = volunteers.filter(v => v.status === 'pending').length;
    const newInternshipApps = internshipApps.filter(a => a.status === 'pending').length;
    const activePrograms = programs.length;
    const publishedBlogs = blogs.filter(b => b.status === 'published').length;
    
    return c.json({
      totalDonations,
      monthlyDonations,
      newVolunteers,
      newInternshipApps,
      activePrograms,
      publishedBlogs,
    });
  } catch (error) {
    console.log(`Error fetching dashboard stats: ${error}`);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Health check endpoint
app.get("/make-server-5d248a0f/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);