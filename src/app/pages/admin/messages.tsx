import { useEffect, useMemo, useState } from "react";
import { UserCog } from "lucide-react";

import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Heart,
  Briefcase,
  Users,
  DollarSign,
  MessageSquare,
} from "lucide-react";

import { supabaseContact } from "@/utils/supabaseApi";
import { useRouter } from "@/app/components/router";

type Msg = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", route: "/admin/dashboard" },
  { id: "announcements", icon: Megaphone, label: "Announcements", route: "/admin/announcements" },
  { id: "blogs", icon: FileText, label: "Blogs", route: "/admin/blogs" },
  { id: "programs", icon: Heart, label: "Programs", route: "/admin/programs" },
  { id: "internships", icon: Briefcase, label: "Internships", route: "/admin/internships" },
  { id: "volunteers", icon: Users, label: "Volunteers", route: "/admin/volunteers" },
  { id: "donations", icon: DollarSign, label: "Donations", route: "/admin/donations" },
  { id: "messages", icon: MessageSquare, label: "Messages", route: "/admin/messages" },
  { id: "users", icon: UserCog, label: "Users & Roles", route: "/admin/users" },

];

export default function AdminMessages() {
  const { navigate } = useRouter();

  const [items, setItems] = useState<Msg[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [summary, setSummary] = useState("");
  const [query, setQuery] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  async function load() {
    const data = await supabaseContact.getAll();
    setItems(data || []);
  }

  useEffect(() => {
    console.log("OpenRouter key:", OPENROUTER_KEY);
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [items, query]);

  const selected = items.find((x) => x.id === selectedId);

  async function aiCall(prompt: string) {
    try {
      setLoadingAI(true);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "NGO Admin Panel",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();

      console.log("AI RESPONSE:", data);

      setLoadingAI(false);

      if (data.error) {
        alert("AI Error: " + data.error.message);
        return "";
      }

      return data?.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error(err);
      setLoadingAI(false);
      alert("AI request failed");
      return "";
    }
  }

  async function summarize() {
    if (!selected) return;
    const text = await aiCall(`Summarize this NGO message in 1 sentence:\n${selected.message}`);
    setSummary(text);
  }

  async function suggestReply() {
    if (!selected) return;
    const text = await aiCall(`Write a warm professional NGO reply:\n${selected.message}`);
    setReply(text);
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;

    await fetch("http://localhost:5050/admin/reply-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: selected.email,
        name: selected.name,
        message: reply,
      }),
    });

    alert("Reply sent!");
    setReply("");
  }

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">

        <div className="p-6 text-xl font-bold border-b border-slate-700">
          NGO Admin
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === "messages";

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? "bg-blue-600"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Layout */}
      <div className="flex flex-1 bg-gray-100">

        {/* Inbox */}
        <aside className="w-96 bg-white border-r flex flex-col">

          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">AI Inbox</h2>

            <input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-3 w-full border p-2 rounded"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                  selectedId === m.id ? "bg-blue-50" : ""
                }`}
              >
                <b>{m.name}</b>
                <p className="text-xs text-gray-500">{m.email}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Panel */}
        <main className="flex-1 p-8 flex flex-col">

          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a message
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow flex flex-col flex-1">

              <h3 className="font-semibold text-lg">{selected.name}</h3>
              <p className="text-sm text-gray-500">{selected.email}</p>

              <div className="mt-4 bg-gray-100 p-4 rounded">
                {selected.message}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={summarize}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  AI Summary
                </button>

                <button
                  onClick={suggestReply}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  Suggest Reply
                </button>
              </div>

              {loadingAI && <p className="mt-2 text-sm">AI thinking...</p>}

              {summary && (
                <div className="mt-3 p-3 bg-yellow-100 rounded text-sm">
                  <b>Summary:</b> {summary}
                </div>
              )}

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply..."
                className="border mt-4 p-3 rounded h-32"
              />

              <button
                onClick={sendReply}
                className="bg-blue-600 text-white mt-3 px-4 py-2 rounded"
              >
                Send Reply
              </button>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
