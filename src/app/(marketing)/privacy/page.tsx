/** Privacy Policy page — static legal page linked from Footer */
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Read the Genesoft Infotech privacy policy.",
};

export default function PrivacyPage() {
  return (
    <section className="pt-40 pb-20 relative overflow-hidden">
      <div className="orb orb-teal w-[400px] h-[400px] top-[-10%] left-[-10%]" />

      <div className="container mx-auto px-6 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck size={28} className="text-[var(--color-primary)]" />
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white">
            Privacy Policy
          </h1>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
          <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">1. Information We Collect</h2>
          <p>
            We collect personal information you voluntarily provide through our contact forms,
            including your name, email address, phone number, and any message content.
            We also collect standard web analytics data such as IP address, browser type,
            and pages visited.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">2. How We Use Your Information</h2>
          <p>
            Your information is used to respond to inquiries, provide requested services,
            improve our website experience, and comply with legal obligations.
            We do not sell your personal data to third parties.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data,
            including encrypted connections (SSL/TLS), secure hosting infrastructure,
            and access controls on our databases.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">4. Third-Party Services</h2>
          <p>
            We may use third-party services such as Google Analytics, Google reCAPTCHA,
            and email delivery services (Resend). These services have their own privacy
            policies governing the use of your information.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">5. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please{" "}
            <Link href="/contact" className="text-[var(--color-primary)] hover:underline">
              contact us
            </Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
