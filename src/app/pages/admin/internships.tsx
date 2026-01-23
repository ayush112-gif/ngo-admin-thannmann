import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";

import {
  Briefcase,
  MapPin,
  Clock,
  Globe2,
  Link as LinkIcon,
  Search,
  RefreshCcw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type InternshipRow = {
  id: string;
  title: string;
  location: string;
  duration: string;
  type: string;
  description: string;
  apply_link: string | null;
  status: "draft" | "published";
  created_at: string;
};

function StatusPill({ status }: { status: InternshipRow["status"] }) {
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

export default function AdminInternships() {
  const [items, setItems] = useState<InternshipRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  // Form
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Remote");
  const [duration, setDuration] = useState("1 Month");
  const [type, setType] = useState("Remote");
  const [applyLink, setApplyLink] = useState("");
  const [description, setDescription] = useState("");

  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("internships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as any) || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load internships");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createInternship() {
    if (!title.trim() || !description.trim()) {
      toast.error("Title & Description required");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("internships").insert([
        {
          title: title.trim(),
          location: location.trim(),
          duration: duration.trim(),
          type: type.trim(),
          description: description.trim(),
          apply_link: applyLink.trim() || null,
          status: "draft",
        },
      ]);

      if (error) throw error;

      toast.success("✅ Internship created (Draft)");
      setTitle("");
      setLocation("Remote");
      setDuration("1 Month");
      setType("Remote");
      setApplyLink("");
      setDescription("");

      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create internship");
    } finally {
      setCreating(false);
    }
  }

  async function togglePublish(i: InternshipRow) {
    try {
      const nextStatus = i.status === "published" ? "draft" : "published";

      const { error } = await supabase
        .from("internships")
        .update({ status: nextStatus })
        .eq("id", i.id);

      if (error) throw error;

      toast.success(nextStatus === "published" ? "✅ Published" : "Moved to Draft");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this internship?")) return;

    try {
      const { error } = await supabase.from("internships").delete().eq("id", id);
      if (error) throw error;

      toast.success("✅ Internship deleted");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete internship");
    }
  }

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((x) => x.status === "published").length;
    const draft = items.filter((x) => x.status === "draft").length;
    return { total, published, draft };
  }, [items]);

  // Filtered items
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
          x.location.toLowerCase().includes(query) ||
          x.type.toLowerCase().includes(query) ||
          x.duration.toLowerCase().includes(query)
        );
      });
  }, [items, q, filterStatus]);

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Briefcase size={16} />
            Admin / Internships
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Internship Management
          </h1>
          <p className="text-gray-600 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Create, publish and manage internships for your NGO website.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={load}
            variant="outline"
            className="rounded-full"
          >
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>

          <Button
            onClick={() => {
              const el = document.getElementById("create-internship-form");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
          >
            <PlusCircle size={16} className="mr-2" />
            New Internship
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Card className="border-2 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Total Posts</div>
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
                placeholder="Search internships by title / location / type..."
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
      <Card id="create-internship-form" className="border-2 rounded-2xl mt-6 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Create New Internship</h2>
              <p className="text-sm text-gray-600 mt-1">
                New internship will be created as <b>Draft</b>.
              </p>
            </div>

            <Badge className="bg-orange-500 text-white px-3 py-1 rounded-full">Draft by default</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-5">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="UI/UX Internship" className="rounded-xl" />
            </div>

            <div>
              <Label>Type</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Remote / On-site / Hybrid" className="rounded-xl" />
            </div>

            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / Lucknow" className="rounded-xl" />
            </div>

            <div>
              <Label>Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1 Month / 3 Months" className="rounded-xl" />
            </div>

            <div className="md:col-span-2">
              <Label>Apply Link (Optional)</Label>
              <Input
                value={applyLink}
                onChange={(e) => setApplyLink(e.target.value)}
                placeholder="https://forms.gle/..."
                className="rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description *</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write internship details..."
                className="w-full min-h-[140px] p-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
              />
            </div>
          </div>

          <div className="mt-5">
            <Button
              onClick={createInternship}
              disabled={creating}
              className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
            >
              <PlusCircle size={16} className="mr-2" />
              {creating ? "Creating..." : "Create Draft Internship"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-[#0F172A]">
            Internship Posts <span className="text-gray-500 text-sm">({filtered.length})</span>
          </h2>
        </div>

        {loading ? (
          <p className="text-gray-600 mt-4">Loading internships...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600 mt-4">No internships found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {filtered.map((i) => (
              <Card key={i.id} className="border-2 rounded-2xl bg-white hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-[#0F172A] truncate">{i.title}</h3>
                        <StatusPill status={i.status} />
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Globe2 size={16} className="text-gray-400" />
                          <span className="font-medium">{i.type}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span>{i.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span>{i.duration}</span>
                        </div>

                        {i.apply_link && (
                          <div className="flex items-center gap-2">
                            <LinkIcon size={16} className="text-gray-400" />
                            <a href={i.apply_link} target="_blank" className="text-[#1D4ED8] hover:underline truncate">
                              {i.apply_link}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => togglePublish(i)}
                        className={
                          i.status === "published"
                            ? "rounded-full bg-orange-500 hover:bg-orange-600"
                            : "rounded-full bg-green-600 hover:bg-green-700"
                        }
                      >
                        {i.status === "published" ? "Unpublish" : "Publish"}
                      </Button>

                      <Button
                        onClick={() => remove(i.id)}
                        variant="outline"
                        className="rounded-full border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600 whitespace-pre-line">
                    {i.description.length > 220 ? i.description.substring(0, 220) + "..." : i.description}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Created: {new Date(i.created_at).toLocaleString()}
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
