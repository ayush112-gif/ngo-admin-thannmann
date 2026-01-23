import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supaBlogs } from "@/utils/supabaseApi";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";

type BlogRow = {
  id: string;
  title: string;
  category: string;
  content: string;
  cover_image: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  created_at: string;
};

export default function AdminBlogs() {
  const [items, setItems] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [coverImage, setCoverImage] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");

  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await supaBlogs.getAll();
      setItems((data as any) || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createBlog() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are required");
      return;
    }

    setCreating(true);
    try {
      await supaBlogs.create({
        title: title.trim(),
        category: category.trim() || "General",
        content: content.trim(),

        // ✅ FIXED KEYS for Supabase
        cover_image: coverImage.trim() || undefined,
        meta_description: metaDescription.trim() || undefined,
      });

      toast.success("✅ Blog created (Draft)");

      setTitle("");
      setCategory("General");
      setCoverImage("");
      setMetaDescription("");
      setContent("");

      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create blog");
    } finally {
      setCreating(false);
    }
  }

  async function togglePublish(blog: BlogRow) {
    try {
      if (blog.status === "published") {
        await supaBlogs.unpublish(blog.id);
        toast.success("Blog moved to Draft ✅");
      } else {
        await supaBlogs.publish(blog.id);
        toast.success("Blog Published ✅");
      }
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this blog post?")) return;

    try {
      await supaBlogs.remove(id);
      toast.success("Blog deleted ✅");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete blog");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin — Blogs</h1>

        <Button onClick={load} variant="outline" className="rounded-full">
          Refresh
        </Button>
      </div>

      {/* ✅ CREATE BLOG */}
      <Card className="mt-5 border-2 rounded-2xl">
        <CardContent className="p-6">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Create Blog (Draft)</h2>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="General / Events / Education"
              />
            </div>

            <div>
              <Label>Cover Image URL (Optional)</Label>
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label>Meta Description (Optional)</Label>
              <Input
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Short description for preview..."
              />
            </div>

            <div>
              <Label>Content *</Label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write full blog content..."
                style={{
                  width: "100%",
                  minHeight: 140,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  outline: "none",
                }}
              />
            </div>

            <Button
              onClick={createBlog}
              disabled={creating}
              className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
            >
              {creating ? "Creating..." : "Create Draft Blog"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ LIST BLOGS */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>All Blogs</h2>

        {loading ? (
          <p style={{ marginTop: 10 }}>Loading blogs...</p>
        ) : items.length === 0 ? (
          <p style={{ marginTop: 10 }}>No blogs found.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((b) => (
              <Card key={b.id} className="border-2 rounded-2xl">
                <CardContent className="p-6">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <h3 style={{ fontWeight: 800, fontSize: 18 }}>{b.title}</h3>

                        <Badge className={b.status === "published" ? "bg-green-600" : "bg-orange-500"}>
                          {b.status === "published" ? "Published" : "Draft"}
                        </Badge>

                        <Badge className="bg-[#FBBF24] text-[#0F172A]">
                          {b.category || "General"}
                        </Badge>
                      </div>

                      <p style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                        {new Date(b.created_at).toLocaleString()}
                      </p>

                      {b.meta_description && (
                        <p style={{ marginTop: 10, color: "#374151" }}>
                          <b>Meta:</b> {b.meta_description}
                        </p>
                      )}

                      <p style={{ marginTop: 10, color: "#111827" }}>
                        {b.content.length > 180 ? b.content.substring(0, 180) + "..." : b.content}
                      </p>

                      {b.cover_image && (
                        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                          Cover: {b.cover_image}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                      <Button
                        onClick={() => togglePublish(b)}
                        className={
                          b.status === "published"
                            ? "rounded-full bg-orange-500 hover:bg-orange-600"
                            : "rounded-full bg-green-600 hover:bg-green-700"
                        }
                      >
                        {b.status === "published" ? "Unpublish" : "Publish"}
                      </Button>

                      <Button
                        onClick={() => remove(b.id)}
                        variant="outline"
                        className="rounded-full border-red-500 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
