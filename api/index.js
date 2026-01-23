import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

dotenv.config();

const app = express();

/* ---------------------------------------------
   ✅ Middlewares
---------------------------------------------- */
app.use(cors());
app.use(express.json());

/* ---------------------------------------------
   ✅ ENV
---------------------------------------------- */
const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

// SMTP ENV
const SMTP_HOST = (process.env.SMTP_HOST || "").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = (process.env.SMTP_SECURE || "false") === "true";
const SMTP_USER = (process.env.SMTP_USER || "").trim();
const SMTP_PASS = (process.env.SMTP_PASS || "").trim();
const FROM_EMAIL = (process.env.FROM_EMAIL || SMTP_USER).trim();

if (!SUPABASE_URL) console.error("❌ SUPABASE_URL missing");
if (!SUPABASE_SERVICE_ROLE_KEY) console.error("❌ SUPABASE_SERVICE_ROLE_KEY missing");

/* ---------------------------------------------
   ✅ Supabase Admin Client (Service Role)
---------------------------------------------- */
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/* ---------------------------------------------
   ✅ SMTP Transporter
---------------------------------------------- */
let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn("⚠️ SMTP ENV missing -> certificate email will not work");
}

/* ---------------------------------------------
   ✅ Health Check
---------------------------------------------- */
app.get("/api/health", async (req, res) => {
  return res.json({
    ok: true,
    message: "✅ API working",
    env: {
      SUPABASE_URL: !!SUPABASE_URL,
      SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
      SMTP_READY: !!transporter,
    },
  });
});

/* ---------------------------------------------
   ✅ PDF Certificate Generator (Buffer)
---------------------------------------------- */
function generateCertificatePDF({ name, amount, date, certificateId }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#F8FAFC");

      // Border
      doc
        .lineWidth(4)
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke("#1D4ED8");

      // Title
      doc
        .fillColor("#0F172A")
        .fontSize(28)
        .text("CERTIFICATE OF APPRECIATION", { align: "center" });

      doc.moveDown(1);

      // Subtitle
      doc
        .fillColor("#334155")
        .fontSize(14)
        .text("This certificate is proudly presented to", { align: "center" });

      doc.moveDown(0.8);

      // Name
      doc
        .fillColor("#1D4ED8")
        .fontSize(24)
        .text(name, { align: "center" });

      doc.moveDown(1);

      // Donation line
      doc
        .fillColor("#334155")
        .fontSize(14)
        .text(`For generously donating ₹${amount}`, { align: "center" });

      doc.moveDown(0.6);

      doc
        .fillColor("#475569")
        .fontSize(13)
        .text(
          "Your contribution helps us create real impact through community programs.",
          { align: "center" }
        );

      doc.moveDown(2);

      // Details
      doc.fillColor("#0F172A").fontSize(12).text(`Certificate ID: ${certificateId}`, {
        align: "center",
      });

      doc
        .fillColor("#0F172A")
        .fontSize(12)
        .text(`Date: ${date}`, { align: "center" });

      doc.moveDown(2);

      // Footer
      doc
        .fillColor("#334155")
        .fontSize(12)
        .text("Thannmanngaadi Foundation", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ---------------------------------------------
   ✅ Donation -> Send Certificate Email (SMTP)
---------------------------------------------- */
app.post("/api/donation/send-certificate", async (req, res) => {
  try {
    const { name, email, amount } = req.body;

    if (!name || !email || !amount) {
      return res.status(400).json({
        ok: false,
        error: "name, email, amount required",
      });
    }

    if (!transporter) {
      return res.status(500).json({
        ok: false,
        error: "SMTP not configured in env",
      });
    }

    const certificateId = "CERT-" + Date.now();
    const date = new Date().toLocaleDateString("en-IN");

    const pdfBuffer = await generateCertificatePDF({
      name,
      amount,
      date,
      certificateId,
    });

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Thank you for your donation ❤️ (Certificate Attached)",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Thank you, ${name}! 🙏</h2>
          <p>We received your donation of <b>₹${amount}</b>.</p>
          <p>Your donation helps us create real impact in communities.</p>
          <p><b>Certificate ID:</b> ${certificateId}</p>
          <p>✅ Your donation certificate is attached with this email.</p>
          <br/>
          <p>Regards,<br/><b>Thannmanngaadi Foundation</b></p>
        </div>
      `,
      attachments: [
        {
          filename: `Donation-Certificate-${certificateId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return res.json({
      ok: true,
      emailSent: true,
      certificateId,
    });
  } catch (e) {
    console.error("❌ send certificate error:", e);
    return res.status(500).json({
      ok: false,
      error: e?.message || "Server error",
    });
  }
});

/* ---------------------------------------------
   ✅ ADMIN: Create user + assign role
---------------------------------------------- */
app.post("/api/admin/create-user", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        ok: false,
        error: "email, password, role required",
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({ ok: false, error: error.message });
    }

    const userId = data.user.id;

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert([{ user_id: userId, role_name: role }], {
        onConflict: "user_id",
      });

    if (roleErr) {
      return res.status(400).json({ ok: false, error: roleErr.message });
    }

    return res.json({ ok: true, user: data.user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/* ---------------------------------------------
   ✅ ADMIN: List users + roles
---------------------------------------------- */
app.get("/api/admin/users", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return res.status(400).json({ ok: false, error: error.message });

    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("*");

    if (rolesError) {
      return res.status(400).json({ ok: false, error: rolesError.message });
    }

    const users = (data.users || []).map((u) => {
      const roleRow = rolesData?.find((r) => r.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        role: roleRow?.role_name || "none",
      };
    });

    return res.json({ ok: true, users });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/* ---------------------------------------------
   ✅ ADMIN: Update role
---------------------------------------------- */
app.post("/api/admin/update-role", async (req, res) => {
  try {
    const { user_id, role } = req.body;

    if (!user_id || !role) {
      return res.status(400).json({ ok: false, error: "user_id and role required" });
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert([{ user_id, role_name: role }], { onConflict: "user_id" });

    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/* ---------------------------------------------
   ✅ ADMIN: Delete user
---------------------------------------------- */
app.delete("/api/admin/delete-user/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/* ---------------------------------------------
   ✅ ADMIN: Activity log
---------------------------------------------- */
app.post("/api/admin/log", async (req, res) => {
  try {
    const { actor_user_id, actor_email, action, entity, entity_id, details } = req.body;

    if (!actor_user_id || !action || !entity) {
      return res.status(400).json({
        ok: false,
        error: "actor_user_id, action, entity required",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("admin_logs")
      .insert([
        {
          actor_user_id,
          actor_email: actor_email || null,
          action,
          entity,
          entity_id: entity_id || null,
          details: details || {},
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.json({ ok: true, log: data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/* ---------------------------------------------
   ✅ Vercel export (IMPORTANT)
---------------------------------------------- */
export default app;
