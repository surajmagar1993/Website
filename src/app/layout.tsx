import type { Metadata } from "next";
import "./globals.css";

import { getSiteSettings } from "@/lib/settings";
import { getCurrentHolidayTheme } from "@/lib/theme-calendar";
import { Lexend, Source_Sans_3 } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings.company_name || "Genesoft Infotech";
  
  return {
    title: {
      default: `${companyName} — ${settings.company_tagline || "IT Solutions & Digital Transformation"}`,
      template: `%s | ${companyName}`,
    },
    description: settings.home_hero_subtitle || "Premier IT solutions provider in Pune. Web development, app development, data analytics, market research, lead generation, and IT product rentals.",
    keywords: [
      "IT solutions", "web development", "app development", "Pune", companyName
    ],
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: companyName,
      title: `${companyName} — ${settings.company_tagline || "IT Solutions & Digital Transformation"}`,
      description: settings.home_hero_subtitle || "Premier IT solutions provider in Pune.",
      url: "https://genesoftinfotech.com", // Add production URL here
      images: [
        {
          url: "/og-image.jpg", // Add a default OG image path
          width: 1200,
          height: 630,
          alt: companyName,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} — ${settings.company_tagline || "IT Solutions & Digital Transformation"}`,
      description: settings.home_hero_subtitle || "Premier IT solutions provider in Pune.",
      images: ["/og-image.jpg"],
    },
    icons: {
        icon: settings.company_favicon || "/favicon.ico",
        apple: "/icon-192.png",
    },
    robots: {
      index: true,
      follow: true,
    },
    manifest: "/manifest.json",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  let activeThemeClass = 'theme-default';
  
  if (settings.active_theme === 'auto' || !settings.active_theme) {
    const holidayTheme = getCurrentHolidayTheme();
    if (holidayTheme) activeThemeClass = holidayTheme;
  } else if (settings.active_theme && settings.active_theme !== 'default') {
    activeThemeClass = `theme-${settings.active_theme}`;
  }

  return (
    <html lang="en">
      <head />
      <body className={`antialiased ${lexend.variable} ${sourceSans3.variable} font-[family-name:var(--font-body)] ${activeThemeClass} bg-[var(--color-bg)] transition-colors duration-1000`}>
        {children}
      </body>
    </html>
  );
}
