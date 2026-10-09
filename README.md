# Novus CRM

<p align="center">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80" alt="Novus CRM Banner" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>Full-Stack Enterprise Customer Relationship Management (CRM) System</strong><br/>
  Architected for <strong>100% Free Hosting</strong> on <strong>Vercel (Hobby Tier)</strong> & Serverless PostgreSQL (<strong>Neon</strong> / <strong>Supabase</strong>).
</p>

<p align="center">
  <a href="https://github.com/ImpactG1/Novus-CRM/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14%20App%20Router-black?logo=next.js" alt="Next.js 14" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwind-css" alt="Tailwind CSS" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-5.x-2d3748?logo=prisma" alt="Prisma ORM" /></a>
  <a href="https://github.com/ImpactG1/Novus-CRM/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

## ⚡ Tech Stack & Architecture (Zero-Cost Free Tier)

| Component | Technology | Free Tier Provision |
|---|---|---|
| **Frontend & Backend** | Next.js 14 App Router (`/app`), React 18, TypeScript | Vercel Serverless (Unlimited Free Deployments) |
| **Styling & UI** | Tailwind CSS, Radix UI Primitives, Lucide Icons | Linear & Stripe Dashboard Design System |
| **Charts & Visuals** | Recharts (Responsive SVG Canvas) | Zero External Dependencies |
| **Database** | PostgreSQL | Neon Postgres (0.5 GB Free Serverless Storage) |
| **ORM** | Prisma ORM 5.x (`prisma`, `@prisma/client`) | Prisma Client connection pooling (`directUrl`) |
| **Auth** | Passwordless 4-Digit Numeric Email OTP (JWT Session) | Iron-clad secure HTTP-Only cookies |
| **Email Delivery** | Resend / Nodemailer (SMTP) | Resend (3,000 Free Emails/month) |
| **Excel Engine** | SheetJS (`xlsx`) and `exceljs` | Client & Serverless memory processing |
| **Audio & Alerts** | Web Audio API + HTML5 Notification API | 523Hz & 659Hz synthetic chimes (0 audio assets) |

---

## 🚀 Key Modules & Features

### 1. Authentication & Role Permissions
- **Passwordless Email OTP Flow**: Enters email, receives a 4-digit numeric code with 10-minute expiry.
- **Local Dev Assistant**: In development, OTP is printed directly in the server console (`[DEV OTP]: 1234`) and can be auto-filled in 1 click.
- **Role Switching**: Instant switching between `ADMIN`, `AGENT`, and `SUPPORT` roles directly in the header to simulate permission levels.

### 2. Master Leads & Pipeline Management
- **Search & Multi-Filter**: Real-time filtering by status (New, Contacted, Proposal, Won), type (Hot, Warm, Cold, Enterprise), and assigned agent.
- **1-Click Bulk Assign**: Select multiple leads via checkboxes and reassign them to any sales agent simultaneously.
- **Bulk Excel Import/Export**:
  - Download standardized blank `.xlsx` sample template.
  - Upload Excel sheets with duplicate phone number detection.
  - Export filtered lists directly to `.xlsx`.
- **Slide-Over Profile Drawer**:
  - **Tab 1: Overview & Remarks**: Chronological follow-up timeline with author and timestamps.
  - **Tab 2: Quotations**: Tied quotations list with dynamic quote creator.
  - **Tab 3: Invoices**: Tied invoices list with GST vs Non-GST generator.
  - **Tab 4: Proposals**: Multi-table rate charts and wallet packages.
  - **Tab 5: Sales**: Log won deals with payment modes, validity, and DLT status.
  - **Tab 6: Demos & Schedule**: Meeting scheduling.

### 3. Quotation & Invoice Engine
- **Quotation Workflow**: Auto-sequential numbers (`QT-2026-0001`), dynamic line item builder, automated taxable/GST 18%/discount/grand total calculation, and 1-click HTML email dispatch to clients.
- **Invoice Workflow**: Toggle GST (`INV-GST-2026-0001`) vs Non-GST (`INV-NON-2026-0001`), payment mode logging (UPI, NEFT, Card, Cash), transaction IDs, and receipt dispatch.

### 4. Proposals & Dynamic Rate Charts
- **Multi-Table Slab Generator**: Create distinct rate charts (e.g. Promotional SMS, WhatsApp Business API).
- **Global Discount Applicator**: Apply uniform discount percentage across all volume slabs in 1 click.
- **Wallet Credit Packages**: Starter, Growth, and Enterprise tiers with bonus credits percentage calculations.
- **ExcelJS Export**: Server-side styled `.xlsx` workbook generation with colored headers, custom fonts, and cell formatting.
- **Email Dispatch**: Send clean HTML rate chart proposals directly to clients.

### 5. Follow-Up Reminders & Web Audio Engine
- **Vercel-Friendly Polling**: 30-second polling against `/api/reminders/due` (zero persistent WebSocket overhead).
- **Synthetic Web Audio API Chime**: Clean two-tone chime at 523Hz (C5) and 659Hz (E5). Zero external `.mp3` files needed.
- **Native Desktop Notifications**: HTML5 Notifications API integration.
- **Interactive Action Modal**:
  - `Open Lead Profile`: Jumps directly to lead details drawer.
  - `Snooze 10m`: Postpones callback by 10 minutes.
  - `Mark Done`: Clears callback date.

### 6. Support Ticketing & Helpdesk
- Auto-generated tickets (`TICK-xxxxxx`) with `LOW`, `MEDIUM`, `HIGH`, `URGENT` priority badges.
- Interactive message thread timeline for internal triage and customer communication.

### 7. Executive Dashboard & Analytics
- 5 Live KPI metric cards with performance deltas.
- Recharts Monthly Sales Revenue Bar Chart.
- Recharts Lead Conversion Funnel (New -> Contacted -> Proposal -> Won).
- Agent Performance Leaderboard ranked by closed deals and revenue.

---

## 🛠️ Local Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/ImpactG1/Novus-CRM.git
cd Novus-CRM
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Zero-Cost Vercel & Neon Deployment Guide

### Step 1: Create Free PostgreSQL Database (Neon)
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a project named `novus-crm`.
3. Copy the **Connection String** (Pooled connection for `DATABASE_URL` and Direct for `DIRECT_URL`).

### Step 2: Push Database Schema
```bash
npx prisma db push
```

### Step 3: Deploy to Vercel (100% Free)
1. Push your repository to GitHub: `https://github.com/ImpactG1/Novus-CRM`
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and select `Novus-CRM`.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://...` (Pooled connection string)
   - `DIRECT_URL`: `postgresql://...` (Direct connection string)
   - `NEXTAUTH_SECRET`: Generate a 32-character random string.
   - `NEXTAUTH_URL`: `https://your-crm-project.vercel.app`
   - `RESEND_API_KEY`: Your free Resend API key from [resend.com](https://resend.com) (or leave blank for console fallback).
   - `EMAIL_FROM`: `CRM <onboarding@resend.dev>`
4. Click **Deploy**. Vercel will build and launch your production CRM globally on its Serverless Edge network.

---

## 🤝 Contributing & Community

Contributions are warmly welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development setup, and the process for submitting pull requests.

---

## 📄 Open Source License

This project is open-source and licensed under the [MIT License](LICENSE). You are free to use, modify, distribute, and build commercial products upon it.
