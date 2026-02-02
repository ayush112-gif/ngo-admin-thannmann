import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { supaVolunteers } from "@/utils/supabaseApi";
import { Sparkles, Users, Heart, BadgeCheck } from "lucide-react";

export function VolunteerPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    alert("submit clicked");

    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email required");
      return;
    }

    setLoading(true);

    try {
      const res = await supaVolunteers.create({
        name,
        email,
        phone,
        city,
        interest,
      });

      console.log("Volunteer inserted:", res);
      toast.success("✅ Application submitted!");

      setName("");
      setEmail("");
      setPhone("");
      setCity("");
      setInterest("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC]">

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#050B1F] text-white py-16">
        {/* 👇 overlay should not block clicks */}
        <div className="absolute inset-0 soft-glow opacity-85 pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5">
              <Sparkles size={16} />
              <span className="text-sm text-blue-100">
                Become a Volunteer • Help on ground & online
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold">
              Join Our <span className="text-[#38BDF8]">Volunteer</span> Team
            </h1>

            <p className="text-blue-100 mt-4 text-lg">
              Your time and skills can change lives.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Left Content */}
            <Card className="neo-card hover-3d p-6">
              <CardContent className="p-0">
                <h2 className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Users className="text-[#1D4ED8]" />
                  Why Volunteer With Us?
                </h2>

                <div className="mt-6 space-y-4">
                  {[
                    { icon: BadgeCheck, title: "Certificate", desc: "Get verified volunteer certificate." },
                    { icon: Heart, title: "Real Impact", desc: "Work on real campaigns and ground events." },
                    { icon: Sparkles, title: "Skill Growth", desc: "Develop leadership & teamwork experience." },
                  ].map((x) => {
                    const Icon = x.icon;
                    return (
                      <div key={x.title} className="neo-card p-5 hover-3d">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#1D4ED8]/10 flex items-center justify-center">
                            <Icon className="text-[#1D4ED8]" size={20} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[#0F172A]">{x.title}</h3>
                            <p className="text-gray-600 mt-1 text-sm">{x.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Right Form */}
            <Card className="neo-card hover-3d p-6">
              <CardContent className="p-0">
                <h2 className="text-2xl font-extrabold text-[#0F172A]">
                  Volunteer Application Form
                </h2>

                <div className="mt-6 space-y-4">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                  <Input value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="Interest Area" />

                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                    disabled={loading}
                    className="w-full rounded-full bg-[#1D4ED8] h-12 font-bold"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  );
}
