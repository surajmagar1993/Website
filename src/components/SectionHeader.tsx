/** SectionHeader — Animated section title with optional subtitle, used across all marketing pages. */
import { FadeIn } from "./Motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-16", align === "center" ? "text-center" : "text-left", className)}>
      <FadeIn>
        <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          {title}
        </h2>
      </FadeIn>
      {subtitle && (
        <FadeIn delay={0.2}>
          <p className={cn("text-[var(--color-text-secondary)] text-lg max-w-2xl", align === "center" ? "mx-auto" : "")}>
            {subtitle}
          </p>
        </FadeIn>
      )}
    </div>
  );
}
