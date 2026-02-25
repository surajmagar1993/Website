/** Terms of Service page — static legal page linked from Footer */
import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "Read the Genesoft Infotech terms of service.",
};

export default function TermsPage() {
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
          <ScrollText size={28} className="text-[var(--color-primary)]" />
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white">
            Terms of Service
          </h1>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
          <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you agree to be bound by these
            Terms of Service and all applicable laws and regulations. If you do not
            agree with any part of these terms, you may not use our services.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">2. Services</h2>
          <p>
            Genesoft Infotech provides software development, data analytics, market
            research, and IT product rental services. Specific terms for individual
            projects are governed by separate client agreements.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">3. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and
            software, is the property of Genesoft Infotech and protected by
            applicable intellectual property laws.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">4. Limitation of Liability</h2>
          <p>
            Genesoft Infotech shall not be liable for any indirect, incidental,
            or consequential damages arising from the use of our website or services.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">5. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be
            subject to the jurisdiction of the courts in Pune, Maharashtra.
          </p>

          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mt-8">6. Contact</h2>
          <p>
            For questions about these Terms, please{" "}
            <Link href="/contact" className="text-[var(--color-primary)] hover:underline">
              contact us
            </Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
