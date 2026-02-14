import Link from "next/link";
import { ArrowRight, Globe, Smartphone, Search, BarChart3, Target, Monitor } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe size={32} />,
  Smartphone: <Smartphone size={32} />,
  Search: <Search size={32} />,
  BarChart3: <BarChart3 size={32} />,
  Target: <Target size={32} />,
  Monitor: <Monitor size={32} />,
};

const services = [
  {
    slug: "web-development",
    icon: "Globe",
    title: "Web Development",
    description: "Custom-built digital experiences that drive results. From landing pages to complex SaaS platforms — responsive, fast, and SEO-optimized.",
    highlights: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4"],
  },
  {
    slug: "app-development",
    icon: "Smartphone",
    title: "App Development",
    description: "Native and cross-platform mobile solutions. iOS, Android, React Native 0.76, Flutter 3.27. End-to-end — design, build, deploy.",
    highlights: ["React Native", "Flutter", "iOS", "Android"],
  },
  {
    slug: "market-research",
    icon: "Search",
    title: "Market Research",
    description: "Data-driven insights to guide your strategy. Competitive analysis, consumer behavior, and trend forecasting that informs smarter decisions.",
    highlights: ["Competitive Intel", "Consumer Analysis", "Trend Mapping"],
  },
  {
    slug: "data-analytics",
    icon: "BarChart3",
    title: "Data Analytics",
    description: "Transform raw data into strategic advantage. Custom dashboards, data pipelines, and predictive models for evidence-based decisions.",
    highlights: ["Python 3.13", "Power BI", "Machine Learning", "ETL"],
  },
  {
    slug: "lead-generation",
    icon: "Target",
    title: "Lead Generation",
    description: "Fill your pipeline with qualified prospects. Multi-channel campaigns across LinkedIn, email, content, and paid ads that convert.",
    highlights: ["LinkedIn Outreach", "Email Campaigns", "Paid Ads", "SEO"],
  },
  {
    slug: "it-products",
    icon: "Monitor",
    title: "IT Products & Rentals",
    description: "Enterprise hardware — purchase or rent. Laptops, servers, networking equipment with maintenance and support included.",
    highlights: ["Laptop Rentals", "Servers", "Networking", "Support"],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="orb orb-teal w-[400px] h-[400px] top-[-10%] left-[-10%]" />
        <div className="orb orb-blue w-[300px] h-[300px] top-[30%] right-[-10%]" />

        <div className="container mx-auto px-6 max-w-4xl">
          <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium fade-up">
            Our Services
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-8 fade-up fade-up-delay-1">
            Everything you need <span className="glow-text">to grow.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed fade-up fade-up-delay-2">
            Six specialized services. One unified partner. We cover every angle of your
            digital strategy — from software development to data intelligence to hardware infrastructure.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20 relative">
        <div className="container mx-auto px-6">
          <div className="space-y-4">
            {services.map((service, i) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`glass rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 group hover:border-[var(--color-primary)]/30 transition-all duration-300 block fade-up fade-up-delay-${Math.min(i + 1, 6)}`}
              >
                {/* Number + Icon */}
                <div className="flex items-center gap-6 md:w-48 flex-shrink-0">
                  <span className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[var(--color-text-muted)]/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300">
                    {iconMap[service.icon]}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-bold mb-3 text-white group-hover:text-[var(--color-primary)] transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.highlights.map((h) => (
                      <span key={h} className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[var(--color-text-muted)] border border-[var(--color-glass-border)] rounded-lg px-3 py-1">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 glass rounded-xl group-hover:border-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)] text-[var(--color-text-muted)] transition-all flex-shrink-0">
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="orb orb-amber w-[300px] h-[300px] top-[-20%] left-[20%]" />

        <div className="container mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white mb-6">
            Not sure which service you need?
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto mb-10">
            Let&apos;s talk about your business goals and figure out the best path forward — together.
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            Schedule a Free Consultation <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
