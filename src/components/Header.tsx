/**
 * Header — Main navigation bar with responsive mobile menu.
 * Includes scroll-aware background effect and dynamic nav links.
 */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Our Work" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

import { SiteSettings } from "@/lib/settings";

export default function Header({ settings }: { settings?: SiteSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {settings?.company_logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={settings.company_logo} 
              alt={settings.company_name || "Logo"} 
              className="h-10 w-auto object-contain"
            />
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[var(--color-primary-glow)]">
                <span className="text-white font-bold text-sm font-[family-name:var(--font-heading)]">
                  {settings?.company_name ? settings.company_name.charAt(0) : 'G'}
                </span>
              </div>
              <span className="font-[family-name:var(--font-heading)] font-bold text-lg tracking-tight text-white">
                {settings?.company_name || 'Genesoft'}
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors duration-300 uppercase tracking-widest"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Login */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors uppercase tracking-widest"
          >
            Client Login
          </Link>
          <Link href="/contact" className="btn-primary inline-block text-sm">
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-[var(--color-bg)]/95 backdrop-blur-xl z-40">
          <nav className="flex flex-col p-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-4 border-b border-[var(--color-glass-border)] text-lg font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wide text-white"
              >
                {link.label}
                <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between py-4 border-b border-[var(--color-glass-border)] text-lg font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wide text-[var(--color-primary)]"
            >
              Client Login
              <ChevronRight size={20} />
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="btn-primary text-center mt-6"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
