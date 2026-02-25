import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";

import InteractiveGlobe from "@/components/ui/InteractiveGlobe";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <div className="fixed inset-0 z-[-1]">
        <InteractiveGlobe 
          particleColor="rgba(249, 115, 22, 0.9)" 
          rotationSpeed={0.003}
          radius={300}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/80 via-transparent to-[var(--color-bg)]" />
      </div>
      <Header settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
