/**
 * Footer — Site-wide footer with quick links, services, contact info, and social icons.
 * Rendered on all marketing pages via the marketing layout.
 */
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/work", label: "Our Work" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

const serviceLinks = [
  { href: "/services/web-development", label: "Web Development" },
  { href: "/services/app-development", label: "App Development" },
  { href: "/services/data-analytics", label: "Data Analytics" },
  { href: "/services/market-research", label: "Market Research" },
  { href: "/services/lead-generation", label: "Lead Generation" },
  { href: "/services/it-products", label: "IT Products & Rentals" },
];

import { SiteSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings?: SiteSettings }) {
  return (
    <footer className="relative border-t border-[var(--color-glass-border)] bg-[var(--color-bg)]">
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />

      <div className="py-8">
        <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              {settings?.footer_logo || settings?.company_logo ? (
                <div className="relative h-10 w-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={settings?.footer_logo || settings?.company_logo} 
                        alt={settings?.company_name || 'Genesoft Infotech'} 
                        className="h-10 w-auto object-contain"
                    />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[#0EA5E9] flex items-center justify-center">
                    <span className="text-white font-bold text-sm font-[family-name:var(--font-heading)]">
                        {settings?.company_name ? settings.company_name.charAt(0) : 'G'}
                    </span>
                </div>
              )}
              {!settings?.footer_logo && !settings?.company_logo && (
                <span className="font-[family-name:var(--font-heading)] font-bold text-lg text-white">
                    {settings?.company_name || 'Genesoft Infotech'}
                </span>
              )}
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6">
              {settings?.company_tagline || 'Your trusted partner for digital transformation. We build software, analyze data, and equip businesses with the technology they need to grow.'}
            </p>
            <div className="flex gap-3">
              {[
                { label: "LinkedIn", href: settings?.social_linkedin, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { label: "X", href: settings?.social_twitter, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "Instagram", href: settings?.social_instagram, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
              ].filter(s => s.href).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass w-10 h-10 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-widest mb-6 text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-widest mb-6 text-white">
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-widest mb-6 text-white">
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                <span className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                  {settings?.contact_address || 'Shivtirtha Bungalow, Lane 15, Khese Park,\nLohegaon, Pune, Maharashtra 411032'}
                </span>
              </li>
              <li>
                <a href={`mailto:${settings?.contact_email || 'info@genesoftinfotech.com'}`} className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  <Mail size={18} className="text-[var(--color-primary)] flex-shrink-0" />
                  {settings?.contact_email || 'info@genesoftinfotech.com'}
                </a>
              </li>
              <li>
                <a href={`tel:${settings?.contact_phone || '+918888885285'}`} className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  <Phone size={18} className="text-[var(--color-primary)] flex-shrink-0" />
                  {settings?.contact_phone || '+91 8888885285'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[var(--color-glass-border)]">
        <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-text-muted)] text-xs">
            © {new Date().getFullYear()} {settings?.company_name || 'Genesoft Infotech'}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[var(--color-text-muted)] hover:text-white text-xs transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[var(--color-text-muted)] hover:text-white text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
