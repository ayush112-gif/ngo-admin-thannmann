import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { supabasePrograms } from "@/utils/supabaseApi";
import { Heart, Search, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/app/components/router";

type ProgramRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: "draft" | "published";
  created_at: string;
};

export function ProgramsPage() {
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", "Education", "Health", "Environment", "Women Empowerment", "Skill Development", "Community Welfare"],
    []
  );

  async function load() {
    setLoading(true);
    try {
      const data = await supabasePrograms.getPublished();
      setItems(data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchesQuery =
        !query ||
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query);

      const matchesCategory = category === "All" || (p.category || "").toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesCategory;
    });
  }, [items, q, category]);

  const featured = items.slice(0, 3);

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#050B1F] text-white py-16">
        <div className="absolute inset-0 soft-glow opacity-85" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5">
              <Sparkles size={16} />
              <span className="text-sm text-blue-100">Programs that create measurable impact</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold">
              Our <span className="text-[#38BDF8]">Programs</span>
            </h1>

            <p className="text-blue-100 mt-4 text-lg">
              Explore education, healthcare, environment and skill-building initiatives that uplift communities.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-full bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold">
                <Link href="/donate">Support a Program</Link>
              </Button>

              <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15">
                <Link href="/volunteer">Join as Volunteer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-3xl font-extrabold text-[#0F172A]">Featured Programs</h2>
              <p className="text-gray-600 mt-2">Highlighted initiatives currently running.</p>
            </div>

            <Button onClick={load} variant="outline" className="rounded-full">
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="mt-6 text-gray-600">Loading programs...</p>
          ) : featured.length === 0 ? (
            <p className="mt-6 text-gray-600">No programs published yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {featured.map((p) => (
                <Card key={p.id} className="neo-card hover-3d overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold opacity-80">
                        Program
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <Badge className="bg-[#FBBF24] text-[#0F172A]">{p.category}</Badge>
                    <h3 className="text-xl font-extrabold text-[#0F172A] mt-3 line-clamp-2">{p.title}</h3>
                    <p className="text-gray-600 mt-2 line-clamp-2">{p.description}</p>

                    <Button asChild className="mt-4 rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]">
                      <Link href="/donate" className="flex items-center gap-2">
                        Donate Now <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-3xl font-extrabold text-[#0F172A]">Browse All Programs</h2>
              <p className="text-gray-600 mt-2">Search and filter programs easily.</p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="neo-card p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Search size={16} />
                Search
              </div>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, category, description..."
                className="mt-2"
              />
            </div>

            <div className="neo-card p-4 md:col-span-2">
              <div className="text-gray-500 text-sm">Filter by category</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((c) => (
                  <Button
                    key={c}
                    onClick={() => setCategory(c)}
                    variant={category === c ? "default" : "outline"}
                    className={`rounded-full ${
                      category === c ? "bg-[#1D4ED8] hover:bg-[#1e40af]" : "bg-white"
                    }`}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Card key={p.id} className="neo-card hover-3d">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#1D4ED8]/10 text-[#1D4ED8]">{p.category}</Badge>
                    <Heart className="text-[#1D4ED8]" size={18} />
                  </div>

                  <h3 className="text-xl font-extrabold text-[#0F172A] mt-3">{p.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-3">{p.description}</p>

                  <div className="mt-4 flex gap-3">
                    <Button asChild className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af] flex-1">
                      <Link href="/donate">Support</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full flex-1">
                      <Link href="/contact">Contact</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <p className="text-center text-gray-600 mt-10">No programs found for this filter/search.</p>
          )}
        </div>
      </section>
    </div>
  );
}
