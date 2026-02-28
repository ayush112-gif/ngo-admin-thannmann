import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";

import { useRouter } from "@/app/components/router";

import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Heart,
  Briefcase,
  Users,
  DollarSign,
  MessageSquare,
  RefreshCcw,
  Search,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { supaVolunteers } from "@/utils/supabaseApi";

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

const API = import.meta.env.VITE_API_URL;

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", route: "/admin/dashboard" },
  { id: "announcements", icon: Megaphone, label: "Announcements", route: "/admin/announcements" },
  { id: "blogs", icon: FileText, label: "Blogs", route: "/admin/blogs" },
  { id: "programs", icon: Heart, label: "Programs", route: "/admin/programs" },
  { id: "internships", icon: Briefcase, label: "Internships", route: "/admin/internships" },
  { id: "volunteers", icon: Users, label: "Volunteers", route: "/admin/volunteers" },
  { id: "donations", icon: DollarSign, label: "Donations", route: "/admin/donations" },
  { id: "messages", icon: MessageSquare, label: "Messages", route: "/admin/messages" },
];

export default function AdminVolunteers() {
  const { navigate } = useRouter();

  const [items, setItems] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await supaVolunteers.getAll();
      setItems((data || []) as VolunteerRow[]);
    } catch (e: any) {
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

    return items.filter((v) =>
      `${v.name} ${v.email} ${v.city || ""} ${v.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [items, q]);

  async function setStatus(id: string, status: VolunteerRow["status"]) {
    try {
      const volunteer = items.find((v) => v.id === id);
      if (!volunteer) return;

      await supaVolunteers.updateStatus(id, status);

      // send status email via backend
      await fetch(`${API}/admin/volunteer-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: volunteer.email,
          name: volunteer.name,
          status,
        }),
      });

      toast.success("Status updated + email sent");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this volunteer application?")) return;
    try {
      await supaVolunteers.remove(id);
      toast.success("Application deleted");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    }
  }

  function statusBadge(status: VolunteerRow["status"]) {
    if (status === "Approved") return <Badge className="bg-green-600">Approved</Badge>;
    if (status === "Rejected") return <Badge className="bg-red-600">Rejected</Badge>;
    return <Badge className="bg-orange-500">Pending</Badge>;
  }

  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          NGO Admin
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === "volunteers";

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 bg-[#F8FAFC] overflow-auto">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">Volunteers Manager</h1>
          <Button onClick={load} variant="outline" className="rounded-full">
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        <div className="mt-6 max-w-xl relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="pl-9 rounded-xl"
            placeholder="Search volunteers..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Card className="mt-6 rounded-2xl border-2">
          <CardContent className="p-6">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((v) => (
                  <div key={v.id} className="p-5 border rounded-2xl bg-white">

                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold">{v.name}</h3>
                        {statusBadge(v.status)}

                        <div className="text-sm mt-2 space-y-1">
                          <div className="flex gap-2"><Mail size={14} /> {v.email}</div>
                          {v.phone && <div className="flex gap-2"><Phone size={14} /> {v.phone}</div>}
                          <div className="flex gap-2"><MapPin size={14} /> {v.city}</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button onClick={() => setStatus(v.id, "Approved")} className="bg-green-600">
                          Approve
                        </Button>
                        <Button onClick={() => setStatus(v.id, "Rejected")} className="bg-red-600">
                          Reject
                        </Button>
                        <Button onClick={() => remove(v.id)} variant="outline">
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

      </main>
    </div>
  );
}