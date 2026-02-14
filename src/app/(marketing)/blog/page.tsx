import { ArrowRight, Bell, Newspaper } from "lucide-react";

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden min-h-[70vh] flex items-center">
        <div className="orb orb-teal w-[400px] h-[400px] top-[10%] left-[-10%]" />
        <div className="orb orb-amber w-[300px] h-[300px] bottom-[10%] right-[-5%]" />

        <div className="container mx-auto px-6 text-center">
          <div className="glass-strong rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8 fade-up">
            <Newspaper size={32} className="text-[var(--color-primary)]" />
          </div>
          <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium fade-up">
            Blog
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6 fade-up fade-up-delay-1">
            Coming <span className="glow-text">Soon.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto mb-10 fade-up fade-up-delay-2">
            We&apos;re preparing insightful articles on technology, digital transformation,
            and business growth. Be the first to know when we launch.
          </p>

          <div className="glass rounded-2xl p-8 max-w-md mx-auto gradient-border fade-up fade-up-delay-3">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={20} className="text-[var(--color-accent)]" />
              <span className="font-[family-name:var(--font-heading)] font-semibold text-white">Get Notified</span>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors text-sm"
              />
              <button className="btn-primary !px-6 !py-3" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
