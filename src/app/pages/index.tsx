import { useEffect, useMemo, useState } from "react";
import { Link } from "@/app/components/router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { supabaseContact } from "@/utils/supabaseApi";


import {
  Heart,
  Users,
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  Stethoscope,
  Leaf,
  Wrench,
  HandHeart,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

import {
  supabasePrograms,
  supabaseInternships,
  supaVolunteers,
  supaDonations,
  supabaseBlogs,
} from "@/utils/supabaseApi";

/* =========================================================
   TYPES
========================================================= */
type ProgramRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: "draft" | "published";
  created_at: string;
};

type InternshipRow = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  duration: string | null;
  status: "draft" | "published";
  created_at: string;
};

type BlogRow = {
  id: string;
  title: string;
  category: string;
  content: string;
  cover_image: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  created_at: string;
};

/* =========================================================
   ABOUT PAGE ✅
========================================================= */
export function AboutPage() {
  const values = [
    {
      title: "Transparency",
      desc: "We maintain clear reports, honest updates and open communication.",
    },
    {
      title: "Community First",
      desc: "We prioritize people’s real needs and long-term improvement.",
    },
    {
      title: "Real Impact",
      desc: "We focus on measurable changes in education, health & livelihood.",
    },
  ];

  const milestones = [
    { year: "2021", text: "Started community drives with small volunteer team." },
    { year: "2022", text: "Expanded into education support & health camps." },
    { year: "2023", text: "Launched skill development initiatives & partnerships." },
    { year: "2024", text: "Scaled impact across multiple districts & programs." },
  ];

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#050B1F] text-white py-20">
        <div className="absolute inset-0 soft-glow opacity-90" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Badge className="bg-white/10 text-white border border-white/10">
              <Sparkles size={14} className="mr-2" />
              About Our Foundation
            </Badge>

            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold">
              We are building <span className="text-[#38BDF8]">stronger</span> communities through{" "}
              <span className="text-[#FBBF24]">action</span>.
            </h1>

            <p className="mt-5 text-blue-100 text-lg leading-relaxed">
              Thannmanngaadi Foundation works to uplift communities through education, health
              programs, sustainable initiatives and volunteer-driven support.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="rounded-full bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold">
                <Link href="/donate">Support Our Work</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/volunteer">Join as Volunteer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="neo-card hover-3d p-8">
            <h2 className="text-3xl font-extrabold text-[#0F172A]">Our Mission</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              To empower communities by providing access to quality education, healthcare support,
              sustainable development and opportunities to grow with dignity.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Education & mentorship support",
                "Health awareness & community camps",
                "Skill development & employability",
                "Women empowerment initiatives",
              ].map((x) => (
                <div key={x} className="flex items-start gap-3">
                  <CheckCircle className="text-[#1D4ED8]" size={20} />
                  <p className="text-gray-700">{x}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="neo-card hover-3d p-8 shiny-border">
            <h2 className="text-3xl font-extrabold text-[#0F172A]">Our Values</h2>
            <p className="mt-3 text-gray-600">
              Strong values help us remain consistent and trustworthy.
            </p>

            <div className="mt-6 grid gap-4">
              {values.map((v) => (
                <div key={v.title} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h3 className="font-extrabold text-[#0F172A]">{v.title}</h3>
                  <p className="text-gray-600 mt-1">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-[#0F172A]">Our Journey</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              A timeline of how we started and how we are scaling impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {milestones.map((m) => (
              <div key={m.year} className="neo-card hover-3d p-7">
                <Badge className="bg-[#1D4ED8]/10 text-[#1D4ED8]">{m.year}</Badge>
                <p className="mt-4 text-gray-700">{m.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]">
              <Link href="/contact">Contact & Partner With Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   PROGRAMS PAGE ✅ (Supabase Published)
========================================================= */
export function ProgramsPage() {
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons: Record<string, any> = {
    education: GraduationCap,
    health: Stethoscope,
    environment: Leaf,
    "women empowerment": Heart,
    "skill development": Wrench,
    "community welfare": HandHeart,
  };

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await supabasePrograms.getPublished();
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="py-16 bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-extrabold text-[#0F172A]">Our Programs</h1>
              <p className="text-gray-600 mt-3 max-w-2xl">
                Discover our NGO programs for education, health support, environment, and social welfare.
              </p>
            </div>
            <Button asChild className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]">
              <Link href="/donate">Support a Program</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6">
          {loading ? (
            <p className="text-gray-600">Loading programs...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-600">No published programs found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((p) => {
                const IconComponent = categoryIcons[p.category?.toLowerCase()] || Heart;

                return (
                  <Card key={p.id} className="neo-card hover-3d overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] relative">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IconComponent size={56} className="text-white opacity-80" />
                        </div>
                      )}
                      <Badge className="absolute top-4 right-4 bg-[#FBBF24] text-[#0F172A]">
                        {p.category}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-extrabold text-[#0F172A]">{p.title}</h3>
                      <p className="text-gray-600 mt-2 line-clamp-3">{p.description}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>

                        <Button asChild variant="ghost" className="p-0 h-auto text-[#1D4ED8]">
                          <Link href="/contact" className="flex items-center gap-2 font-semibold">
                            Get Involved <ArrowRight size={16} />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   VOLUNTEER PAGE ✅ (Supabase submit)
========================================================= */
export function VolunteerPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [interest, setInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      await supaVolunteers.create({ name, email, phone, city, interest });
      toast.success("✅ Volunteer application submitted!");
      setName("");
      setEmail("");
      setPhone("");
      setCity("");
      setInterest("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="py-16 bg-[#050B1F] text-white relative overflow-hidden">
        <div className="absolute inset-0 soft-glow opacity-90" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <h1 className="text-5xl font-extrabold">Become a Volunteer</h1>
          <p className="text-blue-100 mt-3 max-w-2xl">
            Join our team and help us deliver real impact in communities.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8">
          <Card className="neo-card hover-3d">
            <CardContent className="p-8">
              <h2 className="text-2xl font-extrabold text-[#0F172A]">Why Volunteer With Us?</h2>
              <div className="mt-5 space-y-3 text-gray-700">
                {[
                  "✅ Certificate & Experience Letter",
                  "✅ Community drives & on-field work",
                  "✅ Skill development opportunities",
                  "✅ Networking and leadership growth",
                ].map((x) => (
                  <p key={x}>{x}</p>
                ))}
              </div>

              <div className="mt-8 section-line" />

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="neo-card p-5">
                  <div className="text-sm text-gray-600">Impact</div>
                  <div className="text-xl font-extrabold text-[#0F172A]">High</div>
                </div>
                <div className="neo-card p-5">
                  <div className="text-sm text-gray-600">Work Mode</div>
                  <div className="text-xl font-extrabold text-[#0F172A]">Online + Offline</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="neo-card hover-3d shiny-border">
            <CardContent className="p-8">
              <h2 className="text-2xl font-extrabold text-[#0F172A]">Volunteer Application</h2>
              <p className="text-gray-600 mt-2">
                Fill the form below and our team will contact you soon.
              </p>

              <div className="mt-6 grid gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    value={email}
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                </div>

                <div>
                  <Label>City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter your city" />
                </div>

                <div>
                  <Label>Interest / Skills</Label>
                  <Input
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    placeholder="Teaching, Design, Management..."
                  />
                </div>

                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
                >
                  {submitting ? "Submitting..." : "Apply Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   INTERNSHIPS PAGE ✅ (Supabase Published)
========================================================= */
export function InternshipsPage() {
  const [items, setItems] = useState<InternshipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await supabaseInternships.getPublished();
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load internships");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="py-16 bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-5xl font-extrabold text-[#0F172A]">Internship Opportunities</h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Gain real experience while contributing to social impact. Explore NGO internships below.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6">
          {loading ? (
            <p className="text-gray-600">Loading internships...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-600">No internships published yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((x) => (
                <Card key={x.id} className="neo-card hover-3d">
                  <CardContent className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-[#0F172A]">{x.title}</h3>
                        <p className="text-gray-600 mt-2 line-clamp-3">{x.description}</p>
                      </div>
                      <Briefcase className="text-[#1D4ED8]" />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Badge className="bg-[#1D4ED8]/10 text-[#1D4ED8]">
                        <MapPin size={14} className="mr-1" />
                        {x.location || "Remote"}
                      </Badge>

                      <Badge className="bg-[#38BDF8]/10 text-[#0284c7]">
                        <Clock size={14} className="mr-1" />
                        {x.duration || "Flexible"}
                      </Badge>
                    </div>

                    <div className="mt-5 text-xs text-gray-500">
                      Published: {new Date(x.created_at).toLocaleDateString()}
                    </div>

                    <Button asChild className="mt-6 rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]">
                      <Link href="/contact">Apply / Contact</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   IMPACT PAGE ✅
========================================================= */
export function ImpactPage() {
  const stats = [
    { label: "Lives Impacted", value: "10,000+" },
    { label: "Volunteers", value: "500+" },
    { label: "Programs", value: "25+" },
    { label: "Events", value: "100+" },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="py-16 bg-[#050B1F] text-white relative overflow-hidden">
        <div className="absolute inset-0 soft-glow opacity-90" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <h1 className="text-5xl font-extrabold">Our Impact</h1>
          <p className="text-blue-100 mt-3 max-w-2xl">
            We work with communities to create measurable change and sustainable development.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="neo-card hover-3d p-7 text-center">
                <div className="text-3xl font-extrabold text-[#0F172A]">{s.value}</div>
                <div className="text-gray-600 mt-2">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 neo-card hover-3d p-8">
            <h2 className="text-2xl font-extrabold text-[#0F172A]">Impact Highlights</h2>
            <p className="text-gray-600 mt-2">
              We regularly conduct camps, distributions, mentorship sessions, and community programs.
            </p>

            <div className="mt-6 grid md:grid-cols-3 gap-5">
              {[
                { title: "Education Support", desc: "Mentorship + study material distribution drives." },
                { title: "Health Camps", desc: "Awareness sessions & health checkups for families." },
                { title: "Skill Development", desc: "Training programs for employability & growth." },
              ].map((x) => (
                <div key={x.title} className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h3 className="font-extrabold text-[#0F172A]">{x.title}</h3>
                  <p className="text-gray-600 mt-2">{x.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="rounded-full bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold">
                <Link href="/donate">Donate to Increase Impact</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/volunteer">Join Volunteer Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   BLOG PAGE ✅ (Supabase Published)
========================================================= */
export function BlogPage() {
  const [items, setItems] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await supabaseBlogs.getPublished();
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="py-16 bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-5xl font-extrabold text-[#0F172A]">Blog & Updates</h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Latest announcements, updates, community work and NGO stories.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6">
          {loading ? (
            <p className="text-gray-600">Loading blogs...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-600">No published blogs found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((b) => (
                <Card key={b.id} className="neo-card hover-3d overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] overflow-hidden">
                    {b.cover_image ? (
                      <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold opacity-80">
                        Blog Post
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="bg-[#1D4ED8]/10 text-[#1D4ED8]">
                        {b.category || "General"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#0F172A] mt-3 line-clamp-2">
                      {b.title}
                    </h3>

                    <p className="text-gray-600 mt-2 line-clamp-3">
                      {b.meta_description || b.content?.substring(0, 140)}
                    </p>

                    <Button asChild variant="outline" className="mt-5 rounded-full">
                      <Link href="/contact">Contact / Collaborate</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   CONTACT PAGE ✅
========================================================= */
 export function ContactPage()  {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill Name, Email and Message");
      return;
    }

    setLoading(true);
    try {
      await supabaseContact.create({ name, email, phone, subject, message });

      toast.success("✅ Message sent successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold text-center mb-8" style={{ fontFamily: "Poppins, sans-serif" }}>
        Contact Us
      </h1>

      <p className="text-center text-xl text-gray-600 max-w-2xl mx-auto mb-12" style={{ fontFamily: "Inter, sans-serif" }}>
        Get in touch with us. We'd love to hear from you.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div className="grid gap-6">
          <Card className="p-6 border-2 rounded-2xl">
            <CardContent className="p-0">
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-gray-600">info@thannmanngaadi.org</p>
            </CardContent>
          </Card>

          <Card className="p-6 border-2 rounded-2xl">
            <CardContent className="p-0">
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <p className="text-gray-600">+91 1234567890</p>
            </CardContent>
          </Card>

          <Card className="p-6 border-2 rounded-2xl">
            <CardContent className="p-0">
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <p className="text-gray-600">Kerala, India</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8 border-2 rounded-3xl">
          <CardContent className="p-0 space-y-4">
            <h2 className="text-2xl font-bold">Send Message</h2>

            <div>
              <Label>Full Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>

            <div>
              <Label>Email *</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Your email" />
            </div>

            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
            </div>

            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Optional" />
            </div>

            <div>
              <Label>Message *</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                className="w-full min-h-[130px] border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

 