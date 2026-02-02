import { useEffect, useState } from "react";
import { supaImpactRules } from "@/utils/supabaseApi";

type Rule = {
  id: string;
  amount: number;
  label: string;
  impact_text: string;
  created_at: string;
};

export default function AdminImpactRules() {
  const [items, setItems] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState<number>(199);
  const [label, setLabel] = useState("");
  const [impactText, setImpactText] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await supaImpactRules.getAll();
      setItems(data);
    } catch (e: any) {
      alert(e?.message || "Failed to load impact rules");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!amount || !label.trim() || !impactText.trim()) {
      alert("Amount, Label and Impact Text are required");
      return;
    }

    try {
      await supaImpactRules.upsertRule({
        amount,
        label,
        impact_text: impactText,
      });

      setLabel("");
      setImpactText("");
      await load();
      alert("✅ Rule saved");
    } catch (e: any) {
      alert(e?.message || "Failed to save rule");
    }
  }

  async function removeRule(a: number) {
    if (!confirm("Delete this rule?")) return;
    try {
      await supaImpactRules.removeByAmount(a);
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to delete rule");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin — Impact Rules</h1>
      <p style={{ marginTop: 6, opacity: 0.7 }}>
        Define “Donation Amount → Impact Message” mapping.
      </p>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ fontWeight: 700 }}>Add / Update Rule</h2>

        <div style={{ marginTop: 10 }}>
          <label>Amount (₹)</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Label</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Eg: Stationery Kit"
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Impact Text</label>
          <textarea
            style={{ width: "100%", padding: 10, marginTop: 6, minHeight: 90 }}
            value={impactText}
            onChange={(e) => setImpactText(e.target.value)}
            placeholder="Eg: Your ₹199 provides basic stationery for a student"
          />
        </div>

        <button
          onClick={save}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "#1D4ED8",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Save Rule
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontWeight: 800 }}>All Rules</h2>

        {loading ? (
          <p style={{ marginTop: 10 }}>Loading...</p>
        ) : items.length === 0 ? (
          <p style={{ marginTop: 10 }}>No rules found.</p>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {items.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  background: "white",
                  padding: 16,
                }}
              >
                <h3 style={{ fontWeight: 800 }}>₹{r.amount} — {r.label}</h3>
                <p style={{ marginTop: 6, opacity: 0.8 }}>{r.impact_text}</p>

                <button
                  onClick={() => removeRule(r.amount)}
                  style={{
                    marginTop: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: "#fff5f5",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
