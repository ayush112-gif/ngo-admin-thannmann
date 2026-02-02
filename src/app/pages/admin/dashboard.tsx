import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/app/components/router";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

import { toast } from "sonner";

import { authAPI } from "@/utils/api";
import { getMyRole } from "@/utils/roleGuard";
import { supabaseDashboard } from "@/utils/supabaseApi";
import { subscribeDashboardRealtime } from "@/utils/supabaseDashboardRealtime";

import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  MessageSquare,
  LogOut,
  Megaphone,
  Heart,
  TrendingUp,
  RefreshCcw,
  Moon,
  Sun,
  PanelLeft,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
type Role = "super_admin" | "editor" | "manager" | "none";

import { motion } from "framer-motion";



export function AdminDashboard() {
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<Role>("none");
  const [roleLoading, setRoleLoading] = useState(true);
  const [live, setLive] = useState<any>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);

  const refreshTimer = useRef<any>(null);

  useEffect(() => {
    checkAuth();
    loadRole();
    loadLive();
  }, []);

  useEffect(() => {
    const unsub = subscribeDashboardRealtime(() => {
      if (refreshTimer.current) return;
      refreshTimer.current = setTimeout(async () => {
        await loadLive(false);
        refreshTimer.current = null;
      }, 1000);
    });
    return () => unsub();
  }, []);

  async function checkAuth() {
    try {
      const { data } = await authAPI.getSession();
      if (!data.session) navigate("/admin");
    } catch {
      navigate("/admin");
    }
  }

  async function loadRole() {
    setRoleLoading(true);
    try {
      setRole(await getMyRole());
    } catch {
      setRole("none");
    } finally {
      setRoleLoading(false);
    }
  }

  async function loadLive(showToast = true) {
    setIsLoading(true);
    try {
      const data = await supabaseDashboard.getLiveStats();
      setLive(data);
      if (showToast) toast.success("Dashboard updated");
    } catch {
      toast.error("Dashboard failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await authAPI.signOut();
    navigate("/admin");
  }

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

  const counts = live?.counts || {};
  const recentDonations = live?.recentDonations || [];

  const donationChartData = useMemo(() => {
    return [...recentDonations].reverse().map((d: any, i: number) => ({
      name: `#${i + 1}`,
      amount: Number(d.amount || 0),
    }));
  }, [recentDonations]);

  function goTo(route: string, id: string) {
    setActiveTab(id);
    navigate(route);
  }

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0B1220] dark:to-[#020617]">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-72" : "w-20"} transition bg-[#0B1220] text-white flex flex-col border-r border-white/10`}>
          <div className="p-6 flex justify-between items-center border-b border-white/10">
            {sidebarOpen && <h1 className="font-bold text-lg">Admin</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <PanelLeft />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.route, item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
                    ${active ? "bg-blue-600 shadow-lg" : "hover:bg-white/10"}
                  `}
                >
                  <Icon size={20} />
                  {sidebarOpen && item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <LogOut size={18} className="mr-2" />
              {sidebarOpen && "Logout"}
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">

          {/* Header */}
          <header className="sticky top-0 backdrop-blur bg-white/80 dark:bg-black/40 border-b p-6 flex justify-between">
            <h2 className="text-2xl font-bold">Live Dashboard</h2>

            <div className="flex gap-3">
              <Button onClick={() => setDark(!dark)} variant="outline">
                {dark ? <Sun /> : <Moon />}
              </Button>

              <Button onClick={() => loadLive()} variant="outline">
                <RefreshCcw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </header>

          {/* Grid */}
          <div className="p-8 grid lg:grid-cols-3 gap-8">

            {/* KPI */}
            <div className="lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Donations", value: counts.totalDonationsCount, icon: DollarSign },
                { label: "Volunteers", value: counts.volunteerCount, icon: Users },
                { label: "Programs", value: counts.programCount, icon: TrendingUp },
                { label: "Internships", value: counts.internshipCount, icon: Briefcase },
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="rounded-2xl shadow-md bg-white dark:bg-[#0F172A]">
                      <CardContent className="p-6 flex justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{kpi.label}</p>
                          <p className="text-3xl font-bold">{kpi.value || 0}</p>
                        </div>
                        <Icon className="text-blue-600" size={26} />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Latest Donors */}
            <Card className="rounded-2xl shadow-md bg-white dark:bg-[#0F172A]">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Latest Donors</h3>
                <div className="space-y-3 max-h-[420px] overflow-auto">
                  {recentDonations.map((d: any) => (
                    <div key={d.id} className="flex justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
                      <div>
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.email}</p>
                      </div>
                      <p className="font-bold text-green-600">₹{d.amount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="lg:col-span-2 rounded-2xl shadow-md bg-white dark:bg-[#0F172A]">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Donation Trend</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={donationChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
