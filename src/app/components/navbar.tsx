import { useEffect, useState } from "react";
import { Link, useRouter } from "@/app/components/router";
import { Button } from "@/app/components/ui/button";
import { Heart, Menu, X } from "lucide-react";

export function Navbar() {
  const { currentPath, navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Programs", href: "/programs" },
    { label: "Volunteer", href: "/volunteer" },
    { label: "Internships", href: "/internships" },
    { label: "Impact", href: "/impact" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  function isActive(href: string) {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? "backdrop-blur-xl bg-white/70 shadow-md" : "bg-transparent"
      }`}
      style={{ borderBottom: scrolled ? "1px solid rgba(15,23,42,0.08)" : "none" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            className="flex items-center gap-2 select-none"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] flex items-center justify-center shadow-lg">
              <Heart className="text-white" size={18} />
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-extrabold text-[#0F172A]">
                Thannmanngaadi
              </div>
              <div className="text-[11px] text-gray-500 -mt-0.5">
                Foundation
              </div>
            </div>
          </button>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  isActive(l.href)
                    ? "bg-[#1D4ED8] text-white shadow"
                    : "text-[#0F172A] hover:bg-[#0F172A]/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              className="rounded-full bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold"
            >
              <Link href="/donate">Donate</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-[#1D4ED8]/30 text-[#1D4ED8]"
            >
              <Link href="/admin">Admin</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-black/5"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-5">
            <div className="mt-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg p-3">
              <div className="grid gap-2">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive(l.href)
                        ? "bg-[#1D4ED8] text-white"
                        : "text-[#0F172A] hover:bg-[#0F172A]/5"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    asChild
                    className="rounded-xl bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0F172A] font-bold"
                  >
                    <Link href="/donate" onClick={() => setOpen(false)}>
                      Donate
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      Admin
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
