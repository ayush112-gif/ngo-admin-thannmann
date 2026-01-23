import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useRouter } from "@/app/components/router";
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
  ShieldCheck,
  RefreshCcw,
  TrendingUp,
  Activity,
} from "lucide-react";

// ✅ Recharts (already available)
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

export function AdminDashboard() {
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  const [role, setRole] = useState<Role>("none");
  const [roleLoading, setRoleLoading] = useState(true);

  const [live, setLive] = useState<any>(null);

  // ✅ prevent too many realtime refresh calls
  const refreshTimer = useRef<any>(null);

  useEffect(() => {
    checkAuth();
    loadRole();
    loadLive();
  }, []);

  // ✅ Real-time subscription
  useEffect(() => {
    const unsub = subscribeDashboardRealtime(() => {
      if (refreshTimer.current) return;

      refreshTimer.current = setTimeout(async () => {
        await loadLive(false);
        refreshTimer.current = null;
      }, 1000);
    });

    return () => {
      unsub();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const r = await getMyRole();
      setRole(r);
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
      if (showToast) toast.success("✅ Live dashboard loaded");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load live dashboard stats");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await authAPI.signOut();
    navigate("/admin");
  }

  const allMenuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", route: "/admin/dashboard" },
    { id: "announcements", icon: Megaphone, label: "Announcements", route: "/admin/announcements" },
    { id: "blogs", icon: FileText, label: "Blogs", route: "/admin/blogs" },
    { id: "programs", icon: Heart, label: "Programs", route: "/admin/programs" },
    { id: "internships", icon: Briefcase, label: "Internships", route: "/admin/internships" },
    { id: "volunteers", icon: Users, label: "Volunteers", route: "/admin/volunteers" },
    { id: "donations", icon: DollarSign, label: "Donations", route: "/admin/donations" },
    { id: "messages", icon: MessageSquare, label: "Messages", route: "/admin/messages" },
  ];

  const menuItems = useMemo(() => {
    if (role === "super_admin") return allMenuItems;

    if (role === "editor")
      return allMenuItems.filter((x) => ["dashboard", "announcements", "blogs"].includes(x.id));

    if (role === "manager")
      return allMenuItems.filter((x) =>
        ["dashboard", "programs", "internships", "volunteers", "donations"].includes(x.id)
      );

    return allMenuItems.filter((x) => x.id === "dashboard");
  }, [role]);

  useEffect(() => {
    const allowedIds = menuItems.map((x) => x.id);
    if (!allowedIds.includes(activeTab)) setActiveTab("dashboard");
  }, [menuItems, activeTab]);

  function goTo(route: string, tabId: string) {
    setActiveTab(tabId);
    navigate(route);
  }

  const counts = live?.counts || {};
  const recentDonations = live?.recentDonations || [];
  const recentVolunteers = live?.recentVolunteers || [];

  // ✅ Chart Data: using recent donations (simple)
  const donationChartData = useMemo(() => {
    // make last 5 donations graph
    const rows = [...recentDonations].reverse();
    return rows.map((d: any, index: number) => ({
      name: `#${index + 1}`,
      amount: Number(d.amount || 0),
    }));
  }, [recentDonations]);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <div className="w-72 bg-[#0F172A] text-white flex flex-col border-r border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-extrabold" style={{ fontFamily: "Poppins, sans-serif" }}>
            Admin Panel
          </h1>
          <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Thannmanngaadi Foundation
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs">
            <ShieldCheck size={14} />
            {roleLoading ? "Role: checking..." : `Role: ${role}`}
          </div>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 text-xs">
            <Activity size={14} className="text-green-400" />
            Live Connected
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => goTo(item.route, item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                  active ? "bg-[#1D4ED8] text-white shadow-md" : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A]">
                Dashboard (Ultra Live)
              </h2>
              <p className="text-gray-600 mt-2">
                Live analytics + real-time updates from Supabase.
              </p>
            </div>

            <Button
              onClick={() => loadLive()}
              variant="outline"
              className="rounded-full"
            >
              <RefreshCcw size={16} className="mr-2" />
              Refresh Now
            </Button>
          </div>

          {/* KPIs */}
          {isLoading ? (
            <p className="mt-6 text-gray-600">Loading live dashboard...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                <Card className="p-6 border-2 rounded-2xl bg-white">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Donations</div>
                        <div className="text-3xl font-extrabold text-[#0F172A]">
                          {counts.totalDonationsCount || 0}
                        </div>
                      </div>
                      <DollarSign className="text-[#1D4ED8]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 border-2 rounded-2xl bg-white">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Volunteers</div>
                        <div className="text-3xl font-extrabold text-[#0F172A]">
                          {counts.volunteerCount || 0}
                        </div>
                      </div>
                      <Users className="text-[#38BDF8]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 border-2 rounded-2xl bg-white">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Internships</div>
                        <div className="text-3xl font-extrabold text-[#0F172A]">
                          {counts.internshipCount || 0}
                        </div>
                      </div>
                      <Briefcase className="text-[#FBBF24]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 border-2 rounded-2xl bg-white">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Programs</div>
                        <div className="text-3xl font-extrabold text-[#0F172A]">
                          {counts.programCount || 0}
                        </div>
                      </div>
                      <TrendingUp className="text-[#1D4ED8]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart + Content Stats */}
              <div className="grid lg:grid-cols-3 gap-6 mt-8">
                <Card className="border-2 rounded-2xl bg-white lg:col-span-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold text-[#0F172A]">
                        Donation Trend (Latest)
                      </h3>
                      <Badge className="bg-green-600">Live</Badge>
                    </div>

                    <div className="h-[260px] mt-4">
                      {donationChartData.length === 0 ? (
                        <p className="text-gray-600">No donation data for chart.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={donationChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="amount" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 rounded-2xl bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-extrabold text-[#0F172A]">
                      Website Content
                    </h3>

                    <div className="mt-4 grid gap-3">
                      <div className="p-4 rounded-xl bg-[#F8FAFC] border flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Published Blogs</div>
                          <div className="text-2xl font-extrabold text-[#0F172A]">
                            {counts.publishedBlogs || 0}
                          </div>
                        </div>
                        <FileText className="text-[#FBBF24]" />
                      </div>

                      <div className="p-4 rounded-xl bg-[#F8FAFC] border flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Published Announcements</div>
                          <div className="text-2xl font-extrabold text-[#0F172A]">
                            {counts.publishedAnnouncements || 0}
                          </div>
                        </div>
                        <Megaphone className="text-[#1D4ED8]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6 mt-8">
                <Card className="border-2 rounded-2xl bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold text-[#0F172A]">Recent Donations</h3>
                      <Button variant="outline" className="rounded-full" onClick={() => navigate("/admin/donations")}>
                        View All
                      </Button>
                    </div>

                    {recentDonations.length === 0 ? (
                      <p className="text-gray-600 mt-4">No donations found.</p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {recentDonations.map((d: any) => (
                          <div
                            key={d.id}
                            className="p-4 rounded-xl border bg-[#F8FAFC] flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[#0F172A] truncate">{d.name || "Unknown"}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {d.email || "-"} • {new Date(d.created_at).toLocaleString()}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-extrabold text-[#0F172A]">
                                ₹{Number(d.amount || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">{d.payment_method || "N/A"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 rounded-2xl bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold text-[#0F172A]">Recent Volunteers</h3>
                      <Button variant="outline" className="rounded-full" onClick={() => navigate("/admin/volunteers")}>
                        View All
                      </Button>
                    </div>

                    {recentVolunteers.length === 0 ? (
                      <p className="text-gray-600 mt-4">No volunteer applications found.</p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {recentVolunteers.map((v: any) => (
                          <div
                            key={v.id}
                            className="p-4 rounded-xl border bg-[#F8FAFC] flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[#0F172A] truncate">{v.name || "Unknown"}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {v.email || "-"} • {new Date(v.created_at).toLocaleString()}
                              </div>
                            </div>

                            <Badge
                              className={
                                v.status === "Approved"
                                  ? "bg-green-600"
                                  : v.status === "Rejected"
                                  ? "bg-red-600"
                                  : "bg-orange-500"
                              }
                            >
                              {v.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6 border-2 rounded-2xl bg-white mt-8">
                <CardContent className="p-0">
                  <h3 className="text-xl font-extrabold text-[#0F172A] mb-4">Quick Actions</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    {["super_admin", "editor"].includes(role) && (
                      <>
                        <Button
                          onClick={() => navigate("/admin/announcements")}
                          className="h-20 rounded-2xl bg-[#1D4ED8] hover:bg-[#1e40af]"
                        >
                          <Megaphone className="mr-2" />
                          Manage Announcements
                        </Button>

                        <Button
                          onClick={() => navigate("/admin/blogs")}
                          className="h-20 rounded-2xl bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A]"
                        >
                          <FileText className="mr-2" />
                          Manage Blogs
                        </Button>
                      </>
                    )}

                    {["super_admin", "manager"].includes(role) && (
                      <>
                        <Button
                          onClick={() => navigate("/admin/programs")}
                          className="h-20 rounded-2xl bg-[#38BDF8] hover:bg-[#0ea5e9]"
                        >
                          <Heart className="mr-2" />
                          Manage Programs
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 text-sm text-gray-500">
                ✅ Real-time enabled: Any table updates auto-refresh dashboard.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
