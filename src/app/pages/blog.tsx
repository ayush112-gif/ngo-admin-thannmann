import { useEffect, useState } from "react";
import { Link } from "@/app/components/router";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { supabaseBlogs } from "@/utils/supabaseApi";
import { ArrowRight } from "lucide-react";

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

export function BlogPage() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await supabaseBlogs.getPublished();
      setBlogs(data || []);
    } catch (e) {
      console.error(e);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#050B1F] text-white py-16">
        <div className="absolute inset-0 soft-glow opacity-85" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-5xl font-extrabold">Blog & Updates</h1>
          <p className="text-blue-100 mt-3 max-w-2xl mx-auto">
            Stories, announcements, and updates from our community work.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-16">

        {loading ? (
          <p className="text-gray-600 text-center">Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="text-gray-600 text-center">No published blogs found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <Card key={b.id} className="neo-card hover-3d overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] overflow-hidden">
                  {b.cover_image ? (
                    <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold opacity-80">
                      Blog Post
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge className="bg-[#1D4ED8]/10 text-[#1D4ED8]">
                      {b.category || "General"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#0F172A] mt-3 line-clamp-2">
                    {b.title}
                  </h3>

                  <p className="text-gray-600 mt-2 line-clamp-3">
                    {b.meta_description || b.content?.substring(0, 140)}
                  </p>

                  <Button
                    asChild
                    variant="ghost"
                    className="text-[#1D4ED8] hover:text-[#1e40af] p-0 h-auto mt-4 font-semibold"
                  >
                    <Link href={`/blog/${b.id}`} className="flex items-center gap-2">
                      Read More <ArrowRight size={16} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
