/** SEO — Generates Next.js Metadata from page-specific overrides or site-wide defaults. */
import { supabase } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import { Metadata } from "next";

export async function getPageSeo(path: string): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  // Default Metadata from Site Settings
  const defaultTitle = settings.company_name || "Genesoft Infotech";
  const defaultDescription = settings.home_hero_subtitle || "IT Solutions & Digital Transformation";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://genesoft.com";

  // Fetch Page Specific SEO
  const { data: pageSeo } = await supabase
    .from('page_seo')
    .select('*')
    .eq('path', path)
    .single();

  if (pageSeo) {
    return {
      title: `${pageSeo.title} | ${settings.company_name}`,
      description: pageSeo.description,
      keywords: pageSeo.keywords ? pageSeo.keywords.split(',').map((k: string) => k.trim()) : [],
      openGraph: {
        title: pageSeo.title,
        description: pageSeo.description,
        url: `${siteUrl}${path}`,
        siteName: settings.company_name,
        images: pageSeo.og_image ? [{ url: pageSeo.og_image }] : [],
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: pageSeo.title,
        description: pageSeo.description,
        images: pageSeo.og_image ? [pageSeo.og_image] : [],
      }
    };
  }

  // Fallback / Default
  return {
    title: {
      default: defaultTitle,
      template: `%s | ${defaultTitle}`,
    },
    description: defaultDescription,
    keywords: ["Software Development", "IT Services", "Digital Transformation"],
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: siteUrl,
      siteName: defaultTitle,
      locale: "en_US",
      type: "website",
    },
    icons: {
      icon: settings.company_favicon || "/favicon.ico",
    },
  };
}
