# Project Overview & Architecture

This document provides a comprehensive summary of the Genesoft Infotech Website project, including the database schema, folder structure, and key features implemented.

## 1. Project Goal
Build a modern, dynamic corporate website for **Genesoft Infotech** with a comprehensive Admin Dashboard for content management. The site is built for performance (Next.js), scalability (Supabase), and ease of maintenance.

---

## 2. Technology Stack

*   **Frontend Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Database & Auth**: Supabase (PostgreSQL)
*   **Icons**: Lucide React
*   **Animations**: Framer Motion, GSAP
*   **Email**: Resend API

---

## 3. Database Schema

The project uses a relational database (PostgreSQL) hosted on Supabase.

### A. Content Tables

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| **`services`** | Service offerings displayed on the site. | `id`, `slug`, `title`, `icon`, `short_description`, `content`, `features` (JSON), `category` |
| **`case_studies`** | Portfolio items and success stories. | `id`, `slug`, `title`, `client_name`, `image_url`, `challenge`, `solution`, `results` |
| **`clients`** | Client logos and website links. | `id`, `name`, `logo_url`, `website` |
| **`site_settings`** | **Dynamic Configuration**. Stores global content like logos, contact info, and hero text. | `key` (PK), `value`, `category` |

### B. Admin & System Tables

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| **`inquiries`** | Contact form submissions from the public site. | `id`, `name`, `email`, `subject`, `message`, `status` (new/read) |
| **`system_logs`** | Audit logs for errors and admin actions. | `id`, `level`, `message`, `metadata`, `created_at` |

### C. Storage Buckets (Supabase Storage)

*   **`images`**: Stores all upload media, including project screenshots, service icons, and logos.
*   **`documents`**: (Optional) For PDFs or other downloadable assets.

---

## 4. Work Completed

### Phase 1: Core Foundation
*   ✅ Setup Next.js 14 project with Tailwind CSS.
*   ✅ Integrated Supabase Client for data fetching.
*   ✅ Implemented "Dark Mode" corporate aesthetic.

### Phase 2: Public Website
*   ✅ **Homepage**: Dynamic Hero, Services Grid, Testimonials, and Contact CTA.
*   ✅ **Service Pages**: Individual detail pages for each service (`/services/[slug]`).
*   ✅ **Contact Form**: Functional form integrating with Supabase DB and Resend Email API.
*   ✅ **SEO**: Dynamic metadata generation for all pages.

### Phase 3: Admin Dashboard (`/dashboard`)
*   ✅ **Secure Authentication**: Protected routes using Supabase Auth.
*   ✅ **Media Library**: Custom-built file manager with Drag & Drop upload and multi-select.
*   ✅ **Site Settings**: centralized control for Company Name, Logos, and Social Links.
*   ✅ **CRUD Management**: Full editing capabilities for Services, Projects, and Clients.

### Phase 4: Automation & DevTools
*   ✅ **Database Automation**: Scripts (`npm run db:bucket`, `npm run db:sql`) to manage infrastructure.
*   ✅ **Linting & Quality**: Strict TypeScript and ESLint configuration for code stability.

---

## 5. Folder Structure

```
/
├── public/                 # Static assets (favicons, robots.txt)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (marketing)/    # Public facing pages (Home, About, Services)
│   │   ├── dashboard/      # Admin Panel (Protected)
│   │   ├── api/            # Server-side API Endpoints
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI Components
│   │   ├── ui/             # Generic atoms (Buttons, Cards, Inputs)
│   │   └── admin/          # Dashboard-specific widgets
│   ├── lib/                # Utilities & Config
│   │   ├── supabase.ts     # DB Client
│   │   └── types.ts        # TypeScript Interfaces
│   └── scripts/            # Automation (manage-db.js)
├── .env.local              # Environment Variables (Secrets)
├── next.config.ts          # Next.js Configuration
└── README.md               # Getting Started Guide
```

---

## 6. How to Extend

1.  **Add a new Table**: Create table in Supabase -> Regenerate Types -> create new Admin Page in `src/app/dashboard/admin`.
2.  **Change Styling**: Modify `tailwind.config.ts` or global CSS variables in `src/app/globals.css`.
3.  **Update Logic**: Most business logic resides in `src/app/api` or Server Actions.
