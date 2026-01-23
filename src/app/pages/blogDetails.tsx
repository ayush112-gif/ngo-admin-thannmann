import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "@/app/components/router";

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

function getQueryParam(key: string) {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

export function BlogDetailsPage() {
  const { navigate } = useRouter();
  const [blog, setBlog] = useState<BlogRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const id = getQueryParam("id");
      if (!id) {
        setBlog(null);
        return;
      }

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();

      if (error) throw error;
      setBlog(data as any);
    } catch (e) {
      console.error(e);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-[#F8FAFC] py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <Button variant="outline" className="rounded-full mb-6" onClick={() => navigate("/blog")}>
          ← Back
        </Button>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : !blog ? (
          <Card className="border-2">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold">Blog not found ❌</h2>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 overflow-hidden rounded-2xl">
            <div className="aspect-video bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] overflow-hidden">
              {blog.cover_image ? (
                <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-semibold opacity-80">
                  No Cover
                </div>
              )}
            </div>

            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-[#FBBF24] text-[#0F172A]">{blog.category}</Badge>
                <span className="text-sm text-gray-500">{new Date(blog.created_at).toLocaleString()}</span>
              </div>

              <h1 className="text-4xl font-bold text-[#0F172A] mb-4">{blog.title}</h1>

              {blog.meta_description && (
                <p className="text-lg text-gray-700 mb-6">{blog.meta_description}</p>
              )}

              <div className="text-gray-800 whitespace-pre-line leading-relaxed">{blog.content}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
