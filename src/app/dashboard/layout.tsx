import type { Metadata } from "next";
import DashboardClientLayout from "./layout.client";

export const metadata: Metadata = {
  title: "Dashboard - Genesoft Infotech",
  description: "Secure client portal for managing hardware assets and service tickets.",
  openGraph: {
    title: "Dashboard - Genesoft Infotech",
    description: "Manage your assets, track support tickets, and view rental history in the Genesoft client portal.",
    url: "https://genesoftinfotech.com/dashboard",
    siteName: "Genesoft Infotech",
    images: [
      {
        url: "https://genesoftinfotech.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Genesoft Infotech Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - Genesoft Infotech",
    description: "Manage your assets, track support tickets, and view rental history in the Genesoft client portal.",
    images: ["https://genesoftinfotech.com/og-image.jpg"],
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
