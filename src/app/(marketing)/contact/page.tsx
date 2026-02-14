import ContactForm from "@/components/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const businessHours = [
  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Genesoft Infotech. We're ready to discuss your project.",
};

import { getSiteSettings } from "@/lib/settings";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="orb orb-teal w-[400px] h-[400px] top-[-10%] left-[-10%]" />
        <div className="orb orb-amber w-[250px] h-[250px] bottom-[-10%] right-[-5%]" />

        <div className="container mx-auto px-6 max-w-4xl">
          <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium fade-up">
            Contact Us
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-8 fade-up fade-up-delay-1">
            Let&apos;s start a <span className="glow-text">conversation.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed fade-up fade-up-delay-2">
            Whether you have a project in mind or just want to explore possibilities,
            we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="pb-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 glass rounded-2xl p-8 md:p-10 gradient-border">
              <ContactForm siteKey={settings.recaptcha_site_key} />
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-2xl p-8">
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-white mb-6">Direct Contact</h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Address</p>
                      <p className="text-[var(--color-text-secondary)] text-sm whitespace-pre-line">
                        {settings.contact_address || "Shivtirtha Bungalow, Lane No.15,\nPrabhat Road, Erandwane,\nPune, Maharashtra 411004"}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Email</p>
                      <a href={`mailto:${settings.contact_email || "info@genesoftinfotech.com"}`} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm transition-colors">
                        {settings.contact_email || "info@genesoftinfotech.com"}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Phone</p>
                      <a href={`tel:${settings.contact_phone || "+918888885285"}`} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm transition-colors">
                        {settings.contact_phone || "+91 8888885285"}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="glass rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Clock size={18} className="text-[var(--color-primary)]" />
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-white">Business Hours</h3>
                </div>
                <ul className="space-y-3">
                  {businessHours.map((item) => (
                    <li key={item.day} className="flex justify-between items-center">
                      <span className="text-[var(--color-text-secondary)] text-sm">{item.day}</span>
                      <span className={`text-sm font-medium ${item.hours === "Closed" ? "text-red-400" : "text-[var(--color-primary)]"}`}>{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Map */}
              <div className="glass rounded-2xl overflow-hidden h-[200px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.456!2d73.8303!3d18.5142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMwJzUxLjEiTiA3M8KwNDknNDkuMSJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  className="w-full h-full map-dark-filter border-0"
                  allowFullScreen
                  loading="lazy"
                  title="Genesoft Infotech Office Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
