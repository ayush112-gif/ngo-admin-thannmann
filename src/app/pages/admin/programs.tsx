import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";

import {
  Heart,
  Search,
  RefreshCcw,
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type ProgramRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  status: "draft" | "published";
  created_at: string;
};

function StatusPill({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-600 text-white">
      <CheckCircle2 size={14} />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-orange-500 text-white">
      <XCircle size={14} />
      Draft
    </span>
  );
}

export default function AdminPrograms() {
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  // form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Education");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as any) || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProgram() {
    if (!title.trim() || !description.trim()) {
      toast.error("Title & Description required");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("programs").insert([
        {
          title: title.trim(),
          category: category.trim() || "General",
          description: description.trim(),
          image_url: imageUrl.trim() || null,
          status: "draft",
        },
      ]);

      if (error) throw error;

      toast.success("✅ Program created (Draft)");
      setTitle("");
      setCategory("Education");
      setDescription("");
      setImageUrl("");

      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create program");
    } finally {
      setCreating(false);
    }
  }

  async function togglePublish(p: ProgramRow) {
    try {
      const nextStatus = p.status === "published" ? "draft" : "published";

      const { error } = await supabase
        .from("programs")
        .update({ status: nextStatus })
        .eq("id", p.id);

      if (error) throw error;

      toast.success(nextStatus === "published" ? "✅ Published" : "Moved to Draft");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this program?")) return;

    try {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;

      toast.success("✅ Program deleted");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete program");
    }
  }

  // stats
  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((x) => x.status === "published").length;
    const draft = items.filter((x) => x.status === "draft").length;
    return { total, published, draft };
  }, [items]);

  // filtered
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter((x) => {
        if (filterStatus === "all") return true;
        return x.status === filterStatus;
      })
      .filter((x) => {
        if (!query) return true;
        return (
          x.title.toLowerCase().includes(query) ||
          x.description.toLowerCase().includes(query) ||
          x.category.toLowerCase().includes(query)
        );
      });
  }, [items, q, filterStatus]);

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Heart size={16} />
            Admin / Programs
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Programs Management
          </h1>
          <p className="text-gray-600 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Create and publish programs that appear on your NGO website.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button onClick={load} variant="outline" className="rounded-full">
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>

          <Button
            onClick={() => {
              const el = document.getElementById("create-program-form");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
          >
            <PlusCircle size={16} className="mr-2" />
            New Program
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Card className="border-2 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-3xl font-extrabold text-[#0F172A] mt-1">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Published</div>
            <div className="text-3xl font-extrabold text-green-600 mt-1">{stats.published}</div>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Draft</div>
            <div className="text-3xl font-extrabold text-orange-500 mt-1">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 rounded-2xl mt-6 bg-white">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title / category / description..."
                className="pl-10 rounded-xl"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                className={`rounded-full ${filterStatus === "all" ? "bg-[#1D4ED8] hover:bg-[#1e40af]" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>

              <Button
                variant={filterStatus === "published" ? "default" : "outline"}
                className={`rounded-full ${filterStatus === "published" ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => setFilterStatus("published")}
              >
                Published
              </Button>

              <Button
                variant={filterStatus === "draft" ? "default" : "outline"}
                className={`rounded-full ${filterStatus === "draft" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                onClick={() => setFilterStatus("draft")}
              >
                Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      <Card id="create-program-form" className="border-2 rounded-2xl mt-6 bg-white">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-[#0F172A]">Create New Program</h2>
          <p className="text-sm text-gray-600 mt-1">New program will be created as Draft.</p>

          <div className="grid md:grid-cols-2 gap-4 mt-5">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Education Support Program" className="rounded-xl" />
            </div>

            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Education / Health..." className="rounded-xl" />
            </div>

            <div className="md:col-span-2">
              <Label>Description *</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write program description..."
                className="w-full min-h-[140px] p-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Image URL (Optional)</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                <ImageIcon size={14} />
                Tip: Add a cover image to make program cards attractive on website.
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Button
              onClick={createProgram}
              disabled={creating}
              className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
            >
              <PlusCircle size={16} className="mr-2" />
              {creating ? "Creating..." : "Create Draft Program"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#0F172A]">
          All Programs <span className="text-gray-500 text-sm">({filtered.length})</span>
        </h2>

        {loading ? (
          <p className="text-gray-600 mt-4">Loading programs...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600 mt-4">No programs found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {filtered.map((p) => (
              <Card key={p.id} className="border-2 rounded-2xl bg-white hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-[#0F172A] truncate">{p.title}</h3>
                        <StatusPill status={p.status} />
                        <Badge className="bg-[#FBBF24] text-[#0F172A]">{p.category}</Badge>
                      </div>

                      <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                        {p.description.length > 220 ? p.description.substring(0, 220) + "..." : p.description}
                      </p>

                      <div className="mt-4 text-xs text-gray-500">
                        Created: {new Date(p.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => togglePublish(p)}
                        className={
                          p.status === "published"
                            ? "rounded-full bg-orange-500 hover:bg-orange-600"
                            : "rounded-full bg-green-600 hover:bg-green-700"
                        }
                      >
                        {p.status === "published" ? "Unpublish" : "Publish"}
                      </Button>

                      <Button
                        onClick={() => remove(p.id)}
                        variant="outline"
                        className="rounded-full border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {p.image_url && (
                    <div className="mt-4 text-xs text-gray-500">
                      Image:{" "}
                      <a href={p.image_url} target="_blank" className="text-[#1D4ED8] hover:underline">
                        Open
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
