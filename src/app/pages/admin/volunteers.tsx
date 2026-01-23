import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";

import { supaVolunteers } from "@/utils/supabaseApi";

import {
  Users,
  RefreshCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  interest: string | null;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
};

export default function AdminVolunteers() {
  const [items, setItems] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await supaVolunteers.getAll();
      setItems((data || []) as VolunteerRow[]);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((v) => {
      const text =
        `${v.name} ${v.email} ${v.phone || ""} ${v.city || ""} ${v.interest || ""} ${v.status || ""}`.toLowerCase();

      // ✅ replaceAll avoid
      return text.split(" ").join("").includes(query.split(" ").join(""));
    });
  }, [items, q]);

  async function setStatus(id: string, status: "Pending" | "Approved" | "Rejected") {
    try {
      await supaVolunteers.updateStatus(id, status);
      toast.success(`✅ Status updated: ${status}`);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this volunteer application?")) return;
    try {
      await supaVolunteers.remove(id);
      toast.success("✅ Application deleted");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete application");
    }
  }

  function statusBadge(status: VolunteerRow["status"]) {
    if (status === "Approved") return <Badge className="bg-green-600">Approved</Badge>;
    if (status === "Rejected") return <Badge className="bg-red-600">Rejected</Badge>;
    return <Badge className="bg-orange-500">Pending</Badge>;
  }

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Users size={16} />
            Admin / Volunteers
          </div>

          <h1
            className="text-3xl font-extrabold text-[#0F172A]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Volunteers Manager
          </h1>

          <p className="text-gray-600 mt-1">
            Approve or reject volunteer applications and manage responses.
          </p>
        </div>

        <Button onClick={load} variant="outline" className="rounded-full">
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative max-w-xl">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="rounded-xl pl-9"
            placeholder="Search volunteer (name/email/city/status)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="border-2 rounded-2xl">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Total Applications</div>
            <div className="text-3xl font-extrabold text-[#0F172A] mt-1">{items.length}</div>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-3xl font-extrabold text-[#0F172A] mt-1">
              {items.filter((x) => x.status === "Approved").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-3xl font-extrabold text-[#0F172A] mt-1">
              {items.filter((x) => x.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="border-2 rounded-2xl bg-white mt-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Applications ({filtered.length})
          </h2>

          {loading ? (
            <p className="text-gray-600 mt-4">Loading applications...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600 mt-4">No volunteer applications found.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {filtered.map((v) => (
                <div
                  key={v.id}
                  className="p-5 border rounded-2xl bg-[#F8FAFC] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-[#0F172A] truncate">
                          {v.name}
                        </h3>
                        {statusBadge(v.status)}
                      </div>

                      <div className="mt-3 grid gap-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-500" />
                          <span className="break-all">{v.email}</span>
                        </div>

                        {v.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-500" />
                            <span>{v.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          <span>
                            {v.city || "-"} {v.interest ? `• ${v.interest}` : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock3 size={14} />
                          {new Date(v.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-400 mt-2 break-all">
                        ID: {v.id}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setStatus(v.id, "Approved")}
                        className="rounded-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Approve
                      </Button>

                      <Button
                        onClick={() => setStatus(v.id, "Rejected")}
                        className="rounded-full bg-red-600 hover:bg-red-700"
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </Button>

                      <Button
                        onClick={() => setStatus(v.id, "Pending")}
                        variant="outline"
                        className="rounded-full"
                      >
                        <Clock3 size={16} className="mr-2" />
                        Pending
                      </Button>

                      <Button
                        onClick={() => remove(v.id)}
                        variant="outline"
                        className="rounded-full border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
