import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { supaDonations } from "@/utils/supabaseApi";
import GlobeDonations from "@/app/components/GlobeDonations";

type Donation = {
  name: string;
  amount: number;
  created_at?: string;
};

export default function DonatePage() {
  const [step, setStep] = useState(1);

  const [paymentStage, setPaymentStage] = useState<
    "select" | "loading" | "qr" | "verifying"
  >("select");

  const [paymentMethod, setPaymentMethod] = useState<
    "none" | "upi" | "card" | "netbanking" | "wallet"
  >("none");

  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [donors, setDonors] = useState<Donation[]>([]);
  const [recent, setRecent] = useState<Donation[]>([]);
  const [popup, setPopup] = useState<Donation | null>(null);
  const [totalRaised, setTotalRaised] = useState(0);

  const campaignGoal = 200000;
  const progress = Math.min((totalRaised / campaignGoal) * 100, 100);

  // 🔹 Load leaderboard + stats
  const loadData = async () => {
    const data = await supaDonations.getAll();
    if (!data) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekly = data.filter(
      (d: any) => new Date(d.created_at) >= sevenDaysAgo
    );

    const sorted = weekly.sort(
      (a: any, b: any) => Number(b.amount) - Number(a.amount)
    );

    setDonors(sorted.slice(0, 3));
    setRecent(sorted.slice(0, 6));

    const total = data.reduce(
      (sum: number, d: any) => sum + Number(d.amount),
      0
    );

    setTotalRaised(total);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Popup ticker
  useEffect(() => {
    if (!recent.length) return;

    const interval = setInterval(() => {
      const r = recent[Math.floor(Math.random() * recent.length)];
      setPopup(r);
      setTimeout(() => setPopup(null), 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, [recent]);

  // 🔹 Payment simulation engine
  useEffect(() => {
    if (paymentStage === "loading") {
      const t = setTimeout(() => setPaymentStage("qr"), 2000);
      return () => clearTimeout(t);
    }

    if (paymentStage === "qr") {
      const t = setTimeout(() => setPaymentStage("verifying"), 8000);
      return () => clearTimeout(t);
    }

    if (paymentStage === "verifying") {
      const t = setTimeout(async () => {
        await completeDonation();
        setStep(3);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [paymentStage]);

  // 🔹 FINAL DONATION FLOW
  const completeDonation = async () => {
    try {
      const payload = {
        name,
        email,
        amount: Number(amount),
        type: "donation",
        paymentMethod,
      };

      const saved = await supaDonations.create(payload);
      if (!saved) throw new Error("Supabase save failed");

      const res = await fetch(
        "https://ngo-admin-thannmann-na5k.onrender.com/donation/send-certificate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            amount: Number(amount),
          }),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Email API failed");
      }

      confetti({
        particleCount: 350,
        spread: 160,
        origin: { y: 0.6 },
      });

      await loadData();

    } catch (err) {
      console.error("Donation error:", err);
      alert("Donation saved but email failed. Admin will resend manually.");
    }
  };

  const reset = () => {
    setStep(1);
    setPaymentStage("select");
    setPaymentMethod("none");
    setAmount("");
    setName("");
    setEmail("");
  };

  const podium =
    donors.length === 3
      ? donors
      : [
          { name: "Legend Donor", amount: 50000 },
          { name: "Hero Donor", amount: 30000 },
          { name: "Star Donor", amount: 20000 },
        ];

  const preset = [100, 500, 1000, 5000];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-[#070b14] text-white overflow-hidden relative min-h-screen flex items-center justify-center">

      {/* Full-page globe background */}
      <GlobeDonations />

      <motion.div className="absolute w-96 h-96 bg-blue-600/20 blur-3xl rounded-full top-[-100px] left-[-100px]"
        animate={{ y: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 10 }} />
      <motion.div className="absolute w-96 h-96 bg-purple-600/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]"
        animate={{ y: [0, -50, 0] }} transition={{ repeat: Infinity, duration: 12 }} />

      <motion.div initial="hidden" animate="show" variants={container} className="relative z-10 w-full max-w-4xl p-8 space-y-8 rounded-2xl">

        <motion.h1 variants={fadeUp} className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Support The Mission
        </motion.h1>

        {/* Progress */}
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded overflow-hidden">
            <motion.div
              className="h-4 bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>₹{totalRaised.toLocaleString()}</span>
            <span>Goal ₹{campaignGoal.toLocaleString()}</span>
          </div>
        </div>

        {/* Leaderboard only step 1 */}
        {step === 1 && (
          <div className="flex items-end justify-center gap-8">
            {[1, 0, 2].map((i, idx) => {
              const d = podium[i];
              const heights = ["h-24", "h-32", "h-20"];
              return (
                <div key={idx} className="flex flex-col items-center">
                  {i === 0 && <div className="text-3xl mb-1">🏆</div>}
                  <div className={`w-20 ${heights[i]} bg-yellow-500/90 rounded-t-xl`} />
                  <p className="mt-2 font-semibold">{d.name}</p>
                  <p className="text-xs text-gray-400">₹{d.amount}</p>
                </div>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">

          {step === 1 && (
            <motion.div key="s1" className="space-y-4">
              <div className="flex gap-3 justify-center flex-wrap">
                {preset.map(p => (
                    <motion.button key={p} variants={fadeUp} whileHover={{ scale: 1.03 }} onClick={() => setAmount(String(p))}
                      className="px-4 py-2 bg-white/10 rounded-lg text-sm">
                      ₹{p}
                    </motion.button>
                  ))}
              </div>

              <input placeholder="Amount" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 bg-black/40 border border-white/20 rounded" />

              {amount && <input placeholder="Name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-black/40 border border-white/20 rounded" />}

              {name && <input placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-black/40 border border-white/20 rounded" />}

              {email && (
                <motion.button variants={fadeUp} whileHover={{ scale: 1.02 }} onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded">
                  Continue
                </motion.button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" className="text-center space-y-4">

              {paymentMethod === "none" && (
                <div className="grid grid-cols-2 gap-4">
                  {["upi", "card", "netbanking", "wallet"].map((m) => (
                    <button key={m}
                      onClick={() => {
                        setPaymentMethod(m as any);
                        if (m === "upi") setPaymentStage("loading");
                      }}
                      className="bg-blue-500 py-4 rounded capitalize">
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {paymentMethod === "upi" && paymentStage === "loading" &&
                <p>Generating QR...</p>}

              {paymentMethod === "upi" && paymentStage === "qr" && (
                <div className="bg-white p-4 rounded-xl inline-block">
                  <QRCodeCanvas value={`upi://pay?am=${amount}`} size={200} />
                </div>
              )}

              {paymentMethod === "upi" && paymentStage === "verifying" &&
                <p>Verifying payment...</p>}

            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" className="text-center space-y-4">
              <h2 className="text-3xl font-serif italic">
                Thank you for your kindness ✨
              </h2>
              <p className="opacity-70">A certificate has been sent to your email</p>
              <motion.button variants={fadeUp} whileHover={{ scale: 1.03 }} onClick={reset} className="bg-blue-500 px-6 py-3 rounded">
                Done
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 40, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed bottom-8 left-0 bg-white text-black px-6 py-4 rounded-xl">
            💙 {popup.name} donated ₹{popup.amount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}