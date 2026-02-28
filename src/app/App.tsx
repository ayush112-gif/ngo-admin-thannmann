import { Router, useRouter } from "@/app/components/router";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Toaster } from "@/app/components/ui/sonner";

import { HomePage } from "@/app/pages/home";
import { AboutPage } from "@/app/pages/about";
import  DonatePage  from "@/app/pages/donate";
import { HallOfFamePage } from "@/app/pages/halloffame";

import VolunteerPage from "@/app/pages/volunteer";
import { ProgramsPage } from "@/app/pages/programs";
import { InternshipsPage } from "@/app/pages/internships";
import { BlogPage } from "@/app/pages/blog";
import { BlogDetailsPage } from "@/app/pages/blogDetails";

import { AdminLoginPage } from "@/app/pages/admin/login";
import { AdminDashboard } from "@/app/pages/admin/dashboard";
import AdminAnnouncements from "@/app/pages/admin/announcements";
import AdminBlogs from "@/app/pages/admin/blogs";
import AdminDonations from "@/app/pages/admin/donations";
import AdminVolunteers from "@/app/pages/admin/volunteers";
import AdminPrograms from "@/app/pages/admin/programs";
import AdminInternships from "@/app/pages/admin/internships";
import AdminMessages from "@/app/pages/admin/messages";
import AdminUsers from "@/app/pages/admin/users";

function AppContent() {
  const { currentPath } = useRouter();

  // ADMIN ROUTES
  if (currentPath.startsWith("/admin")) {
    switch (currentPath) {
      case "/admin":
      case "/admin/login":
        return <AdminLoginPage />;
      case "/admin/dashboard":
        return <AdminDashboard />;
      case "/admin/announcements":
        return <AdminAnnouncements />;
      case "/admin/blogs":
        return <AdminBlogs />;
      case "/admin/donations":
        return <AdminDonations />;
      case "/admin/volunteers":
        return <AdminVolunteers />;
      case "/admin/programs":
        return <AdminPrograms />;
      case "/admin/internships":
        return <AdminInternships />;
      case "/admin/messages":
        return <AdminMessages />;
      case "/admin/users":
        return <AdminUsers />;
      default:
        return <AdminDashboard />;
    }
  }

  // BLOG DETAILS
  if (currentPath.startsWith("/blog/")) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <BlogDetailsPage />
        </main>
        <Footer />
      </div>
    );
  }

  // PUBLIC ROUTES
  let PageComponent = HomePage;

  switch (currentPath) {
    case "/":
      PageComponent = HomePage;
      break;
    case "/about":
      PageComponent = AboutPage;
      break;
    case "/programs":
      PageComponent = ProgramsPage;
      break;
    case "/volunteer":
      PageComponent = VolunteerPage;
      break;
    case "/internships":
      PageComponent = InternshipsPage;
      break;
    case "/donate":
      PageComponent = DonatePage;
      break;
    case "/blog":
      PageComponent = BlogPage;
      break;
    case "/hall-of-fame":
      PageComponent = HallOfFamePage;
      break;
    default:
      PageComponent = HomePage;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageComponent />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Inter, sans-serif" }}>
        <AppContent />
        <Toaster />
      </div>
    </Router>
  );
}