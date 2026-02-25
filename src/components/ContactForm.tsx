/**
 * ContactForm — Client-side form with reCAPTCHA Enterprise validation.
 * Submits via server action (actions/contact.ts) and shows success/error feedback.
 */
"use client";

import { useState } from "react";
import { submitContactForm } from "@/actions/contact";
import { Send, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRecaptchaEnterprise } from "@/hooks/useRecaptchaEnterprise";

export default function ContactForm({ siteKey }: { siteKey?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { execute, ready } = useRecaptchaEnterprise(siteKey);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    if (siteKey) {
        if (!ready) {
             setError("ReCAPTCHA still loading. Please wait a moment.");
             setLoading(false);
             return;
        }

        const token = await execute("CONTACT_SUBMIT");
        if (token) {
            formData.append("captchaToken", token);
        } else {
            setError("ReCAPTCHA verification failed. Please try again.");
            setLoading(false);
            return;
        }
    }

    try {
        const result = await submitContactForm({}, formData);
        
        if (result.success) {
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } else {
            setError(result.error || "Something went wrong.");
        }
    } catch {
        setError("An unexpected error occurred. Please try again.");
    } finally {
        setLoading(false);
    }
  }

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Full Name *</label>
          <input
            type="text" id="name" name="name" required
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Email Address *</label>
          <input
            type="email" id="email" name="email" required
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Phone Number</label>
          <input
            type="tel" id="phone" name="phone"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder="+91 98765 43210"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="service" className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Service Interest</label>
          <div className="relative">
            <select
              id="service" name="service"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors appearance-none"
              defaultValue=""
            >
              <option value="" disabled>Select a service</option>
              <option value="web-development">Web Development</option>
              <option value="app-development">Mobile App Development</option>
              <option value="ui-ux-design">UI/UX Design</option>
              <option value="cloud-services">Cloud Services</option>
              <option value="data-analytics">Data Analytics</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
                <ArrowRight size={16} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Message *</label>
        <textarea
          id="message" name="message" required rows={5}
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
          placeholder="Tell us about your project..."
        ></textarea>
      </div>

        {success && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle size={20} />
                <p>Message sent successfully! We&apos;ll get back to you soon.</p>
            </div>
        )}

        {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertCircle size={20} />
                <p>{error}</p>
            </div>
        )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-4 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        {loading ? 'Sending Message...' : 'Send Message'}
      </button>

      <p className="text-xs text-[var(--color-text-muted)] mt-4">
        This site is protected by reCAPTCHA Enterprise and the Google <Link href="https://policies.google.com/privacy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</Link> and <Link href="https://policies.google.com/terms" className="text-[var(--color-primary)] hover:underline">Terms of Service</Link> apply.
      </p>
    </form>
  );
}
