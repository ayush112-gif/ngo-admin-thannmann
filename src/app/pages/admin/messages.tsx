import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";
import { supabaseContact } from "@/utils/supabaseApi";
import {
  Mail,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock3,
  Sparkles,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";

type MsgStatus = "new" | "in_progress" | "resolved";

type ContactMsg = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MsgStatus;
  created_at: string;
};

function statusBadge(status: MsgStatus) {
  if (status === "new") return <Badge className="bg-blue-600 text-white">NEW</Badge>;
  if (status === "in_progress")
    return <Badge className="bg-amber-500 text-white">IN PROGRESS</Badge>;
  return <Badge className="bg-green-600 text-white">RESOLVED</Badge>;
}

export default function AdminMessages() {
  const [items, setItems] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | MsgStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await supabaseContact.getAll();
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const newCount = items.filter((x) => x.status === "new").length;
    const inProgress = items.filter((x) => x.status === "in_progress").length;
    const resolved = items.filter((x) => x.status === "resolved").length;
    return { total, newCount, inProgress, resolved };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((m) => {
      const okFilter = filter === "all" ? true : m.status === filter;
      const okSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);

      return okFilter && okSearch;
    });
  }, [items, query, filter]);

  const selected = useMemo(() => {
    return items.find((x) => x.id === selectedId) || null;
  }, [items, selectedId]);

  async function setStatus(id: string, status: MsgStatus) {
    try {
      await supabaseContact.markRead(id);
        await supabaseContact.updateStatus(id, status);
      toast.success("Updated status ✅");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await supabaseContact.remove(id);
      toast.success("Deleted ✅");
      if (selectedId === id) setSelectedId(null);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete");
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied ✅");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A]">
            Messages Inbox
          </h1>
          <p className="text-gray-600 mt-1">
            Manage contact form messages like a real support dashboard.
          </p>
        </div>

        <Button onClick={load} variant="outline" className="rounded-full">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border-2">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles size={16} className="text-blue-600" />
              New
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{stats.newCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock3 size={16} className="text-amber-500" />
              In Progress
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 size={16} className="text-green-600" />
              Resolved
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <Card className="rounded-2xl border-2 mb-6">
        <CardContent className="p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2 w-full md:max-w-md">
            <Search size={18} className="text-gray-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, message..."
              className="rounded-xl"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filter === "new" ? "default" : "outline"}
              onClick={() => setFilter("new")}
              className="rounded-full"
            >
              New
            </Button>
            <Button
              variant={filter === "in_progress" ? "default" : "outline"}
              onClick={() => setFilter("in_progress")}
              className="rounded-full"
            >
              In Progress
            </Button>
            <Button
              variant={filter === "resolved" ? "default" : "outline"}
              onClick={() => setFilter("resolved")}
              className="rounded-full"
            >
              Resolved
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* List */}
        <Card className="rounded-2xl border-2">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b">
              <div className="flex items-center gap-2 text-[#0F172A] font-bold">
                <Mail size={18} />
                Inbox ({filtered.length})
              </div>
            </div>

            {loading ? (
              <div className="p-5 text-gray-600">Loading messages...</div>
            ) : filtered.length === 0 ? (
              <div className="p-5 text-gray-600">No messages found.</div>
            ) : (
              <div className="divide-y">
                {filtered.map((m) => {
                  const active = m.id === selectedId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className={`w-full text-left px-5 py-4 hover:bg-[#F1F5F9] transition ${
                        active ? "bg-[#E0F2FE]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-[#0F172A]">{m.name}</div>
                          <div className="text-sm text-gray-600">{m.email}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {statusBadge(m.status)}
                          <div className="text-xs text-gray-500">
                            {new Date(m.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {m.message}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Panel */}
        <Card className="rounded-2xl border-2">
          <CardContent className="p-5">
            {!selected ? (
              <div className="text-gray-600">
                Select a message from the inbox to view details.
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0F172A]">
                      {selected.name}
                    </h2>
                    <p className="text-gray-600">{selected.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Received: {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {statusBadge(selected.status)}
                    <Button
                      onClick={() => copyText(selected.email)}
                      variant="outline"
                      className="rounded-full"
                    >
                      <Copy size={16} className="mr-2" />
                      Copy Email
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl border bg-white">
                  <div className="font-bold text-[#0F172A] mb-2">Message</div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    onClick={() => setStatus(selected.id, "new")}
                    variant="outline"
                    className="rounded-full"
                  >
                    Mark New
                  </Button>

                  <Button
                    onClick={() => setStatus(selected.id, "in_progress")}
                    className="rounded-full bg-amber-500 hover:bg-amber-600"
                  >
                    In Progress
                  </Button>

                  <Button
                    onClick={() => setStatus(selected.id, "resolved")}
                    className="rounded-full bg-green-600 hover:bg-green-700"
                  >
                    Resolve
                  </Button>

                  <Button
                    onClick={() => window.open(`mailto:${selected.email}`, "_blank")}
                    variant="outline"
                    className="rounded-full"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Reply Email
                  </Button>

                  <Button
                    onClick={() => remove(selected.id)}
                    variant="outline"
                    className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
