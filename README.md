# 🌍 NGO Website & Admin Panel — Full-Stack Production System

A production-ready NGO management platform built with **React (Vite)**, **Express.js**, and **Supabase**.

This system enables NGOs to manage donations, volunteers, certificates, and admin workflows through a secure role-based dashboard.

Designed for real-world deployment and recruiter demonstration.

---

## 🚀 Live Features

### 🌐 Public Website

* Modern NGO landing page
* Programs, blogs & announcements
* Online donation system
* Volunteer & internship applications
* Contact form → admin inbox
* Automatic donation certificate generation
* Instant download + email delivery

---

### 🔐 Role-Based Admin Panel

* Secure login (Supabase Auth)
* Super Admin / Manager / Editor roles
* Live dashboard statistics
* Donation management
* Volunteer & internship approvals
* Blog & announcement publishing
* Contact messages inbox
* Admin activity logs (audit trail)
* User & role management

---

### 🧠 Advanced Highlights

✨ Digital PDF donation certificates
✨ SMTP email automation
✨ Role-based UI rendering
✨ Admin audit logs
✨ Live analytics dashboard
✨ Monorepo architecture
✨ Production-ready backend

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* ShadCN UI
* Lucide Icons
* jsPDF

### Backend

* Node.js
* Express.js
* Nodemailer
* PDFKit

### Database & Auth

* Supabase
* PostgreSQL
* Role-based authentication

---

## 📁 Monorepo Structure

```
NGO Website and Admin Panel/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── donate.tsx
│   │   │   ├── volunteer.tsx
│   │   │   ├── internship.tsx
│   │   │   └── admin/
│   │   │       ├── dashboard.tsx
│   │   │       ├── users.tsx
│   │   │       ├── donations.tsx
│   │   │       ├── volunteers.tsx
│   │   │       ├── messages.tsx
│   │   │       └── blogs.tsx
│   └── utils/
│
├── server/
│   ├── index.js
│   └── .env
│
├── vercel.json
├── package.json
└── README.md
```

---

## 🔐 User Roles

| Role        | Access Level                      |
| ----------- | --------------------------------- |
| Super Admin | Full control                      |
| Manager     | Volunteers + Donations + Programs |
| Editor      | Blogs & announcements             |
| None        | No admin access                   |

---

## 🧾 Donation Certificate Flow

1. User donates
2. Donation saved to Supabase
3. Certificate generated
4. PDF downloadable instantly
5. Email sent automatically
6. Unique certificate ID assigned

---

## 📧 SMTP Setup

Supports Gmail, Outlook, Zoho, or custom SMTP.

### `.env` (server)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=
```

---

## 🔗 API Routes

### Certificate

```
POST /api/donation/send-certificate
```

### Admin

```
POST   /api/admin/create-user
GET    /api/admin/users
POST   /api/admin/update-role
DELETE /api/admin/delete-user/:id
POST   /api/admin/log
```

---

## ▲ Deployment (Vercel Monorepo)

Uses Vercel serverless backend + static frontend build.

---

## 🔒 Security

* Supabase RLS
* Backend service role isolation
* Role guards
* SMTP protection
* Admin audit logs

---

## 📈 Future Enhancements

* QR certificate verification
* Donation analytics dashboard
* WhatsApp notifications
* Multi-language support
* CSR donor dashboards
* Annual reports (PDF)

---

## 👨‍💻 Developer

**Ayush Shukla**
B.Tech IT | Full-Stack Developer
🔗 [https://www.linkedin.com/in/ayush-shukla-957671305](https://www.linkedin.com/in/ayush-shukla-957671305)

---

## ⭐ Why This Project Stands Out

✔ Real NGO use case
✔ Enterprise architecture
✔ Recruiter-ready
✔ Client deployable
✔ Production quality

---

💙 Built to empower NGOs and showcase modern full-stack engineering.
