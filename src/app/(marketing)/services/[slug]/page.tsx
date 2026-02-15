import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Phone, Mail } from "lucide-react";
import FAQSection from "@/components/FAQSection";

interface ServiceStep { title: string; description: string; }
interface ServiceSolution { title: string; description: string; features: string[]; }
interface CaseStudyMetric { value: string; label: string; }
interface CaseStudyResult { title: string; industry: string; metrics: CaseStudyMetric[]; }

interface Service {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  image_url?: string;
  case_study_image?: string;
  features: string[];
  technologies: string[];
  process: ServiceStep[];
  pain_points: ServiceStep[];
  solutions: ServiceSolution[];
  benefits: ServiceStep[];
  faqs: { question: string; answer: string }[];
  case_study_results: CaseStudyResult[];
}

export async function generateStaticParams() {
  const { data: services } = await supabase.from('services').select('slug');
  return (services || []).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: service } = await supabase
    .from('services')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!service) return {};
  return {
    title: `${service.title} Services | Genesoft Infotech`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!data) notFound();
  
  const service = data as Service;
  const painPoints = service.pain_points;
  const caseStudyResults = service.case_study_results;

  return (
    <>
      {/* ═══ SECTION 1: SERVICE HERO ═══ */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="orb orb-orange w-[400px] h-[400px] top-[-10%] right-[-10%]" />
        <div className="orb orb-amber w-[300px] h-[300px] bottom-[-10%] left-[-5%]" />

        <div className="container mx-auto px-6">
          <Link href="/services" className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm mb-8 transition-colors relative z-10">
            <ArrowLeft size={16} /> All Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
                <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 fade-up">
                    {service.title} <span className="glow-text">Services</span>
                </h1>
                <p className="text-[var(--color-text-secondary)] text-lg md:text-xl leading-relaxed mb-10 fade-up fade-up-delay-1">
                    {service.subtitle}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10 fade-up fade-up-delay-2">
                    <Link href="/contact" className="btn-primary inline-flex items-center gap-2 justify-center">
                    Get Started <ArrowRight size={18} />
                    </Link>
                    <Link href="/contact" className="btn-outline inline-flex items-center gap-2 justify-center">
                    View Pricing
                    </Link>
                </div>

                {/* Key highlights */}
                <div className="flex flex-wrap gap-4 fade-up fade-up-delay-3">
                    {service.features.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <CheckCircle size={16} className="text-[var(--color-primary)] flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                    </div>
                    ))}
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative fade-up fade-up-delay-2">
                <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    {service.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={service.image_url} 
                            alt={`${service.title} Services`} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                             <span className="text-white/20 font-bold text-xl">{service.title}</span>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: THE PROBLEM / CHALLENGE ═══ */}
      <section className="py-20 relative bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              Common Challenges
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3">
              Are You Facing These Challenges?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {painPoints.map((point) => (
              <div key={point.title} className="glass rounded-2xl p-8 text-center hover:border-[var(--color-primary)]/20 transition-all">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                  <XCircle size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-heading)]">{point.title}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[var(--color-text-secondary)] mt-10 text-lg">
            We understand these challenges. Here&apos;s how we solve them for you.
          </p>
        </div>
      </section>

      {/* ═══ SECTION 3: THE SOLUTION / WHAT WE OFFER ═══ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              Our Solutions
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3">
              Our {service.title} Solutions
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mt-4 max-w-2xl mx-auto">{service.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {service.solutions.map((solution) => (
              <div key={solution.title} className="glass rounded-2xl p-8 hover:border-[var(--color-primary)]/30 transition-all group">
                <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-heading)] group-hover:text-[var(--color-primary)] transition-colors">
                  {solution.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-5 leading-relaxed">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                      <CheckCircle size={14} className="text-[var(--color-primary)] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: HOW IT WORKS / PROCESS ═══ */}
      <section className="py-20 relative bg-black/20">
        <div className="orb orb-blue w-[250px] h-[250px] top-[20%] right-[-5%]" />

        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              Our Process
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3">
              How We Deliver {service.title}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {service.process.map((step, i) => (
                <div key={step.title} className="glass rounded-2xl p-6 text-center hover:border-[var(--color-primary)]/30 transition-all relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-[family-name:var(--font-heading)] font-bold text-sm">{i + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 font-[family-name:var(--font-heading)]">{step.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: KEY FEATURES / BENEFITS ═══ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              Why Choose Us
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3">
              Why Choose Our {service.title} Services?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {service.benefits.map((benefit) => (
              <div key={benefit.title} className="glass rounded-xl p-6 flex items-start gap-4 hover:border-[var(--color-primary)]/20 transition-all">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle size={18} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1 font-[family-name:var(--font-heading)]">{benefit.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: CASE STUDY / RESULTS ═══ */}
      {(caseStudyResults.length > 0 || service.case_study_image) && (
        <section className="py-20 relative bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
                Proven Results
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3">
                Real Results for Real Businesses
              </h2>
            </div>
 
            <div className="max-w-4xl mx-auto">
               {/* Case Study Image */}
               {service.case_study_image && (
                   <div className="mb-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img 
                            src={service.case_study_image} 
                            alt={`${service.title} Case Study`} 
                            className="w-full h-auto"
                        />
                   </div>
               )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caseStudyResults.map((cs) => (
                    <div key={cs.title} className="glass rounded-2xl p-8 hover:border-[var(--color-primary)]/30 transition-all">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-3 py-1 rounded-full">
                        {cs.industry}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-4 mb-6 font-[family-name:var(--font-heading)]">{cs.title}</h3>
                    <div className="space-y-4">
                        {cs.metrics.map((metric) => (
                        <div key={metric.label} className="flex items-center gap-3">
                            <span className="glow-text font-[family-name:var(--font-heading)] font-bold text-xl min-w-[60px]">{metric.value}</span>
                            <span className="text-[var(--color-text-secondary)] text-sm">{metric.label}</span>
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 7: TECHNOLOGIES ═══ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              Technology
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3">
              Technologies & Tools We Work With
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {service.technologies.map((tech) => (
              <span key={tech} className="glass rounded-lg px-5 py-2.5 text-sm font-[family-name:var(--font-heading)] text-[var(--color-text-secondary)] font-medium hover:text-white hover:border-[var(--color-primary)]/30 transition-all cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: FAQ ═══ */}
      <FAQSection faqs={service.faqs} />

      {/* ═══ SECTION 9: FINAL CTA ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="orb orb-orange w-[300px] h-[300px] top-[-20%] left-[30%]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-accent)]/5" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started with <span className="glow-text">{service.title}</span>?
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto mb-10">
            Let&apos;s discuss your project and create a custom solution for your business needs
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
            Schedule Consultation <ArrowRight size={18} />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10 text-[var(--color-text-secondary)]">
            <a href="tel:+918888885285" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={18} className="text-[var(--color-primary)]" />
              <span className="text-sm">+91 88888 85285</span>
            </a>
            <a href="mailto:info@genesoftinfotech.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={18} className="text-[var(--color-primary)]" />
              <span className="text-sm">info@genesoftinfotech.com</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
