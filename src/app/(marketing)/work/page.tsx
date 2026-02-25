import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudies } from "@/lib/services-data";

export default function WorkPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="orb orb-teal w-[400px] h-[400px] top-[-5%] right-[-10%]" />
        <div className="orb orb-amber w-[300px] h-[300px] bottom-[-10%] left-[-5%]" />

        <div className="container mx-auto px-6 max-w-4xl">
          <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium fade-up">
            Our Work
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-8 fade-up fade-up-delay-1">
            Projects that <span className="glow-text">deliver results.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed fade-up fade-up-delay-2">
            A curated selection of our work. Each project represents a unique challenge
            solved with tailored technology.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="pb-20 relative">
        <div className="container mx-auto px-6">
          <div className="space-y-6">
            {caseStudies.map((study, i) => (
              <div
                key={study.slug}
                id={study.slug}
                className={`glass rounded-2xl p-8 md:p-12 fade-up fade-up-delay-${Math.min(i + 1, 3)}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left */}
                  <div>
                    <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] font-medium">
                      {study.category}
                    </span>
                    <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mt-3 mb-6">
                      {study.title}
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-semibold mb-2">Challenge</h3>
                        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{study.challenge}</p>
                      </div>
                      <div>
                        <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-semibold mb-2">Solution</h3>
                        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{study.solution}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right — Results */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-semibold mb-4">Key Results</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {study.results.map((result) => (
                          <div key={result.label} className="glass-strong rounded-xl p-5">
                            <p className="glow-text font-[family-name:var(--font-heading)] text-2xl font-bold">{result.value}</p>
                            <p className="text-[var(--color-text-secondary)] text-xs mt-1">{result.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-semibold mb-3">Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {study.technologies.map((tech) => (
                          <span key={tech} className="text-xs font-[family-name:var(--font-heading)] text-[var(--color-text-muted)] border border-[var(--color-glass-border)] rounded-lg px-3 py-1">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="orb orb-teal w-[300px] h-[300px] top-[-20%] left-[20%]" />

        <div className="container mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white mb-6">
            Want results like these <span className="glow-text">for your business?</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto mb-10">
            Tell us about your project and let&apos;s explore what&apos;s possible.
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            Start Your Project <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
