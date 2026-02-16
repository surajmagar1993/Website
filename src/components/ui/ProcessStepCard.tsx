import { StaggerItem, GlowCard } from "@/components/Motion";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
}

export default function ProcessStepCard({ step, title, description }: ProcessStepProps) {
  return (
    <StaggerItem>
      <GlowCard className="h-full p-8 rounded-2xl relative overflow-hidden group hover:border-[var(--color-primary)]/30 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-10 font-[family-name:var(--font-heading)] text-6xl font-bold text-[var(--color-primary)] select-none group-hover:opacity-20 transition-opacity">
          0{step}
        </div>
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform">
          <DynamicIcon name={step === 1 ? 'Search' : step === 2 ? 'Map' : step === 3 ? 'Code2' : 'Rocket'} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-heading)]">
          {title}
        </h3>
        <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm relative z-10">
          {description}
        </p>
      </GlowCard>
    </StaggerItem>
  );
}
