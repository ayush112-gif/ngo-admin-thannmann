import { useEffect, useState } from "react";
import { supaImpactRules, supaImpactStats } from "@/utils/supabaseApi";

type Rule = {
  id: string;
  amount: number;
  label: string;
  impact_text: string;
};

export function LiveImpactWidget() {
  const [stats, setStats] = useState<any>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        supaImpactStats.getLiveStats(),
        supaImpactRules.getAll(),
      ]);
      setStats(s);
      setRules(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="mt-6 text-gray-600">Loading impact...</div>;

  return (
    <div className="mt-10 bg-white border-2 rounded-2xl p-6">
      <h2 className="text-2xl font-extrabold text-[#0F172A]">Live Impact Tracker</h2>
      <p className="text-gray-600 mt-2">
        Real-time donations and impact mapping (auto updates).
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Total Raised</div>
          <div className="text-2xl font-extrabold mt-1">
            ₹{stats?.totalRaised?.toLocaleString() || 0}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Total Donors</div>
          <div className="text-2xl font-extrabold mt-1">{stats?.totalDonors || 0}</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Today Donors</div>
          <div className="text-2xl font-extrabold mt-1">{stats?.todayDonors || 0}</div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-[#0F172A]">Donation → Impact</h3>

        {rules.length === 0 ? (
          <p className="text-gray-600 mt-2">No impact rules added yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            {rules.map((r) => (
              <div key={r.id} className="rounded-xl border p-4 hover:shadow-sm transition">
                <div className="font-extrabold text-[#1D4ED8]">₹{r.amount} — {r.label}</div>
                <div className="text-sm text-gray-700 mt-1">{r.impact_text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
