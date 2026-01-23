import { useEffect, useState } from "react";
import { useRouter, Link } from "@/app/components/router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { supabaseBlogs } from "@/utils/supabaseApi";
import { ArrowLeft } from "lucide-react";

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

export function BlogDetailsPage() {
  const { currentPath } = useRouter();
  const blogId = currentPath.split("/blog/")[1] || "";

  const [blog, setBlog] = useState<BlogRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [blogId]);

  async function load() {
    setLoading(true);
    try {
      const all = await supabaseBlogs.getPublished();
      const found = all.find((b: any) => b.id === blogId);
      setBlog(found || null);
    } catch (e) {
      console.error(e);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-gray-600">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-[#0F172A]">Blog not found</h1>
        <p className="text-gray-600 mt-2">This post may be removed or not published.</p>

        <Button asChild className="mt-6 rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]">
          <Link href="/blog">
            <ArrowLeft className="mr-2" size={16} />
            Back to Blogs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-14">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <Button asChild variant="outline" className="rounded-full mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Link>
        </Button>

        <Card className="neo-card overflow-hidden">
          {blog.cover_image && (
            <div className="aspect-video overflow-hidden bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8]">
              <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <CardContent className="p-7">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-gray-600">
                {new Date(blog.created_at).toLocaleDateString()}
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8]">
                {blog.category || "General"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mt-4">
              {blog.title}
            </h1>

            <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-line">
              {blog.content}
            </p>

            <div className="mt-10 bg-[#0B122E] text-white rounded-2xl p-6">
              <h3 className="text-xl font-extrabold">Support our mission ❤️</h3>
              <p className="text-blue-100 mt-2">
                Your donation helps us create lasting change in communities.
              </p>

              <Button asChild className="mt-4 rounded-full bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold">
                <Link href="/donate">Donate Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
