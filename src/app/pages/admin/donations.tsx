import { useEffect, useMemo, useState } from "react";
import { supaDonations } from "@/utils/supabaseApi";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

type DonationRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  amount: number;
  type: string;
  payment_method: string;
  created_at: string;
};

export default function AdminDonations() {
  const [items, setItems] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await supaDonations.getAll();
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((d) => {
      return (
        d.name?.toLowerCase().includes(s) ||
        d.email?.toLowerCase().includes(s) ||
        (d.phone || "").toLowerCase().includes(s) ||
        String(d.amount).includes(s) ||
        d.payment_method?.toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const totalAmount = useMemo(() => {
    return filtered.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [filtered]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Donations</h1>
          <p className="text-sm text-gray-500">
            View all donation records (Live from Supabase)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={load}
            className="rounded-xl bg-[#1D4ED8] hover:bg-[#1e40af]"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="rounded-2xl border">
          <CardContent className="p-5">
            <p className="text-xs text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-[#0F172A] mt-2">
              {filtered.length}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border">
          <CardContent className="p-5">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-[#0F172A] mt-2">
              ₹{totalAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border">
          <CardContent className="p-5">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-medium text-gray-600 mt-3">
              {loading ? "Loading..." : "Synced ✅"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="max-w-md w-full">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone, amount..."
            className="rounded-xl"
          />
        </div>

        <div className="text-sm text-gray-500">
          Showing <b>{filtered.length}</b> results
        </div>
      </div>

      {/* Table */}
      <Card className="mt-5 rounded-2xl border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b">
                <tr className="text-left text-gray-600">
                  <th className="p-4">Donor</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-6 text-gray-500" colSpan={5}>
                      Loading donations...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="p-6 text-gray-500" colSpan={5}>
                      No donations found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-[#F8FAFC]">
                      <td className="p-4">
                        <div className="font-semibold text-[#0F172A]">{d.name}</div>
                        <div className="text-xs text-gray-500">
                          {d.email} {d.phone ? `• ${d.phone}` : ""}
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-[#0F172A]">
                        ₹{Number(d.amount).toLocaleString()}
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] text-xs font-medium">
                          {d.type}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-[#0F172A]/10 text-[#0F172A] text-xs font-medium">
                          {d.payment_method}
                        </span>
                      </td>

                      <td className="p-4 text-gray-600">
                        {new Date(d.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
