import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";

import { supabaseAnnouncements } from "@/utils/supabaseApi";
import { logAction } from "@/utils/activityLog";

import {
  Megaphone,
  PlusCircle,
  RefreshCcw,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

type AnnouncementRow = {
  id: string;
  title: string;
  message: string;
  visibility: string; // home / all / etc.
  status: "draft" | "published";
  created_at: string;
};

export default function AdminAnnouncements() {
  const [items, setItems] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState("home");

  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await supabaseAnnouncements.getAll();
      setItems((data || []) as AnnouncementRow[]);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((a) => {
      return (
        a.title.toLowerCase().includes(query) ||
        a.message.toLowerCase().includes(query) ||
        (a.status || "").toLowerCase().includes(query) ||
        (a.visibility || "").toLowerCase().includes(query)
      );
    });
  }, [items, q]);

  async function createAnnouncement() {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and Message required");
      return;
    }

    try {
      const data = await supabaseAnnouncements.create({
        title,
        message,
        visibility,
      });

      await logAction({
        action: "CREATED",
        entity: "announcements",
        entity_id: data?.id || null,
        details: { title, visibility },
      });

      toast.success("✅ Announcement created (Draft)");
      setTitle("");
      setMessage("");
      setVisibility("home");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create announcement");
    }
  }

  async function publishAnnouncement(id: string) {
    try {
      await supabaseAnnouncements.publish(id);

      await logAction({
        action: "PUBLISHED",
        entity: "announcements",
        entity_id: id,
        details: { status: "published" },
      });

      toast.success("✅ Announcement published");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to publish");
    }
  }

  async function unpublishAnnouncement(id: string) {
    try {
      await supabaseAnnouncements.unpublish(id);

      await logAction({
        action: "UNPUBLISHED",
        entity: "announcements",
        entity_id: id,
        details: { status: "draft" },
      });

      toast.success("✅ Announcement unpublished");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to unpublish");
    }
  }

  async function removeAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;

    try {
      await supabaseAnnouncements.remove(id);

      await logAction({
        action: "DELETED",
        entity: "announcements",
        entity_id: id,
        details: {},
      });

      toast.success("✅ Announcement deleted");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete");
    }
  }

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Megaphone size={16} />
            Admin / Announcements
          </div>

          <h1
            className="text-3xl font-extrabold text-[#0F172A]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Announcements Manager
          </h1>

          <p className="text-gray-600 mt-1">
            Create announcements and publish them on the Home page banner.
          </p>
        </div>

        <Button onClick={load} variant="outline" className="rounded-full">
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Create Form */}
      <Card className="border-2 rounded-2xl bg-white mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <PlusCircle size={18} />
              Create Announcement
            </h2>

            <Badge className="bg-[#FBBF24] text-[#0F172A]">
              New announcements start as Draft
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <div className="md:col-span-1">
              <Label>Title</Label>
              <Input
                className="rounded-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Health Camp"
              />
            </div>

            <div className="md:col-span-1">
              <Label>Visibility</Label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="home">Home Banner</option>
                <option value="all">All Pages (optional)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <Label>Message</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement message..."
                className="w-full px-3 py-3 border rounded-xl min-h-[110px]"
              />
            </div>
          </div>

          <div className="mt-5">
            <Button
              onClick={createAnnouncement}
              className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
            >
              <PlusCircle size={16} className="mr-2" />
              Create Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mt-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="rounded-xl pl-9"
            placeholder="Search announcements..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <Card className="border-2 rounded-2xl bg-white mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">
              All Announcements ({filtered.length})
            </h2>

            <div className="text-xs text-gray-500">
              Publish दिखेगा Home पर ✅
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600 mt-4">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600 mt-4">No announcements found.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="p-5 border rounded-2xl bg-[#F8FAFC] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-extrabold text-[#0F172A] truncate">
                        {a.title}
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        {a.message}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        <Badge className="bg-white text-[#0F172A] border">
                          Visibility: {a.visibility}
                        </Badge>

                        {a.status === "published" ? (
                          <Badge className="bg-green-600">Published</Badge>
                        ) : (
                          <Badge className="bg-orange-500">Draft</Badge>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mt-3">
                        {new Date(a.created_at).toLocaleString()}
                      </div>

                      <div className="text-[11px] text-gray-400 mt-2 break-all">
                        ID: {a.id}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {a.status === "published" ? (
                        <Button
                          onClick={() => unpublishAnnouncement(a.id)}
                          variant="outline"
                          className="rounded-full"
                        >
                          <EyeOff size={16} className="mr-2" />
                          Unpublish
                        </Button>
                      ) : (
                        <Button
                          onClick={() => publishAnnouncement(a.id)}
                          className="rounded-full bg-[#1D4ED8] hover:bg-[#1e40af]"
                        >
                          <Eye size={16} className="mr-2" />
                          Publish
                        </Button>
                      )}

                      <Button
                        onClick={() => removeAnnouncement(a.id)}
                        variant="outline"
                        className="rounded-full border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
