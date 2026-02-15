import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, Globe, Smartphone, Search, BarChart3, Target, Monitor, Code, Database, Cloud, Shield, Zap, Layout, Server, Cpu } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

// Extended icon map to cover more potential icons
const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe size={32} />,
  Smartphone: <Smartphone size={32} />,
  Search: <Search size={32} />,
  BarChart3: <BarChart3 size={32} />,
  Target: <Target size={32} />,
  Monitor: <Monitor size={32} />,
  Code: <Code size={32} />,
  Database: <Database size={32} />,
  Cloud: <Cloud size={32} />,
  Shield: <Shield size={32} />,
  Zap: <Zap size={32} />,
  Layout: <Layout size={32} />,
  Server: <Server size={32} />,
  Cpu: <Cpu size={32} />,
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ServicesPage() {
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });

  const safeServices = services || [];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeServices.map((service, i) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`glass rounded-2xl p-6 group hover:border-[var(--color-primary)]/30 transition-all duration-300 flex flex-col h-full fade-up fade-up-delay-${Math.min(i + 1, 6)} hover:-translate-y-1`}
              >
                {/* Image Section */}
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 bg-black/20 border border-white/5 relative">
                   {service.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={service.image_url} 
                        alt={service.title} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                      />
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/0 group-hover:scale-105 transition-transform duration-500">
                           <div className="text-[var(--color-primary)] mb-3 opacity-80">
                               {iconMap[service.icon] || <Globe size={40} />}
                           </div>
                           <p className="text-xs text-[var(--color-text-muted)] font-medium">Explore Service</p>
                      </div>
                   )}
                   
                   {/* Overlay Number */}
                   <div className="absolute top-4 right-4 text-4xl font-[family-name:var(--font-heading)] font-bold text-white/5 group-hover:text-white/10 transition-colors">
                      {String(i + 1).padStart(2, "0")}
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-3 text-white group-hover:text-[var(--color-primary)] transition-colors flex items-center justify-between">
                    {service.title}
                    <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--color-primary)] space-x-reverse" />
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6 line-clamp-3">
                    {service.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-white/5">
                      <div className="flex flex-wrap gap-2">
                        {(service.technologies && service.technologies.length > 0 ? service.technologies : service.features || []).slice(0, 3).map((h: string) => (
                          <span key={h} className="text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[var(--color-text-muted)] bg-white/5 rounded px-2 py-1">
                            {h}
                          </span>
                        ))}
                        {(service.technologies?.length > 3 || service.features?.length > 3) && (
                            <span className="text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[var(--color-text-muted)] bg-white/5 rounded px-2 py-1">
                                +More
                            </span>
                        )}
                      </div>
                  </div>
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
