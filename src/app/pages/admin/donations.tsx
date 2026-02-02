import { useEffect, useMemo, useState } from "react";
import { supaDonations } from "@/utils/supabaseApi";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  LayoutDashboard,
  Users,
  MessageSquare,
  DollarSign,
  UserCog,
  Megaphone,
  FileText,
  Heart,
  Briefcase,
} from "lucide-react";


import { useRouter } from "@/app/components/router";

type DonationRow = {
  id: string;
  name: string;
  email: string;
  amount: number;
  payment_method: string;
  created_at: string;
};

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea"];

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

export default function AdminDonations() {
  const { navigate } = useRouter();

  const [items, setItems] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const data = await supaDonations.getAll();
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter((d) =>
      [d.name, d.email].join(" ").toLowerCase().includes(s)
    );
  }, [items, q]);

  const donorMap = useMemo(() => {
    const map: Record<string, any> = {};

    filtered.forEach((d) => {
      if (!map[d.email]) {
        map[d.email] = {
          name: d.name,
          email: d.email,
          totalAmount: 0,
          count: 0,
        };
      }

      map[d.email].totalAmount += d.amount;
      map[d.email].count += 1;
    });

    return Object.values(map);
  }, [filtered]);

  const leaderboard = [...donorMap]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  const total = filtered.reduce((s, d) => s + d.amount, 0);

  const monthly = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((d) => {
      const m = new Date(d.created_at).toLocaleString("default", {
        month: "short",
      });
      map[m] = (map[m] || 0) + d.amount;
    });
    return Object.entries(map).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [filtered]);

  const methods = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((d) => {
      map[d.payment_method] = (map[d.payment_method] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 font-bold text-xl border-b border-slate-700">
          NGO Admin
        </div>

        <nav className="p-2 space-y-1">
          {menuItems.map((m) => {
            const Icon = m.icon;
            const active = m.id === "donations";

            return (
              <button
                key={m.id}
                onClick={() => navigate(m.route)}
                className={`w-full flex gap-3 px-4 py-3 rounded ${
                  active ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Icon size={18} /> {m.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 bg-[#F8FAFC] overflow-y-auto">

        <h1 className="text-3xl font-extrabold mb-6">
          Donor Intelligence Dashboard
        </h1>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search donor..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button onClick={load}>Refresh</Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <Card>
            <CardContent className="p-6">
              <p>Total Donations</p>
              <p className="text-3xl font-bold mt-2">
                ₹{total.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p>Unique Donors</p>
              <p className="text-3xl font-bold mt-2">{donorMap.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p>Total Transactions</p>
              <p className="text-3xl font-bold mt-2">{filtered.length}</p>
            </CardContent>
          </Card>

        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthly}>
                  <Line dataKey="amount" stroke="#2563eb" />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Payment Methods</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={methods} dataKey="value">
                    {methods.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Leaderboard */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Top Donors</h3>
            {leaderboard.map((d, i) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>#{i + 1} {d.name}</span>
                <span className="text-emerald-600 font-bold">
                  ₹{d.totalAmount.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Donor table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">All Donors</h3>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3">Donations</th>
                  <th className="p-3">Lifetime Amount</th>
                </tr>
              </thead>

              <tbody>
                {donorMap.map((d, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3">{d.name}</td>
                    <td className="p-3">{d.email}</td>
                    <td className="p-3 text-center">{d.count}</td>
                    <td className="p-3 font-bold text-emerald-600 text-center">
                      ₹{d.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </CardContent>
        </Card>

      </main>
    </div>
  );
}
