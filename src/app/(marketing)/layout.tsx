import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import { getCurrentHolidayTheme } from "@/lib/theme-calendar";
import { 
  DiwaliAnimation, HoliAnimation, IndependenceAnimation, 
  NavratriAnimation, ChristmasAnimation, NewYearAnimation, ValentineAnimation 
} from "@/components/FestivalAnimations";
import InteractiveGlobe from "@/components/ui/InteractiveGlobe";
import GeometricGrid from "@/components/ui/GeometricGrid";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const backgroundAnimation = settings.background_animation || "globe";

  let activeTheme = settings.active_theme || 'auto';
  if (activeTheme === 'auto') {
    const holidayTheme = getCurrentHolidayTheme();
    if (holidayTheme) {
      activeTheme = holidayTheme.replace('theme-', '');
    } else {
      activeTheme = 'default';
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[-1]">
        {/* Festival Animations */}
        {activeTheme === 'diwali' && <DiwaliAnimation />}
        {activeTheme === 'holi' && <HoliAnimation />}
        {activeTheme === 'independence' && <IndependenceAnimation />}
        {activeTheme === 'navratri' && <NavratriAnimation />}
        {activeTheme === 'christmas' && <ChristmasAnimation />}
        {activeTheme === 'newyear' && <NewYearAnimation />}
        {activeTheme === 'valentine' && <ValentineAnimation />}

        {/* Standard Animations */}
        {activeTheme === 'default' && backgroundAnimation === "globe" && (
            <InteractiveGlobe 
                particleColor="rgba(249, 115, 22, 0.9)" 
                rotationSpeed={0.003}
                radius={300}
            />
        )}
        {activeTheme === 'default' && backgroundAnimation === "grid" && (
            <GeometricGrid />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/80 via-transparent to-[var(--color-bg)]" />
      </div>
      <Header settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
