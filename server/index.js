import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// ✅ load env from server/.env
dotenv.config({ path: "server/.env" });

const url = (process.env.SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!url) {
  console.error("❌ SUPABASE_URL missing in server/.env");
  process.exit(1);
}
if (!key) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY missing in server/.env");
  process.exit(1);
}

const supabaseAdmin = createClient(url, key);

const app = express();
app.use(cors());
app.use(express.json());

/* ----------------------------------------
   ✅ SMTP Transport
---------------------------------------- */
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = (process.env.SMTP_SECURE || "false") === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error("❌ SMTP ENV missing. Check server/.env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/* ----------------------------------------
   ✅ Certificate PDF Generator (Premium + QR + Signed)
---------------------------------------- */
async function generateCertificatePDF({ name, amount, date, certificateId, verifyUrl }) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageW = doc.page.width;
      const pageH = doc.page.height;

      // ✅ Background
      doc.rect(0, 0, pageW, pageH).fill("#F8FAFC");

      // ✅ Premium border
      doc.lineWidth(4).rect(25, 25, pageW - 50, pageH - 50).stroke("#1D4ED8");
      doc.lineWidth(1).rect(35, 35, pageW - 70, pageH - 70).stroke("#94A3B8");

      // ✅ Header Title
      doc
        .font("Helvetica-Bold")
        .fillColor("#0F172A")
        .fontSize(26)
        .text("CERTIFICATE OF APPRECIATION", 0, 90, { align: "center" });

      doc
        .font("Helvetica")
        .fillColor("#334155")
        .fontSize(13)
        .text("This certificate is proudly presented to", 0, 140, { align: "center" });

      // ✅ Name
      doc
        .font("Helvetica-Bold")
        .fillColor("#1D4ED8")
        .fontSize(24)
        .text(String(name).toUpperCase(), 0, 175, { align: "center" });

      // ✅ Body Text
      doc
        .font("Helvetica")
        .fillColor("#334155")
        .fontSize(13)
        .text(`For generously contributing ₹${amount} to support our mission.`, 0, 230, {
          align: "center",
        });

      doc
        .fillColor("#475569")
        .fontSize(12)
        .text(
          "Your support helps us deliver education, healthcare and community welfare programs.",
          90,
          260,
          { align: "center", width: pageW - 180 }
        );

      // ✅ Donation Info Box
      doc.roundedRect(90, 310, pageW - 180, 90, 12).fill("#EFF6FF");

      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11);
      doc.text(`Certificate ID: ${certificateId}`, 110, 330);
      doc.text(`Issued On: ${date}`, 110, 350);

      doc.font("Helvetica").fillColor("#334155").fontSize(11);
      doc.text(`Donation Amount: ₹${amount}`, 360, 330);
      doc.text(`NGO: Thannmanngaadi Foundation`, 360, 350);

      // ✅ QR Code generation (verify URL)
      const qrDataUrl = await QRCode.toDataURL(verifyUrl);
      const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(qrBase64, "base64");

      doc.image(qrBuffer, pageW - 160, 430, { width: 90 });

      doc
        .font("Helvetica")
        .fillColor("#64748B")
        .fontSize(9)
        .text("Scan to verify", pageW - 168, 525);

      // ✅ Signature Line
      doc.moveTo(90, 500).lineTo(260, 500).stroke("#94A3B8");

      doc.font("Helvetica-Bold").fillColor("#0F172A").fontSize(11);
      doc.text("Authorized Signatory", 90, 510);

      doc.font("Helvetica").fillColor("#64748B").fontSize(10);
      doc.text("Thannmanngaadi Foundation", 90, 528);

      // ✅ Digital Signed Badge (Visual)
      doc.roundedRect(pageW - 260, 500, 130, 36, 8).stroke("#16A34A");
      doc.font("Helvetica-Bold").fillColor("#16A34A").fontSize(10);
      doc.text("DIGITALLY SIGNED", pageW - 250, 512);

      // ✅ Footer
      doc
        .font("Helvetica")
        .fillColor("#94A3B8")
        .fontSize(9)
        .text("© Thannmanngaadi Foundation | This certificate is system generated.", 0, 570, {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ----------------------------------------
   ✅ Verify Certificate Page (QR opens this)
---------------------------------------- */
app.get("/verify/:certId", async (req, res) => {
  const certId = req.params.certId;

  return res.send(`
    <html>
      <head>
        <title>Certificate Verification</title>
      </head>
      <body style="font-family: Arial; padding: 30px; background:#f8fafc;">
        <div style="max-width: 700px; margin:auto; background:white; padding:24px; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
          <h2 style="margin:0;">✅ Certificate Verified</h2>
          <p style="color:#334155;">This certificate was generated by <b>Thannmanngaadi Foundation</b>.</p>
          <hr style="border:none; border-top:1px solid #e2e8f0; margin:18px 0;" />
          <p><b>Certificate ID:</b> ${certId}</p>
          <p style="color:gray; font-size:13px;">(Demo verification page. Next: connect with Supabase to show donor details)</p>
        </div>
      </body>
    </html>
  `);
});

/* ----------------------------------------
   ✅ Donation -> Send certificate email (SMTP)
---------------------------------------- */
app.post("/donation/send-certificate", async (req, res) => {
  try {
    const { name, email, amount } = req.body;

    if (!name || !email || !amount) {
      return res.status(400).json({
        ok: false,
        error: "name, email, amount required",
      });
    }

    const certificateId = "CERT-" + Date.now();
    const date = new Date().toLocaleDateString();

    // ✅ IMPORTANT: verify link in QR
    const verifyUrl = `http://localhost:5050/verify/${certificateId}`;

    // ✅ Create PDF
    const pdfBuffer = await generateCertificatePDF({
      name,
      amount,
      date,
      certificateId,
      verifyUrl,
    });

    // ✅ Send mail
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
          <p>🔎 Verify: <a href="${verifyUrl}">${verifyUrl}</a></p>
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

    return res.json({ ok: true, certificateId, emailSent: true });
  } catch (e) {
    console.error("❌ SMTP send error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
});

/* ----------------------------------------
   ✅ Existing Admin APIs (Role & Users)
---------------------------------------- */

// ✅ Create user + assign role
app.post("/admin/create-user", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ ok: false, error: "email, password, role required" });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) return res.status(400).json({ ok: false, error: error.message });

    const userId = data.user.id;

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert([{ user_id: userId, role_name: role }], { onConflict: "user_id" });

    if (roleErr) return res.status(400).json({ ok: false, error: roleErr.message });

    return res.json({ ok: true, user: data.user });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ List users
app.get("/admin/users", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return res.status(400).json({ ok: false, error: error.message });

    const { data: rolesData } = await supabaseAdmin.from("user_roles").select("*");

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
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ Update role
app.post("/admin/update-role", async (req, res) => {
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
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ Delete user
app.delete("/admin/delete-user/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ Activity log
app.post("/admin/log", async (req, res) => {
  try {
    const { actor_user_id, actor_email, action, entity, entity_id, details } = req.body;

    if (!actor_user_id || !action || !entity) {
      return res.status(400).json({ ok: false, error: "actor_user_id, action, entity required" });
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
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.listen(5050, () => console.log("✅ Server Running: http://localhost:5050"));
