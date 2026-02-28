import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Confetti from "react-confetti";
import GlobeDonations from "@/app/components/GlobeDonations";

export default function VolunteerPage() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [impact, setImpact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activity, setActivity] = useState("Volunteer joined from Delhi");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    interest: "",
  });

  useEffect(() => {
    const feed = [
      "New volunteer joined",
      "Education camp live",
      "Food drive active",
      "Healthcare outreach running",
      "Community event happening",
    ];

    const i = setInterval(() => {
      setActivity(feed[Math.floor(Math.random() * feed.length)]);
    }, 2500);

    return () => clearInterval(i);
  }, []);

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setError("");

    if (!form.name || !form.email || !form.city || !form.interest) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    // insert DB
    const { error } = await supabase
      .from("volunteer_applications")
      .insert([form]);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // backend email trigger
    await fetch("https://ngo-admin-thannmann-na5k.onrender.com/api/volunteer/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
      }),
    });

    setSuccess(true);
    setStep(5);
    setLoading(false);

    setImpact(true);
    setTimeout(() => setImpact(false), 400);
  }

  return (
    <div className="bg-[#070b14] text-white overflow-hidden relative">

      {success && <Confetti recycle={false} numberOfPieces={500} />}
      <GlobeDonations trigger={impact} />

      <motion.div
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        className="bg-blue-600 py-2 text-center font-semibold whitespace-nowrap z-10 relative"
      >
        🔥 Live Activity: {activity}
      </motion.div>

      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative z-10">

        <motion.h1
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-extrabold mb-6"
        >
          Global Volunteer Network
        </motion.h1>

        <p className="text-gray-400 max-w-2xl mb-12">
          Join a cinematic future of volunteering.
        </p>

        <div className="grid grid-cols-3 gap-12 mb-16">
          <Stat num={1200} label="Volunteers" />
          <Stat num={45} label="Programs" />
          <Stat num={80000} label="Lives Impacted" />
        </div>

        <Wizard
          step={step}
          setStep={setStep}
          form={form}
          update={update}
          submit={submit}
          loading={loading}
          error={error}
        />
      </section>
    </div>
  );
}

/* ---------------- Wizard ---------------- */

function Wizard({ step, setStep, form, update, submit, loading, error }: any) {

  if (step === 5)
    return (
      <div className="bg-green-500/10 border border-green-500 p-8 rounded-xl text-green-400 font-bold">
        🎉 Welcome to the volunteer network!  
        <br />
        Check your email for onboarding instructions.
      </div>
    );

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500 p-3 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <input placeholder="Full Name" value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input" />
          <button onClick={() => setStep(2)} className="btn">Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <input placeholder="Email" value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="input" />
          <input placeholder="Phone" value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="input" />
          <button onClick={() => setStep(3)} className="btn">Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <input placeholder="City" value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="input" />
          <button onClick={() => setStep(4)} className="btn">Next</button>
        </>
      )}

      {step === 4 && (
        <>
          <input placeholder="Interest Area" value={form.interest}
            onChange={(e) => update("interest", e.target.value)}
            className="input" />
          <button onClick={submit} disabled={loading} className="btn">
            {loading ? "Submitting..." : "Submit"}
          </button>
        </>
      )}

      <style>{`
        .input {
          width:100%; padding:12px; border-radius:12px;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.1);
          color:white; outline:none;
        }
        .input:focus { border-color:#2563eb; }

        .btn {
          width:100%;
          background:#2563eb;
          padding:12px;
          border-radius:12px;
          font-weight:bold;
        }
      `}</style>
    </motion.div>
  );
}

/* ---------------- Stats ---------------- */

function Stat({ num, label }: any) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-400">
        <CountUp end={num} duration={3} separator="," />
      </div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}