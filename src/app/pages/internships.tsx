import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { Briefcase, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export function InternshipsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("UI/UX Intern");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function apply() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("internship_applications").insert([
        {
          name,
          email,
          phone: phone || null,
          role,
          message: message || null,
          status: "Pending",
        },
      ]);

      if (error) throw error;

      toast.success("✅ Internship applied successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setRole("UI/UX Intern");
      setMessage("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#050B1F] text-white py-16">
        <div className="absolute inset-0 soft-glow opacity-85" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5">
              <Sparkles size={16} />
              <span className="text-sm text-blue-100">Internships • Real Projects • NGO Impact</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold">
              Internship <span className="text-[#38BDF8]">Opportunities</span>
            </h1>

            <p className="text-blue-100 mt-4 text-lg">
              Work with us, build skills, and contribute to meaningful social impact.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Details */}
            <Card className="neo-card hover-3d p-6">
              <CardContent className="p-0">
                <h2 className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Briefcase className="text-[#1D4ED8]" />
                  What You’ll Get
                </h2>

                <div className="mt-6 space-y-4">
                  {[
                    { title: "Certificate + Letter", desc: "Internship certificate & recommendation letter." },
                    { title: "Real Work Experience", desc: "Work on real NGO website & systems." },
                    { title: "Portfolio Projects", desc: "Build impactful work you can show in resume." },
                  ].map((x) => (
                    <div key={x.title} className="neo-card hover-3d p-5">
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-2xl bg-[#1D4ED8]/10 flex items-center justify-center">
                          <BadgeCheck className="text-[#1D4ED8]" size={20} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#0F172A]">{x.title}</h3>
                          <p className="text-gray-600 mt-1 text-sm">{x.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Apply Form */}
            <Card className="neo-card hover-3d p-6">
              <CardContent className="p-0">
                <h2 className="text-2xl font-extrabold text-[#0F172A]">Apply Now</h2>
                <p className="text-gray-600 mt-2">Fill details & apply for internship.</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>

                  <div>
                    <Label>Email *</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="UI/UX Intern / Web Dev Intern" />
                  </div>

                  <div>
                    <Label>Why you want this internship?</Label>
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write short message..." />
                  </div>

                  <Button
                    onClick={apply}
                    disabled={loading}
                    className="w-full rounded-full bg-[#1D4ED8] hover:bg-[#1e40af] h-12 font-bold"
                  >
                    {loading ? "Submitting..." : (
                      <span className="flex items-center gap-2">
                        Submit Application <ArrowRight size={16} />
                      </span>
                    )}
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
