import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";
import { RefreshCcw, ClipboardList } from "lucide-react";

const API_BASE = "https://ngo-admin-thannmann.onrender.com";

type LogRow = {
  id: string;
  actor_user_id: string;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: any;
  created_at: string;
};

export default function AdminActivityLogs() {
  const [items, setItems] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/logs`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load logs");
      setItems(json.logs || []);
    } catch (e: any) {
      toast.error(e.message || "Error loading logs");
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
    return items.filter((x) => {
      return (
        (x.actor_email || "").toLowerCase().includes(query) ||
        x.action.toLowerCase().includes(query) ||
        x.entity.toLowerCase().includes(query) ||
        (x.entity_id || "").toLowerCase().includes(query)
      );
    });
  }, [items, q]);

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <ClipboardList size={16} />
            Admin / Activity Logs
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Activity Logs
          </h1>
          <p className="text-gray-600 mt-1">Track every important action done by admins.</p>
        </div>

        <Button onClick={load} variant="outline" className="rounded-full">
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="mt-6">
        <Input
          className="rounded-xl"
          placeholder="Search by email / action / entity..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Card className="border-2 rounded-2xl bg-white mt-6">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-gray-600">Loading logs...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600">No logs found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-2xl bg-[#F8FAFC] flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[#0F172A] truncate">
                      {log.action} <span className="text-gray-500 font-normal">({log.entity})</span>
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      By: <b>{log.actor_email || "Unknown"}</b>
                      {log.entity_id ? (
                        <>
                          {" "}• ID: <span className="font-mono text-xs">{log.entity_id}</span>
                        </>
                      ) : null}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-[#1D4ED8]">{log.entity}</Badge>
                    <Badge className="bg-[#FBBF24] text-[#0F172A]">{log.action}</Badge>
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
