import Link from "next/link";
import Image from "next/image";
import { GlowCard } from "@/components/Motion";
import { ArrowRight } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

interface ServiceProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  icon_name?: string;
  image_url?: string;
}

export default function ServiceCard({ service }: { service: ServiceProps }) {
  return (
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
          <div className="w-full h-48 mb-6 rounded-xl overflow-hidden relative group-hover:shadow-lg transition-all">
             <ImagePlaceholder text={service.title} />
          </div>
        )}
        
        <div className="mb-4 text-[var(--color-primary)] bg-[var(--color-primary)]/10 w-fit p-3 rounded-lg relative z-10 transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-black">
          <DynamicIcon name={service.icon || service.icon_name || 'Code2'} />
        </div>
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
  );
}
