# Genesoft Infotech Website

The official website for Genesoft Infotech, a modern IT solutions provider. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase.

![Genesoft Website Preview](public/preview-placeholder.png)

## 🚀 Key Features

*   **Modern Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS.
*   **Dynamic Content:** Powered by Supabase (Services, Case Studies, FAQs).
*   **CMS Dashboard:** Admin panel to manage site content, media, and settings.
*   **Performance:** Optimized with `next/font`, responsive images, and static generation.
*   **Design:** Premium, corporate aesthetic with dark mode and glassmorphism elements.

## 🛠️ Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript
*   **Styling:** Tailwind CSS, Framer Motion, Lucide Icons
*   **Backend / Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth
*   **Storage:** Supabase Storage (for media assets)
*   **Email:** Resend API

## 🏁 Getting Started

### Prerequisites

*   Node.js 18+
*   NPM or Yarn
*   A Supabase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/surajmagar1993/Website.git
    cd Website
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your secrets:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    RESEND_API_KEY=your_resend_key
    RESEND_FROM_EMAIL="Genesoft <info@genesoftinfotech.com>"
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the site.

## 🗄️ Database Management

Detailed instructions for database setup and automation are in the [Database Guide](docs/DATABASE.md) (or see commands below).

### Commands

*   `npm run db:bucket <name> [public]` - Create storage buckets.
*   `npm run db:list-buckets` - List all buckets.
*   `npm run db:sql <file.sql>` - Execute SQL scripts.

## 🚀 Deployment

For detailed hosting instructions on Vercel, AWS, Oracle Cloud, or Custom VPS, please verify [HOSTING.md](HOSTING.md).

## 📄 License

This project is licensed under the MIT License.
