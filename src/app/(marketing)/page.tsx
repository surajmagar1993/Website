import { supabase } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import * as Icons from "lucide-react";
import { GlowCard, StaggerItem, FadeIn, ParallaxOrb, StaggerContainer } from "@/components/Motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Users, Briefcase, MapPin, Crosshair, BarChart3, Handshake, Phone, Mail, Clock } from "lucide-react";
import { getPageSeo } from "@/lib/seo";
import Image from "next/image";
import { HyperText } from "@/components/ui/HyperText";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";


const DynamicIcon = ({ name }: { name: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon size={32} />;
};

export async function generateMetadata() {
  return await getPageSeo('/');
}



const valueProps = [
  {
    icon: <Crosshair size={28} />,
    title: "End-to-End Expertise",
    description: "We don't just build software — we understand your business. Complete strategy to ongoing support.",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Results, Not Just Deliverables",
    description: "Your success is our metric. We focus on outcomes: revenue, efficiency, and lasting competitive advantages.",
  },
  {
    icon: <Handshake size={28} />,
    title: "Transparent & Agile",
    description: "No tech jargon, no surprises. Clear communication and regular updates every step of the way.",
  },
];

const processSteps = [
  { step: 1, title: "Discovery", description: "Understand your business, challenges, and goals" },
  { step: 2, title: "Strategy", description: "Design roadmap tailored to your objectives & budget" },
  { step: 3, title: "Development", description: "Build with precision, regular updates & milestones" },
  { step: 4, title: "Launch & Support", description: "Go live with training, monitoring & ongoing support" },
];

/* Client Logos Component */
async function ClientLogos() {
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (!clients || clients.length === 0) return null;

  const displayClients = [...clients, ...clients];

  return (
    <div className="relative overflow-hidden mt-12">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10" />
      <div className="logo-carousel hover:pause">
        {displayClients.map((client, i) => (
          <div
            key={`${client.id}-${i}`}
            className="mx-6 flex-shrink-0 flex items-center justify-center min-w-[140px] h-20 group cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={client.logo_url}
              alt={client.name}
              className="max-h-12 w-auto object-contain transition-transform group-hover:scale-110"
              title={client.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const settings = await getSiteSettings();

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

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <>
      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Global Animation is handled in layout.tsx */}






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
            {valueProps.map((prop) => (
              <StaggerItem key={prop.title}>
                <GlowCard className="h-full p-8 rounded-2xl text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6 text-[var(--color-primary)]">
                    {prop.icon}
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
                  <Link href={`/services/${service.slug}`} className="block h-full group">
                    <GlowCard className="h-full p-8 rounded-2xl flex flex-col relative overflow-hidden">
                      {service.image_url ? (
                        <div className="w-full h-48 mb-6 rounded-xl overflow-hidden relative group-hover:shadow-lg transition-all">
                          <Image 
                            src={service.image_url} 
                            alt={service.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/20 transition-colors">
                          <DynamicIcon name={service.icon} />
                        </div>
                      )}
                      
                      <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-heading)] group-hover:text-[var(--color-primary)] transition-colors relative z-10">
                        {service.title}
                      </h3>
                      <p className="text-[var(--color-text-muted)] leading-relaxed text-sm flex-1 relative z-10">
                        {service.description}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-[var(--color-primary)] text-sm font-[family-name:var(--font-heading)] font-medium group-hover:gap-3 transition-all relative z-10">
                        Learn More <ArrowRight size={16} />
                      </div>
                    </GlowCard>
                  </Link>
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
            {processSteps.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="glass rounded-2xl p-8 h-full relative group hover:border-[var(--color-primary)]/30 transition-all">
                  {/* Step number */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mb-6">
                    <span className="text-white font-[family-name:var(--font-heading)] font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-heading)]">{step.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{step.description}</p>

                  {/* Arrow connector (hidden on last item and mobile) */}
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight size={20} className="text-[var(--color-primary)]/50" />
                    </div>
                  )}
                </div>
              </StaggerItem>
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
            <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto mt-4">
              From startups to established enterprises, businesses rely on Genesoft to power their digital transformation
            </p>
          </FadeIn>

          {/* Client logos carousel */}
          <ClientLogos />

          {/* Testimonial */}
          <FadeIn delay={0.3}>
            <div className="glass-strong rounded-3xl p-10 md:p-14 max-w-3xl mx-auto mt-16 text-center gradient-border">
              <svg className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-6 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-[var(--color-text-secondary)] text-lg md:text-xl leading-relaxed italic mb-8">
                &ldquo;Working with Genesoft transformed how we operate. Their team didn&apos;t just deliver software — they became partners in our growth.&rdquo;
              </p>
              <div>
                <p className="text-white font-[family-name:var(--font-heading)] font-bold">Satisfied Client</p>
                <p className="text-[var(--color-text-muted)] text-sm">Enterprise Partner</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 6: RESULTS / CASE STUDIES ═══ */}
      <section className="py-24 relative">
        <ParallaxOrb speed={-0.2} className="orb orb-amber w-[250px] h-[250px] bottom-[10%] left-[-5%]" />

        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <FadeIn>
              <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
                {settings.section_work_label || "Results"}
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-white">
                {settings.section_work_heading || "Results That Speak for Themselves"}
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
                  <div className="glass p-6 rounded-3xl h-full border border-white/5 hover:border-[var(--color-primary)]/30 transition-all duration-500 flex flex-col">
                    {/* Case Study Image */}
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
                        
                        <div>
                            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent my-4" />
                            {study.results?.[0] && (
                                <p className="text-[var(--color-text-secondary)] font-medium">
                                <span className="text-white font-bold">{study.results[0].value}</span> {study.results[0].label}
                                </p>
                            )}
                        </div>
                    </div>
                  </div>
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

        {/* Gradient overlay for high-contrast CTA */}
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

            {/* Contact info */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 text-[var(--color-text-secondary)]">
              <a href="tel:+918888885285" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm">+91 88888 85285</span>
              </a>
              <a href="mailto:info@genesoftinfotech.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm">info@genesoftinfotech.com</span>
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
