import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Crown, Trophy, Sparkles } from "lucide-react";
import { supaLeaderboard } from "@/utils/supabaseApi";

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = value / (duration / 16);

    const t = setInterval(() => {
      start += step;
      if (start >= value) {
        start = value;
        clearInterval(t);
      }
      setDisplay(Math.floor(start));
    }, 16);

    return () => clearInterval(t);
  }, [value]);

  return <span>₹{display.toLocaleString()}</span>;
}

export default function Leaderboard() {
  const [items, setItems] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    supaLeaderboard.getTopDonors().then(setItems);

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  const podiumColors = [
    "from-yellow-300 to-yellow-500",
    "from-gray-200 to-gray-400",
    "from-orange-300 to-orange-500",
  ];

  return (
    <div className="relative mt-10 rounded-3xl p-8 bg-gradient-to-br from-[#020617] to-[#1E293B] text-white shadow-2xl overflow-hidden">

      {showConfetti && top3.length > 0 && <Confetti />}

      <div className="flex items-center gap-3 mb-8">
        <Trophy size={30} />
        <h2 className="text-3xl font-extrabold tracking-tight">
          Elite Donor Leaderboard
        </h2>
      </div>

      {/* 🏆 PODIUM */}
      {top3.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {top3.map((d, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-6 text-center shadow-xl hover:scale-105 transition bg-gradient-to-br ${podiumColors[i]} text-black`}
            >
              {i === 0 && (
                <div className="absolute inset-0 blur-2xl bg-yellow-300 opacity-40 rounded-3xl"></div>
              )}

              <div className="relative">
                <div className="text-4xl mb-2">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                </div>

                <div className="font-extrabold text-xl flex items-center justify-center gap-2">
                  {d.anonymous ? "Anonymous" : d.name}
                  {i === 0 && <Crown size={18} />}
                </div>

                <div className="mt-2 text-lg font-bold">
                  <CountUp value={d.amount} />
                </div>

                {i === 0 && (
                  <div className="mt-3 text-xs flex items-center justify-center gap-1">
                    <Sparkles size={12} />
                    Champion Supporter
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📋 REST */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map((d, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition"
            >
              <div className="flex items-center gap-4">
                <div className="font-extrabold text-lg w-8">
                  #{i + 4}
                </div>
                <div>
                  <div className="font-bold">
                    {d.anonymous ? "Anonymous" : d.name}
                  </div>
                  <div className="text-xs opacity-70">
                    Elite Supporter
                  </div>
                </div>
              </div>

              <div className="font-extrabold text-lg">
                <CountUp value={d.amount} />
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-blue-200 mt-4">No donors yet.</p>
      )}

      <p className="mt-8 text-xs text-blue-200 opacity-70">
        Live ranking based on verified donations
      </p>
    </div>
  );
}
