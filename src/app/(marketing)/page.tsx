import { supabase } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import { GlowCard, StaggerItem, FadeIn, ParallaxOrb, StaggerContainer } from "@/components/Motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Users, Briefcase, MapPin, Phone, Mail, Clock } from "lucide-react";
import { getPageSeo } from "@/lib/seo";
import { HyperText } from "@/components/ui/HyperText";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import ClientLogos from "@/components/ui/ClientLogos";
import ServiceCard from "@/components/ui/ServiceCard";
import ProcessStepCard from "@/components/ui/ProcessStepCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";


export async function generateMetadata() {
  return await getPageSeo('/');
}

interface ValueProp {
  icon: string;
  title: string;
  description: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

// Fallback defaults for JSON content
const defaultValueProps: ValueProp[] = [
  { icon: "Crosshair", title: "End-to-End Expertise", description: "We don't just build software — we understand your business. Complete strategy to ongoing support." },
  { icon: "BarChart3", title: "Results, Not Just Deliverables", description: "Your success is our metric. We focus on outcomes: revenue, efficiency, and lasting competitive advantages." },
  { icon: "Handshake", title: "Transparent & Agile", description: "No tech jargon, no surprises. Clear communication and regular updates every step of the way." },
];

const defaultProcessSteps: ProcessStep[] = [
  { step: 1, title: "Discovery", description: "Understand your business, challenges, and goals" },
  { step: 2, title: "Strategy", description: "Design roadmap tailored to your objectives & budget" },
  { step: 3, title: "Development", description: "Build with precision, regular updates & milestones" },
  { step: 4, title: "Launch & Support", description: "Go live with training, monitoring & ongoing support" },
];


export default async function HomePage() {
  const settings = await getSiteSettings();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('*')
    .order('display_order', { ascending: true });

  // Parse Dynamic JSON Content
  let dynamicValueProps: ValueProp[] = defaultValueProps;
  try {
    if (settings.value_props_json) {
        const parsed = JSON.parse(settings.value_props_json);
        if (Array.isArray(parsed)) dynamicValueProps = parsed;
    }
  } catch (e) { 
    console.error("Error parsing value_props_json", e);
  }

  let dynamicProcessSteps: ProcessStep[] = defaultProcessSteps;
  try {
    if (settings.process_steps_json) {
        const parsed = JSON.parse(settings.process_steps_json);
        if (Array.isArray(parsed)) dynamicProcessSteps = parsed;
    }
  } catch (e) { 
    console.error("Error parsing process_steps_json", e);
  }

  const trustBadges = [
    { 
      value: settings.trust_badge_1_value || "50+", 
      label: settings.trust_badge_1_label || "Businesses Served", 
      icon: <Users size={20} /> 
    },
    { 
      value: settings.trust_badge_2_value || "200+", 
      label: settings.trust_badge_2_label || "Projects Delivered", 
      icon: <Briefcase size={20} /> 
    },
    { 
      value: settings.trust_badge_3_value || "Pune", 
      label: settings.trust_badge_3_label || "Based in India", 
      icon: <MapPin size={20} /> 
    },
  ];

  return (
    <>
      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 pt-32 pb-20">
          <div className="max-w-4xl text-center mx-auto">
            <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[900] text-white leading-[1.1] mb-8 tracking-tight flex flex-col items-center">
              <FadeIn delay={0.2} className="inline-block px-2">
                {settings.home_hero_title || "Transform Your Business With"}
              </FadeIn>
              <HyperText 
                text={settings.home_hero_title_suffix || "Technology That Works."} 
                className="glow-text mt-2 px-2 max-w-[12ch] sm:max-w-none text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-heading)] font-[900]"
              />
            </h1>

            <FadeIn delay={0.6}>
              <p className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                {settings.home_hero_subtitle || "From custom software to data-driven insights, we build digital solutions that drive real results for ambitious businesses across India and beyond."}
              </p>
            </FadeIn>

            <FadeIn delay={0.8} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={settings.home_hero_cta_link || "/contact"} className="btn-primary inline-flex items-center gap-2 justify-center group">
                {settings.home_hero_cta_text || "Get Free Consultation"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/work" className="btn-outline inline-flex items-center gap-2 justify-center group">
                 View Our Work <ArrowRight size={18} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </Link>
            </FadeIn>

            {/* Trust Badges */}
            <FadeIn delay={1.0}>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-16 pt-8 border-t border-[var(--color-glass-border)]">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 md:gap-3 text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-primary)]">{badge.icon}</span>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2 leading-tight">
                        <span className="font-[family-name:var(--font-heading)] font-bold text-white text-base md:text-lg">{badge.value}</span>
                        <span className="text-xs md:text-sm">{badge.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: VALUE PROPOSITION ═══ */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              {settings.section_value_prop_label || "Why Us"}
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-white">
              {settings.section_value_prop_heading || "Why Growing Businesses Choose Genesoft"}
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dynamicValueProps.map((prop: ValueProp) => (
              <StaggerItem key={prop.title}>
                <GlowCard className="h-full p-8 rounded-2xl text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6 text-[var(--color-primary)]">
                    <DynamicIcon name={prop.icon || 'Crosshair'} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
                    {prop.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">
                    {prop.description}
                  </p>
                </GlowCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ SECTION 3: SERVICES SHOWCASE ═══ */}
      <section className="py-24 relative bg-black/20">
        <ParallaxOrb speed={0.4} className="orb orb-orange w-[300px] h-[300px] top-[10%] right-[-10%]" />

        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              {settings.section_services_label || "Our Services"}
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-white">
              {settings.section_services_heading || "Solutions Built for Your Growth"}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto mt-4">
              Whether you need digital presence, custom software, or data insights — we have the expertise to make it happen
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!services || services.length === 0 ? (
              <div className="col-span-full text-center text-[var(--color-text-muted)] py-12 border border-dashed border-white/10 rounded-xl">
                <p>Services not yet configured. Please add them in the Admin Dashboard.</p>
              </div>
            ) : (
              services.map((service) => (
                <StaggerItem key={service.id}>
                  <ServiceCard service={service} />
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ SECTION 4: HOW WE WORK ═══ */}
      <section className="py-24 relative">
        <ParallaxOrb speed={-0.2} className="orb orb-blue w-[300px] h-[300px] top-[20%] left-[-5%]" />

        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              {settings.section_process_label || "Our Process"}
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-white">
              {settings.section_process_heading || "Simple, Transparent, Effective"}
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicProcessSteps.map((step: ProcessStep) => (
              <ProcessStepCard 
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
              />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ SECTION 5: SOCIAL PROOF ═══ */}
      <section className="py-24 border-y border-[var(--color-glass-border)] relative overflow-hidden">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
              {settings.section_social_proof_label || "Trusted Partners"}
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-white">
              {settings.section_social_proof_heading || "Trusted by Forward-Thinking Companies"}
            </h2>
          </FadeIn>

          <ClientLogos />
        </div>
      </section>

      {/* ═══ SECTION 6: PORTFOLIO ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <FadeIn className="max-w-2xl">
              <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
                {settings.section_portfolio_label || "Portfolio"}
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-white leading-[1.1]">
                {settings.section_portfolio_heading || "Success Stories We've Built Together"}
              </h2>
            </FadeIn>
            <FadeIn direction="left" delay={0.2}>
               <Link href="/work" className="flex items-center gap-2 text-[var(--color-primary)] hover:text-white transition-colors pb-2 border-b border-[var(--color-primary)]/30 hover:border-white">
                View All Projects <ArrowRight size={16} />
              </Link>
            </FadeIn>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!caseStudies || caseStudies.length === 0 ? (
              <div className="col-span-full text-center text-[var(--color-text-muted)] py-12 border border-dashed border-white/10 rounded-xl">
                 <p>Case Studies not yet configured.</p>
              </div>
            ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (caseStudies as any[]).map((study) => (
                <StaggerItem key={study.id} className="group cursor-pointer">
                  <Link href={`/work/${study.slug}`} className="block h-full">
                    <div className="glass p-6 rounded-3xl h-full border border-white/5 hover:border-[var(--color-primary)]/30 transition-all duration-500 flex flex-col">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 relative bg-black/20">
                            {study.case_study_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                    src={study.case_study_image} 
                                    alt={study.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                                />
                            ) : (
                                <ImagePlaceholder text="Case Study Image" />
                            )}
                            <div className="absolute top-4 right-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] bg-black/50 backdrop-blur-md border border-[var(--color-primary)]/20 px-3 py-1 rounded-full">
                                    {study.category}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] group-hover:text-[var(--color-primary)] transition-colors">
                                        {study.title}
                                    </h3>
                                    <ArrowUpRight className="text-[var(--color-text-muted)] group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0 mt-1" />
                                </div>
                                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6 line-clamp-3">
                                    {study.description}
                                </p>
                            </div>
                        </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ SECTION 7: FINAL CTA ═══ */}
      <section className="py-32 relative overflow-hidden">
        <ParallaxOrb speed={0.6} className="orb orb-orange w-[400px] h-[400px] top-[-20%] left-[20%]" />
        <ParallaxOrb speed={-0.4} className="orb orb-blue w-[300px] h-[300px] bottom-[-20%] right-[10%]" />

        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-accent)]/5" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <FadeIn direction="up">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {settings.section_cta_heading || <>Ready to <span className="glow-text">Transform Your Business?</span></>}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto mb-10">
              {settings.section_cta_subtitle || "Let\u2019s discuss how technology can solve your biggest challenges and unlock new opportunities"}
            </p>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
              Schedule Your Free Consultation <ArrowRight size={18} />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 text-[var(--color-text-secondary)]">
              <a href={`tel:${settings.contact_phone || '+918888885285'}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm">{settings.contact_phone || "+91 88888 85285"}</span>
              </a>
              <a href={`mailto:${settings.contact_email || 'info@genesoftinfotech.com'}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm">{settings.contact_email || "info@genesoftinfotech.com"}</span>
              </a>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm">Response within 24 hours</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
