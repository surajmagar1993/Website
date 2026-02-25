import { Rocket, Eye, Clock, Lightbulb, Users, Shield, TrendingUp, Linkedin, Twitter } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

const timeline = [
  { year: "2021", title: "Founded", desc: "Started in Pune with a mission to democratize IT solutions for growing businesses." },
  { year: "2022", title: "100+ Clients", desc: "Expanded service offerings to include data analytics and lead generation." },
  { year: "2023", title: "IT Products Division", desc: "Launched hardware rental and procurement services for enterprises." },
  { year: "2024", title: "500+ Clients", desc: "Crossed 500 clients milestone. Opened expanded Pune office." },
  { year: "2025", title: "Digital Transformation", desc: "Full-stack digital transformation — from strategy to deployment." },
];

const values = [
  { icon: <Lightbulb size={24} />, title: "Innovation First", desc: "We stay ahead of tech trends to give you a competitive edge." },
  { icon: <Users size={24} />, title: "Client Centric", desc: "Every solution is tailored. We listen, then we build." },
  { icon: <Shield size={24} />, title: "Trust & Integrity", desc: "Transparent communication, honest timelines, no surprises." },
  { icon: <TrendingUp size={24} />, title: "Data Driven", desc: "Decisions backed by analytics, not assumptions." },
];

const teamMembers = [
    { name: "Amit Deshmukh", role: "Founder & CEO", image: null },
    { name: "Sarah Johnson", role: "CTO", image: null },
    { name: "Rahul Verma", role: "Head of Operations", image: null },
    { name: "Priya Singh", role: "Lead Designer", image: null },
];

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const teamPhoto = settings.team_photo;

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="orb orb-teal w-[400px] h-[400px] top-[-5%] right-[-10%]" />
        <div className="orb orb-amber w-[300px] h-[300px] bottom-[-10%] left-[-5%]" />

        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium fade-up">
                    About Us
                </span>
                <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-8 fade-up fade-up-delay-1">
                    Built to solve. <br/><span className="glow-text">Driven to deliver.</span>
                </h1>
                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed fade-up fade-up-delay-2 mb-8">
                    Founded in 2021 in Pune, India, Genesoft Infotech was born from a simple observation:
                    growing businesses struggle to access quality IT solutions without enterprise-scale budgets.
                    We bridge that gap. From a focused three-person team, we&apos;ve grown into a full-service
                    technology partner serving 500+ businesses across India.
                </p>
            </div>
            <div className="fade-up fade-up-delay-3">
                 <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                     {teamPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={teamPhoto} 
                            alt="Genesoft Infotech Team" 
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                     ) : (
                        <ImagePlaceholder height="400px" text="Team Photo Placeholder" />
                     )}
                     <div className="absolute bottom-6 left-6 z-20">
                         <p className="text-white font-bold text-lg">The Genesoft Team</p>
                         <p className="text-[var(--color-text-muted)] text-sm">Pune Headquarters, 2025</p>
                     </div>
                 </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-10 gradient-border hover:bg-white/5 transition-colors">
              <div className="text-[var(--color-primary)] mb-4"><Rocket size={28} /></div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                To deliver enterprise-grade IT solutions at accessible price points —
                empowering businesses of every size to compete with cutting-edge technology.
              </p>
            </div>
            <div className="glass rounded-2xl p-10 gradient-border hover:bg-white/5 transition-colors">
              <div className="text-[var(--color-accent)] mb-4"><Eye size={28} /></div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                To become India&apos;s most trusted technology partner for SMEs —
                known for reliability, innovation, and measurable impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
                    Our People
                </span>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white mt-3">
                    Meet the leadership.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamMembers.map((member, i) => (
                      <div key={i} className="group relative overflow-hidden rounded-2xl">
                          <div className="aspect-[4/5] bg-white/5">
                              {member.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                              ) : (
                                  <ImagePlaceholder text={member.name} />
                              )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                              <h3 className="text-white font-bold text-lg">{member.name}</h3>
                              <p className="text-[var(--color-primary)] text-sm mb-3">{member.role}</p>
                              <div className="flex gap-3">
                                  <a href="#" className="text-white/70 hover:text-white" aria-label={`LinkedIn profile of ${member.name}`}><Linkedin size={18} /></a>
                                  <a href="#" className="text-white/70 hover:text-white" aria-label={`Twitter profile of ${member.name}`}><Twitter size={18} /></a>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 max-w-3xl">
          <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
            Our Journey
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white mt-3 mb-12">
            Growing with purpose.
          </h2>

          <div className="relative">
            {/* Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-glass-border)] to-transparent" />

            <div className="space-y-10">
              {timeline.map((item) => (
                <div key={item.year} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full glass-strong flex items-center justify-center border border-[var(--color-primary)]/30 z-10 bg-[var(--color-bg)]">
                    <Clock size={14} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="glass rounded-xl p-6 flex-1 group-hover:border-[var(--color-primary)]/30 transition-all duration-300 hover:translate-x-2">
                    <span className="glow-text font-[family-name:var(--font-heading)] text-sm font-bold">{item.year}</span>
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-white mt-1 mb-2">{item.title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 relative">
        <div className="orb orb-blue w-[300px] h-[300px] bottom-[0%] right-[-5%]" />

        <div className="container mx-auto px-6">
          <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
            What Drives Us
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white mt-3 mb-12">
            Our core values.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value) => (
              <div key={value.title} className="glass rounded-2xl p-8 group hover:border-[var(--color-primary)]/30 transition-all duration-300">
                <div className="text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform">{value.icon}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-white mb-3">{value.title}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
