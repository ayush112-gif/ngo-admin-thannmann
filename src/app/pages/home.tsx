import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "@/app/components/router";
import { Button } from "@/app/components/ui/button";
import Leaderboard from "@/app/components/Leaderboard";
import { supabase } from "@/utils/supabaseClient";
import {
  supabasePrograms,
  supabaseBlogs,
  supabaseAnnouncements,
} from "@/utils/supabaseApi";

/* ================= STARFIELD ================= */

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 160 }).map(() => ({
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 40 + 20,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-80"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.left}%`,
            top: `${star.top}%`,
          }}
          animate={{ y: ["0%", "-100%"] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <motion.div
        className="absolute w-[2px] h-[140px] bg-gradient-to-b from-white to-transparent"
        animate={{ x: ["-10%", "120%"], y: ["10%", "80%"] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 6 }}
      />
    </div>
  );
}

/* ================= MAIN ================= */

export function HomePage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  /* ===== Carbon Calculator ===== */
  const [carKm, setCarKm] = useState(0);
  const [electricity, setElectricity] = useState(0);
  const [flights, setFlights] = useState(0);

  const totalEmission =
    carKm * 0.21 + electricity * 0.85 + flights * 90;

  const treesNeeded = Math.ceil(totalEmission / 21);

  /* ===== Goal Percent ===== */
  const treePercent = 65;
  const animalPercent = 48;
  const circumference = 2 * Math.PI * 80;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(t);
  }, [announcements]);

  async function loadData() {
    const [p, b, a] = await Promise.all([
      supabasePrograms.getPublished(),
      supabaseBlogs.getPublished(),
      supabaseAnnouncements.getPublishedForHome(),
    ]);

    const { data: animalData } = await supabase
      .from("animals")
      .select("*")
      .eq("is_active", true);

    setPrograms(p || []);
    setBlogs((b || []).slice(0, 4));
    setAnnouncements(a || []);
    setAnimals(animalData || []);
  }

  async function handleSponsor(animalId: string, amount: number) {
    await supabase.from("animal_sponsors").insert([
      {
        animal_id: animalId,
        sponsor_name: "Website Sponsor",
        sponsor_email: "demo@email.com",
        amount,
      },
    ]);

    alert("Thank you for sponsoring 🐾");
  }

  return (
    <div className="bg-[#050B1F] text-white relative overflow-hidden">

      <StarField />

      {/* ANNOUNCEMENT */}
      {announcements.length > 0 && (
        <div className="relative z-10 bg-blue-800/40 backdrop-blur-md py-4 text-center border-b border-blue-700">
          <h3 className="text-blue-300 font-semibold">
            {announcements[tickerIndex]?.title}
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            {announcements[tickerIndex]?.message}
          </p>
        </div>
      )}

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative z-10">
        <h1 className="text-6xl font-extrabold">
          Protecting Trees. Saving Animals.
        </h1>
        <p className="mt-6 text-blue-300 max-w-2xl">
          Transparent impact for forests and rescued animals.
        </p>
        <div className="mt-10 flex gap-6">
          <Button asChild size="lg" className="bg-blue-600 rounded-full">
            <Link href="/donate">Donate Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-blue-400 rounded-full">
            <Link href="/volunteer">Volunteer</Link>
          </Button>
        </div>
      </section>

      {/* CARBON CALCULATOR */}
      <section className="py-24 border-t border-blue-900 text-center relative z-10 px-6">
        <h2 className="text-3xl font-bold mb-8">
          Calculate Your Carbon Footprint 🌍
        </h2>

        <div className="max-w-xl mx-auto space-y-4">
          <input
            type="number"
            placeholder="Monthly Car KM"
            className="w-full p-3 rounded-lg bg-[#0B1228] border border-blue-800"
            onChange={(e) => setCarKm(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Monthly Electricity (kWh)"
            className="w-full p-3 rounded-lg bg-[#0B1228] border border-blue-800"
            onChange={(e) => setElectricity(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Flights per Year"
            className="w-full p-3 rounded-lg bg-[#0B1228] border border-blue-800"
            onChange={(e) => setFlights(Number(e.target.value))}
          />

          <div className="mt-6 text-blue-300">
            Estimated Emission: {totalEmission.toFixed(2)} kg CO₂
          </div>
          <div className="text-green-400 font-bold">
            Offset by planting {treesNeeded} trees 🌳
          </div>
        </div>
      </section>

      {/* GOAL RINGS */}
      <section className="py-24 border-t border-blue-900 text-center relative z-10">
        <h2 className="text-3xl font-bold mb-12">Our Mission Goals 🎯</h2>

        <div className="flex justify-center gap-16 flex-wrap">

          {[treePercent, animalPercent].map((percent, i) => (
            <div key={i}>
              <svg width="200" height="200">
                <circle cx="100" cy="100" r="80"
                  stroke="#1e3a8a"
                  strokeWidth="12"
                  fill="none" />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke={i === 0 ? "#22c55e" : "#ec4899"}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (circumference * percent) / 100}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (circumference * percent) / 100 }}
                  transition={{ duration: 2 }}
                />
              </svg>
              <div className="mt-4 font-bold">
                {percent}% {i === 0 ? "Tree Goal" : "Animal Goal"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ANIMAL SPONSOR SECTION */}
      <section className="py-24 border-t border-blue-900 relative z-10 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Sponsor a Rescued Animal 🐾
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {animals.map((animal) => (
            <div
              key={animal.id}
              className="bg-[#0B1228] border border-blue-800 rounded-2xl overflow-hidden"
            >
              {animal.image_url && (
                <img
                  src={animal.image_url}
                  className="h-56 w-full object-cover"
                />
              )}

              <div className="p-6">
                <h3 className="text-xl font-semibold">
                  {animal.name}
                </h3>

                <p className="text-blue-200 mt-2 line-clamp-3">
                  {animal.rescue_story}
                </p>

                <div className="mt-4 text-green-400 font-bold">
                  ₹{animal.monthly_cost} / month
                </div>

                <Button
                  className="mt-4 w-full bg-pink-600 rounded-full"
                  onClick={() =>
                    handleSponsor(animal.id, animal.monthly_cost)
                  }
                >
                  Sponsor Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="py-28 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {programs.slice(0, 6).map((p) => (
            <div key={p.id}
              className="rounded-2xl overflow-hidden bg-[#0B1228] border border-blue-800">
              {p.image_url && (
                <img
                  src={p.image_url}
                  className="h-56 w-full object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                <p className="text-blue-200 line-clamp-3">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOGS */}
      <section className="py-24 border-t border-blue-900 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6">
          {blogs.map((b) => (
            <div key={b.id} className="bg-[#0B1228] p-6 rounded-xl border border-blue-800">
              <h3 className="font-semibold mb-2">{b.title}</h3>
              <p className="text-blue-200 text-sm line-clamp-3">
                {b.meta_description || b.content?.slice(0, 100)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-28 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <Leaderboard />
        </div>
      </section>

      <section className="py-32 text-center bg-gradient-to-r from-blue-700 to-blue-500 relative z-10">
        <h2 className="text-5xl font-extrabold">Join The Green Movement</h2>
        <Button asChild size="lg" className="mt-8 rounded-full bg-white text-blue-700 px-10">
          <Link href="/donate">Support Now</Link>
        </Button>
      </section>

      <a
        href="https://wa.me/+918887614683"
        className="fixed bottom-6 right-6 bg-green-500 px-6 py-3 rounded-full text-white font-bold shadow-lg z-50"
      >
        WhatsApp
      </a>

    </div>
  );
}