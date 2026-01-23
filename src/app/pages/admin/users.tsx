import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";

import { Shield, RefreshCcw, Trash2, PlusCircle, UserCog } from "lucide-react";

type Role = "super_admin" | "editor" | "manager" | "none";

type Row = {
  id: string;
  email: string;
  created_at: string;
  role: Role;
};

const API_BASE = "https://ngo-admin-thannmann.onrender.com";

export default function AdminUsers() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
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
      toast.error(e.message || "Error");
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

      toast.success("✅ User created + Role assigned");
      setEmail("");
      setPassword("");
      setRole("editor");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Error");
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

      toast.success("✅ Role Updated");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Error");
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

      toast.success("✅ User deleted");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Error");
    }
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (x) => x.email.toLowerCase().includes(query) || x.role.toLowerCase().includes(query)
    );
  }, [items, q]);

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Shield size={16} />
            Admin / Users
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Users & Roles Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Super Admin can create admin users, assign roles & delete accounts.
          </p>
        </div>

        <Button onClick={load} variant="outline" className="rounded-full">
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Create User */}
      <Card className="border-2 rounded-2xl mt-6 bg-white">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <UserCog size={18} /> Create New Admin User
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" />
            </div>

            <div>
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password" />
            </div>

            <div>
              <Label>Role</Label>
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
          </div>

          <div className="mt-5">
            <Button onClick={createUser} className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]">
              <PlusCircle size={16} className="mr-2" />
              Create User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mt-6">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email or role..."
          className="rounded-xl"
        />
      </div>

      {/* Users List */}
      <div className="mt-6">
        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((u) => (
              <Card key={u.id} className="border-2 rounded-2xl bg-white hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-extrabold text-[#0F172A] truncate">{u.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(u.created_at).toLocaleString()}
                      </div>

                      <div className="mt-3">
                        <Badge className="bg-[#FBBF24] text-[#0F172A]">Role: {u.role}</Badge>
                      </div>

                      <div className="text-xs text-gray-500 mt-3">ID: {u.id}</div>
                    </div>

                    <div className="flex flex-col gap-2">
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
                        className="rounded-full border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
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
