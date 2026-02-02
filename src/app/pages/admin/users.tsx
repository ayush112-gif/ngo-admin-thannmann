import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";

import {
  Shield,
  RefreshCcw,
  Trash2,
  PlusCircle,
  UserCog,
  LayoutDashboard,
  Megaphone,
  FileText,
  Heart,
  Briefcase,
  Users,
  DollarSign,
  MessageSquare,
} from "lucide-react";

import { useRouter } from "@/app/components/router";

type Role = "super_admin" | "editor" | "manager" | "none";

type Row = {
  id: string;
  email: string;
  created_at: string;
  role: Role;
};

const API_BASE = "http://localhost:5050";

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", route: "/admin/dashboard" },
  { id: "announcements", icon: Megaphone, label: "Announcements", route: "/admin/announcements" },
  { id: "blogs", icon: FileText, label: "Blogs", route: "/admin/blogs" },
  { id: "programs", icon: Heart, label: "Programs", route: "/admin/programs" },
  { id: "internships", icon: Briefcase, label: "Internships", route: "/admin/internships" },
  { id: "volunteers", icon: Users, label: "Volunteers", route: "/admin/volunteers" },
  { id: "donations", icon: DollarSign, label: "Donations", route: "/admin/donations" },
  { id: "messages", icon: MessageSquare, label: "Messages", route: "/admin/messages" },
  { id: "users", icon: UserCog, label: "Users & Roles", route: "/admin/users" },
];

export default function AdminUsers() {
  const { navigate } = useRouter();

  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "editor" | "manager">("editor");

  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      const json = await res.json();

      if (!json.ok) throw new Error(json.error || "Failed to load users");
      setItems(json.users || []);
    } catch (e: any) {
      toast.error(e.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser() {
    if (!email.trim() || !password.trim()) {
      toast.error("Email + Password required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to create user");

      toast.success("✅ User created");
      setEmail("");
      setPassword("");
      setRole("editor");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Error creating user");
    }
  }

  async function updateRole(user_id: string, newRole: Role) {
    try {
      const res = await fetch(`${API_BASE}/admin/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, role: newRole }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to update role");

      toast.success("Role updated");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Error updating role");
    }
  }

  async function deleteUser(user_id: string) {
    if (!confirm("Delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/delete-user/${user_id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete user");

      toast.success("User deleted");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Error deleting user");
    }
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (x) =>
        x.email.toLowerCase().includes(query) ||
        x.role.toLowerCase().includes(query)
    );
  }, [items, q]);

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          NGO Admin
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === "users";

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

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Shield size={16} />
              Admin / Users
            </div>

            <h1 className="text-3xl font-extrabold text-[#0F172A]">
              Users & Roles Manager
            </h1>
          </div>

          <Button onClick={load} variant="outline" className="rounded-full">
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Create User */}
        <Card className="border-2 rounded-2xl mt-6 bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserCog size={18} /> Create Admin User
            </h2>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="editor">editor</option>
                <option value="manager">manager</option>
                <option value="super_admin">super_admin</option>
              </select>
            </div>

            <Button onClick={createUser} className="mt-5 rounded-full bg-blue-600">
              <PlusCircle size={16} className="mr-2" />
              Create User
            </Button>
          </CardContent>
        </Card>

        {/* Search */}
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users..."
          className="mt-6 rounded-xl"
        />

        {/* List */}
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {filtered.map((u) => (
            <Card key={u.id} className="border-2 rounded-2xl bg-white">
              <CardContent className="p-6">
                <div className="font-bold truncate">{u.email}</div>
                <Badge className="mt-2">Role: {u.role}</Badge>

                <div className="mt-4 flex gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value as Role)}
                    className="px-3 py-2 border rounded-xl"
                  >
                    <option value="editor">editor</option>
                    <option value="manager">manager</option>
                    <option value="super_admin">super_admin</option>
                    <option value="none">none</option>
                  </select>

                  <Button
                    onClick={() => deleteUser(u.id)}
                    variant="outline"
                    className="border-red-500 text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </main>
    </div>
  );
}
