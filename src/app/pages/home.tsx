import { useEffect, useMemo, useState } from "react";
import { Link } from "@/app/components/router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

import {
  Megaphone,
  Users,
  Heart,
  Award,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HandHeart,
  GraduationCap,
  Stethoscope,
  Leaf,
  Wrench,
  UserCheck,
  CalendarDays,
  Flame,
  Target,
  Crown,
  Send,
  Quote,
} from "lucide-react";

import {
  supabaseAnnouncements,
  supabasePrograms,
  supabaseBlogs,
} from "@/utils/supabaseApi";

type AnnouncementRow = {
  id: string;
  title: string;
  message: string;
  visibility: string;
  status: "draft" | "published";
  created_at: string;
};

type ProgramRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
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

function formatDate(dt: string) {
  try {
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dt;
  }
}

function clampText(text: string, len = 140) {
  if (!text) return "";
  return text.length > len ? text.slice(0, len) + "..." : text;
}

export function HomePage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // ✅ Announcement slider features
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [openAnnouncement, setOpenAnnouncement] = useState<AnnouncementRow | null>(null);

  // ✅ Fake dynamic campaign progress (owner likes this look)
  const campaignGoal = 100000;
  const [campaignRaised, setCampaignRaised] = useState(45500);

  // ✅ Volunteer mini CTA form (front page)
  const [vName, setVName] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vCity, setVCity] = useState("");

  useEffect(() => {
    loadHomeData();
  }, []);

  async function loadHomeData() {
    setLoading(true);
    try {
      const [a, p, b] = await Promise.all([
        supabaseAnnouncements.getPublishedForHome(),
        supabasePrograms.getPublished(),
        supabaseBlogs.getPublished(),
      ]);

      setAnnouncements(a || []);
      setPrograms(p || []);
      setBlogs((b || []).slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Rotate announcements one-by-one
  useEffect(() => {
    if (announcements.length <= 1) return;

    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % announcements.length);
    }, 4500);

    return () => clearInterval(t);
  }, [announcements]);

  const categories = useMemo(
    () => [
      "All",
      "Education",
      "Health",
      "Environment",
      "Women Empowerment",
      "Skill Development",
      "Community Welfare",
    ],
    []
  );

  const categoryIcons: Record<string, any> = {
    education: GraduationCap,
    health: Stethoscope,
    environment: Leaf,
    "women empowerment": Heart,
    "skill development": Wrench,
    "community welfare": HandHeart,
  };

  const filteredPrograms = useMemo(() => {
    if (selectedCategory === "All") return programs;
    const want = selectedCategory.toLowerCase().trim();
    return programs.filter((p) => p.category?.toLowerCase().trim() === want);
  }, [programs, selectedCategory]);

  // ✅ Feature: Highlight 1 featured program
  const featuredProgram = useMemo(() => {
    if (!programs?.length) return null;
    // pick first for now (later you can choose by "featured" column)
    return programs[0];
  }, [programs]);

  const trustIndicators = [
    {
      icon: Shield,
      label: "Transparent Work",
      desc: "Clear operations, honest impact reports",
    },
    {
      icon: Users,
      label: "Community First",
      desc: "People are at the heart of every mission",
    },
    {
      icon: TrendingUp,
      label: "Real Impact",
      desc: "Measurable change, not just promises",
    },
  ];

  const impactStats = [
    { icon: Users, label: "Lives Impacted", value: "10,000+" },
    { icon: UserCheck, label: "Volunteers", value: "500+" },
    { icon: Award, label: "Programs", value: "25+" },
    { icon: Heart, label: "Events Conducted", value: "100+" },
  ];

  const campaignProgress = Math.min(100, Math.round((campaignRaised / campaignGoal) * 100));

  async function quickVolunteerSubmit() {
    // this is temporary UI only (backend add later)
    if (!vName.trim() || !vEmail.trim()) {
      alert("Please enter Name & Email");
      return;
    }
    alert("✅ Volunteer request received! (demo)");
    setVName("");
    setVEmail("");
    setVCity("");
  }

  return (
    <div className="bg-[#F8FAFC]">
      {/* ✅ Announcement Banner (Slider) */}
      {announcements.length > 0 && (
        <div className="relative overflow-hidden bg-[#050B1F] text-white py-4">
          <div className="absolute inset-0 soft-glow opacity-85" />
          <div className="relative container mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-sm">
              <Megaphone size={18} />
              <span key={tickerIndex} className="announcement-slide-in" style={{ fontFamily: "Inter, sans-serif", display: 'inline-block' }}>
                <b>{announcements[tickerIndex]?.title}</b> —{" "}
                {announcements[tickerIndex]?.message}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-100 hidden md:flex items-center gap-1">
                <CalendarDays size={14} />
                {formatDate(announcements[tickerIndex]?.created_at || "")}
              </span>

              <Button
                size="sm"
                variant="outline"
                className="border-[#38BDF8]/40 text-[#38BDF8] bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 rounded-full"
                onClick={() => setOpenAnnouncement(announcements[tickerIndex])}
              >
                Open
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-[#38BDF8]/40 text-[#38BDF8] bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 rounded-full"
                onClick={() => setShowAllAnnouncements(true)}
              >
                View All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Announcement Single Modal */}
      {openAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpenAnnouncement(null)}
          />
          <div className="relative bg-white max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#0F172A]">
                Announcement
              </h2>
              <button
                onClick={() => setOpenAnnouncement(null)}
                className="text-xl font-bold text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <CalendarDays size={14} />
                {formatDate(openAnnouncement.created_at)}
              </div>

              <h3 className="text-2xl font-extrabold mt-2 text-[#0F172A]">
                {openAnnouncement.title}
              </h3>

              <p className="text-gray-700 mt-3 leading-relaxed">
                {openAnnouncement.message}
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <Button
                  asChild
                  className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
                >
                  <Link href="/donate">Support This Cause</Link>
                </Button>

                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setOpenAnnouncement(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ All Announcements Popup */}
      {showAllAnnouncements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowAllAnnouncements(false)}
          />
          <div className="relative bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-[#0F172A]">
                All Announcements
              </h2>
              <button
                onClick={() => setShowAllAnnouncements(false)}
                className="text-xl font-bold text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-auto space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="border rounded-xl p-4">
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <CalendarDays size={14} />
                    {formatDate(a.created_at)}
                  </div>
                  <h3 className="font-bold text-lg mt-1 text-[#0F172A]">
                    {a.title}
                  </h3>
                  <p className="text-gray-700 mt-1">{a.message}</p>

                  <div className="mt-3">
                    <Button
                      size="sm"
                      className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
                      onClick={() => setOpenAnnouncement(a)}
                    >
                      Open Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-gray-50 text-right">
              <Button
                onClick={() => setShowAllAnnouncements(false)}
                className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ HERO */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-[#050B1F] text-white">
        <div className="absolute inset-0 opacity-80 soft-glow" />
        <div className="absolute -top-28 -left-24 w-[420px] h-[420px] rounded-full bg-[#38BDF8]/20 blur-3xl" />
        <div className="absolute top-12 -right-24 w-[520px] h-[520px] rounded-full bg-[#1D4ED8]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[520px] h-[520px] rounded-full bg-[#FBBF24]/15 blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Sparkles size={16} />
                <span className="text-sm text-blue-100">
                  Trusted NGO • Real Impact • Transparent Work
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Creating Change Through{" "}
                <span className="text-[#38BDF8]">Compassion</span> &{" "}
                <span className="text-[#FBBF24]">Action</span>
              </h1>

              <p className="text-lg md:text-xl mt-6 text-blue-100 max-w-xl">
                Help us build better lives through education, healthcare, community upliftment,
                and sustainable initiatives.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold shadow-lg hover:shadow-2xl transition"
                >
                  <Link href="/donate">Donate Now</Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-white/30 text-white bg-white/10 hover:bg-white/15"
                >
                  <Link href="/volunteer">Join as Volunteer</Link>
                </Button>
              </div>

              {/* ✅ Live Campaign Bar */}
              <div className="mt-10 glass rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-blue-100 flex items-center gap-2">
                      <Target size={16} />
                      Live Campaign Goal
                    </div>
                    <div className="text-xl font-extrabold mt-1">
                      ₹{campaignRaised.toLocaleString()}{" "}
                      <span className="text-blue-100 text-sm font-medium">
                        raised of ₹{campaignGoal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-blue-100">Progress</div>
                    <div className="text-2xl font-extrabold">{campaignProgress}%</div>
                  </div>
                </div>

                <div className="mt-4 w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#FBBF24]"
                    style={{ width: `${campaignProgress}%` }}
                  />
                </div>

                <div className="mt-4 flex gap-3 flex-wrap">
                  <Button
                    size="sm"
                    className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
                    onClick={() => setCampaignRaised((x) => x + 250)}
                  >
                    +₹250 Demo Boost
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15"
                  >
                    <Link href="/donate">Support Campaign</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass rounded-3xl p-5 hover-3d">
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1562709911-a355229de124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt="Volunteers helping community"
                    className="w-full h-auto scale-[1.02]"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="glass rounded-2xl p-4">
                    <div className="text-sm text-blue-100 flex items-center gap-2">
                      <Flame size={16} />
                      Trending Drive
                    </div>
                    <div className="text-lg font-bold mt-1">Education Support</div>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <div className="text-sm text-blue-100 flex items-center gap-2">
                      <Crown size={16} />
                      Verified NGO
                    </div>
                    <div className="text-lg font-bold mt-1">Trusted Work</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#38BDF8]/30 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Trust + Social Proof */}
      <section className="py-10 bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "4.9/5", desc: "Community Rating", icon: Quote },
              { title: "100% Secure", desc: "Donation Tracking", icon: Shield },
              { title: "Verified", desc: "Transparent Reports", icon: TrendingUp },
              { title: "500+", desc: "Active Volunteers", icon: Users },
            ].map((x) => {
              const Icon = x.icon;
              return (
                <div key={x.title} className="neo-card hover-3d p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8]/10 flex items-center justify-center">
                    <Icon className="text-[#1D4ED8]" size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-[#0F172A]">{x.title}</div>
                    <div className="text-sm text-gray-600">{x.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ✅ Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {trustIndicators.map((x, i) => {
              const Icon = x.icon;
              return (
                <div key={i} className="neo-card p-6 hover-3d flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8]/10 flex items-center justify-center">
                    <Icon className="text-[#1D4ED8]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A]">{x.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{x.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ✅ Impact Stats */}
      <section className="py-14 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((x, i) => {
              const Icon = x.icon;
              return (
                <Card key={i} className="neo-card hover-3d">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#1D4ED8]/10">
                      <Icon className="text-[#1D4ED8]" size={30} />
                    </div>
                    <div className="text-3xl font-extrabold text-[#0F172A]">{x.value}</div>
                    <div className="text-sm text-gray-600 mt-2">{x.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ✅ Featured Program Spotlight */}
      {featuredProgram && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="neo-card hover-3d overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 p-8 items-center">
                <div>
                  <Badge className="bg-[#FBBF24] text-[#0F172A]">Featured Program</Badge>
                  <h2 className="text-4xl font-extrabold text-[#0F172A] mt-4">
                    {featuredProgram.title}
                  </h2>
                  <p className="text-gray-600 mt-4 text-lg">
                    {clampText(featuredProgram.description, 230)}
                  </p>

                  <div className="mt-6 flex gap-3 flex-wrap">
                    <Button
                      asChild
                      className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
                    >
                      <Link href="/programs">Explore Programs</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full"
                    >
                      <Link href="/donate">Support This Program</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8]">
                  {featuredProgram.image_url ? (
                    <img
                      src={featuredProgram.image_url}
                      alt={featuredProgram.title}
                      className="w-full h-72 object-cover"
                    />
                  ) : (
                    <div className="w-full h-72 flex items-center justify-center text-white font-extrabold text-xl">
                      Program Spotlight
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ✅ Programs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#0F172A]">Our Programs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-3">
              Making a difference through targeted initiatives across sectors.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`rounded-full px-5 ${
                  selectedCategory === cat
                    ? "bg-[#1D4ED8] text-white hover:bg-[#1e40af]"
                    : "bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Loading programs...</p>
          ) : filteredPrograms.length === 0 ? (
            <p className="text-center text-gray-600">No published programs available.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.slice(0, 6).map((p) => {
                const IconComponent =
                  categoryIcons[p.category?.toLowerCase()] || Heart;

                return (
                  <Card key={p.id} className="neo-card hover-3d overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] relative">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IconComponent size={64} className="text-white opacity-70" />
                        </div>
                      )}

                      <Badge className="absolute top-4 right-4 bg-[#FBBF24] text-[#0F172A]">
                        {p.category}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-extrabold text-[#0F172A]">
                        {p.title}
                      </h3>
                      <p className="text-gray-600 mt-2 line-clamp-2">
                        {p.description}
                      </p>

                      <Button
                        asChild
                        variant="ghost"
                        className="text-[#1D4ED8] hover:text-[#1e40af] p-0 h-auto font-semibold mt-4"
                      >
                        <Link href="/programs" className="flex items-center gap-2">
                          Learn More <ArrowRight size={16} />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white"
            >
              <Link href="/programs">View All Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ✅ NGO Journey Timeline */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-[#0F172A]">Our Journey</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              How we create impact step-by-step with real community action.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Identify Needs", desc: "We survey communities and prioritize urgent problems." },
              { title: "Plan Campaign", desc: "We design programs & gather volunteers/resources." },
              { title: "Execute Drive", desc: "We run on-ground drives with transparency." },
              { title: "Publish Updates", desc: "We share results, photos & measurable outcomes." },
            ].map((x, i) => (
              <div key={i} className="neo-card hover-3d p-7">
                <div className="text-xs text-gray-500">Step {i + 1}</div>
                <h3 className="text-lg font-extrabold text-[#0F172A] mt-2">{x.title}</h3>
                <p className="text-gray-600 mt-2">{x.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Volunteer Quick Form CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="neo-card hover-3d p-8 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-[#0F172A]">
                Become a Volunteer
              </h2>
              <p className="text-gray-600 mt-3 text-lg">
                Fill quick details & our team will contact you with next steps.
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <Button asChild className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]">
                  <Link href="/volunteer">Go to Full Volunteer Page</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/contact">Talk to Us</Link>
                </Button>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-6 border">
              <div className="font-extrabold text-[#0F172A] text-lg">Quick Form</div>

              <div className="mt-4 grid gap-3">
                <input
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                  placeholder="Full Name *"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                />
                <input
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                  placeholder="Email *"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                />
                <input
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                  placeholder="City"
                  value={vCity}
                  onChange={(e) => setVCity(e.target.value)}
                />

                <Button
                  onClick={quickVolunteerSubmit}
                  className="rounded-full bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-extrabold"
                >
                  <Send size={16} className="mr-2" />
                  Submit
                </Button>

                <p className="text-xs text-gray-500">
                  *Demo form (backend connect later)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Latest Updates (Blogs) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-10 flex-wrap gap-3">
            <div>
              <h2 className="text-4xl font-extrabold text-[#0F172A]">Latest Updates</h2>
              <p className="text-gray-600 mt-2">Stories, news and field updates.</p>
            </div>

            <Button asChild variant="outline" className="rounded-full">
              <Link href="/blog">View All</Link>
            </Button>
          </div>

          {blogs.length === 0 ? (
            <p className="text-gray-600">No blog posts published yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.map((b) => (
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
                    <div className="flex items-center justify-between">
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

                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {b.meta_description || b.content?.substring(0, 110)}
                    </p>

                    <Button
                      asChild
                      variant="ghost"
                      className="text-[#1D4ED8] hover:text-[#1e40af] p-0 h-auto mt-4 font-semibold"
                    >
                      <Link href="/blog" className="flex items-center gap-2">
                        Read More <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ Final CTA */}
      <section className="py-16 bg-[#050B1F] text-white relative overflow-hidden">
        <div className="absolute inset-0 soft-glow opacity-90" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto glass rounded-3xl p-10 hover-3d">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Ready to make a real difference?
            </h2>
            <p className="text-blue-100 mt-3 text-lg">
              Your donation and support helps us deliver education, healthcare
              and sustainable change.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold"
              >
                <Link href="/donate">Support Now</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>

          <p className="mt-8 text-xs text-blue-200/70">
            © {new Date().getFullYear()} Thannmanngaadi Foundation • Built with love.
          </p>
        </div>
      </section>

      {/* ✅ Floating WhatsApp Button */}
      <a
        href="https://wa.me/911234567890"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 neo-card hover-3d px-5 py-3 flex items-center gap-3"
      >
        <span className="w-3 h-3 rounded-full bg-green-500"></span>
        <span className="font-bold text-[#0F172A]">WhatsApp</span>
      </a>
    </div>
  );
}
