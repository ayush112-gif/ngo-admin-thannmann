import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/* ----------------------------------------
   ENV
---------------------------------------- */
dotenv.config({ path: "server/.env" });

const url = (process.env.SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!url || !key) {
  console.error("❌ Supabase ENV missing");
  process.exit(1);
}

const supabaseAdmin = createClient(url, key);

/* ----------------------------------------
   EXPRESS
---------------------------------------- */
const app = express();
app.use(cors());
app.use(express.json());

/* ----------------------------------------
   SMTP
---------------------------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ SMTP ERROR:", err.message);
  else console.log("✅ SMTP READY");
});

/* ----------------------------------------
   PREMIUM PDF CERTIFICATE (V2)
---------------------------------------- */
async function generateCertificatePDF({
  name,
  amount,
  date,
  certificateId,
  verifyUrl,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const w = doc.page.width;
      const h = doc.page.height;

      // Background
      doc.rect(0, 0, w, h).fill("#F8FAFC");

      // Double Border (luxury)
      doc.lineWidth(4).rect(28, 28, w - 56, h - 56).stroke("#1D4ED8");
      doc.lineWidth(1).rect(38, 38, w - 76, h - 76).stroke("#CBD5E1");

      // Title
      doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#0F172A")
        .text("CERTIFICATE OF APPRECIATION", 0, 95, { align: "center" });

      doc
        .moveDown(0.3)
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#475569")
        .text("This certificate is proudly awarded to", { align: "center" });

      // Name
      doc
        .moveDown(1)
        .font("Helvetica-Bold")
        .fontSize(26)
        .fillColor("#1D4ED8")
        .text(name.toUpperCase(), { align: "center" });

      // Body
      doc
        .moveDown(1)
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#334155")
        .text(
          `In sincere recognition of your generous contribution of ₹${amount}.
Your support strengthens our commitment to advancing education,
healthcare, and community welfare initiatives.`,
          90,
          250,
          { width: w - 180, align: "center" }
        );

      // Info Panel
      doc.roundedRect(100, 345, w - 200, 90, 14).fill("#EFF6FF");

      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11);
      doc.text(`Certificate ID: ${certificateId}`, 120, 365);
      doc.text(`Date of Issue: ${date}`, 120, 385);
      doc.text(`Issued By: Thannmanngaadi Foundation`, 120, 405);

      // QR
      const qr = await QRCode.toDataURL(verifyUrl);
      const qrBuf = Buffer.from(qr.split(",")[1], "base64");
      doc.image(qrBuf, w - 175, 460, { width: 90 });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#64748B")
        .text("Scan to verify authenticity", w - 190, 555);

      // Signature
      doc.moveTo(100, 515).lineTo(260, 515).stroke("#94A3B8");

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#0F172A")
        .text("Authorized Signatory", 100, 525);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#64748B")
        .text("Thannmanngaadi Foundation", 100, 542);

      // Footer
      doc
        .font("Helvetica-Oblique")
        .fontSize(9)
        .fillColor("#64748B")
        .text(
          "This is a digitally generated certificate and is valid without a physical signature.",
          0,
          575,
          { align: "center" }
        );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/* ----------------------------------------
   SEND CERTIFICATE EMAIL (ENTERPRISE STYLE)
---------------------------------------- */
app.post("/donation/send-certificate", async (req, res) => {
  try {
    const { name, email, amount } = req.body;
    if (!name || !email || !amount)
      return res.status(400).json({ ok: false });

    const certificateId = "CERT-" + Date.now();
    const date = new Date().toLocaleDateString();
    const verifyUrl = `https://ngo-admin-thannmann.onrender.com/verify/${certificateId}`;

    const pdf = await generateCertificatePDF({
      name,
      amount,
      date,
      certificateId,
      verifyUrl,
    });
// 🔔 ADMIN NOTIFICATION INSERT
await supabaseAdmin.from("admin_notifications").insert([
  {
    type: "donation",
    title: "New Donation",
    message: `₹${amount} donated by ${name}`,
  },
]);

    await transporter.sendMail({
      from: `"Thannmanngaadi Foundation" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Official Donation Acknowledgement & Certificate",
      html: `
<div style="background:#f8fafc;padding:36px;font-family:Segoe UI,Arial">
  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.12)">

    <div style="background:#1d4ed8;padding:20px 28px">
      <h2 style="margin:0;color:#ffffff;font-weight:600">
        Thannmanngaadi Foundation
      </h2>
      <p style="margin:4px 0 0;color:#dbeafe;font-size:13px">
        Official Donation Communication
      </p>
    </div>

    <div style="padding:32px">
      <p style="font-size:15px;color:#334155">
        Dear <b>${name}</b>,
      </p>

      <p style="font-size:15px;color:#334155;line-height:1.8">
        We gratefully acknowledge receipt of your donation of 
        <b style="color:#1d4ed8">₹${amount}</b>.
        Your generosity enables us to continue delivering meaningful impact
        across our community-driven programs.
      </p>

      <div style="background:#f1f5f9;padding:18px;border-radius:12px;margin:24px 0">
        <p style="margin:0;font-size:14px">
          <b>Donation Certificate ID:</b> ${certificateId}
        </p>
      </div>

      <p style="font-size:14px;color:#334155">
        📎 Your official donation certificate is attached to this email.
      </p>

      <p style="font-size:14px;color:#334155">
        🔍 Certificate Verification:
        <a href="${verifyUrl}" style="color:#2563eb">${verifyUrl}</a>
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0"/>

      <p style="font-size:14px;color:#334155">
        With sincere appreciation,<br/>
        <b>Thannmanngaadi Foundation</b><br/>
        <span style="color:#64748b">
          Empowering communities through compassion
        </span>
      </p>
    </div>
  </div>

  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:18px">
    © Thannmanngaadi Foundation • Automated system-generated email
  </p>
</div>
      `,
      attachments: [
        {
          filename: `Donation-Certificate-${certificateId}.pdf`,
          content: pdf,
        },
      ],
    });

    res.json({ ok: true, certificateId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

/* ----------------------------------------
   VERIFY PAGE
---------------------------------------- */
app.get("/verify/:id", (req, res) => {
  res.send(`<h2>✅ Certificate ${req.params.id} Verified</h2>`);
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
/* ----------------------------------------
   ADMIN REPLY EMAIL
---------------------------------------- */
app.post("/admin/reply-message", async (req, res) => {
  try {
    const { to, name, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const html = `
<div style="background:#f8fafc;padding:36px;font-family:Segoe UI,Arial">
  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.12)">

    <div style="background:#1d4ed8;padding:20px 28px">
      <h2 style="margin:0;color:#ffffff;font-weight:600">
        Thannmanngaadi Foundation
      </h2>
      <p style="margin:4px 0 0;color:#dbeafe;font-size:13px">
        Official Support Reply
      </p>
    </div>

    <div style="padding:32px">
      <p style="font-size:15px;color:#334155">
        Dear <b>${name || "Support User"}</b>,
      </p>

      <p style="font-size:15px;color:#334155;line-height:1.8">
        ${message.replace(/\n/g, "<br/>")}
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0"/>

      <p style="font-size:14px;color:#334155">
        Warm regards,<br/>
        <b>Support Team</b><br/>
        Thannmanngaadi Foundation
      </p>
    </div>
  </div>

  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:18px">
    © Thannmanngaadi Foundation • Automated support response
  </p>
</div>
    `;

    await transporter.sendMail({
      from: `"Thannmanngaadi Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "Official Support Response",
      html,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Email failed" });
  }
});




app.post("/admin/volunteer-status", async (req, res) => {
  try {
    const { email, name, status } = req.body;

    const subject =
      status === "Approved"
        ? "🎉 Volunteer Application Approved"
        : status === "Rejected"
        ? "Volunteer Application Update"
        : "Volunteer Application Pending";

    const html = `
      <h2>Hello ${name},</h2>
      <p>Your volunteer application status is:</p>
      <h1 style="color:${
        status === "Approved" ? "green" : status === "Rejected" ? "red" : "orange"
      }">${status}</h1>

      ${
        status === "Approved"
          ? "<p>Welcome to our NGO team! We will contact you soon.</p>"
          : status === "Rejected"
          ? "<p>Thank you for applying. We appreciate your interest.</p>"
          : "<p>Your application is under review.</p>"
      }

      <br/>
      <p>Regards,<br/>NGO Team</p>
    `;

    await transporter.sendMail({
      from: `"NGO Admin" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject,
      html,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Email failed" });
  }
});


/* ----------------------------------------
   SERVER
---------------------------------------- */
app.listen(5050, () =>
  console.log("🚀 Server running on http://localhost:5050")
);  
const PORT = process.env.PORT || 5050;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
