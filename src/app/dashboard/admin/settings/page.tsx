"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Globe, Phone, Mail, MapPin, Linkedin, Twitter, Instagram, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

import ImageUpload from "@/components/ImageUpload";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("general");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const formatted: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => {
          formatted[item.key] = item.value;
        });
        setSettings(formatted);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setNotification(null);
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value as string,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('site_settings').upsert(updates);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (error) {
      setNotification({ type: 'error', message: "Error saving settings!" });
    } else {
      setNotification({ type: 'success', message: "Settings saved successfully!" });
    }
    setSaving(false);

    // clear notification after 3 seconds
    setTimeout(() => {
        setNotification(null);
    }, 3000);
  };

  if (loading) return <div className="text-white p-8">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white mb-2 transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Site Settings</h1>
                <p className="text-[var(--color-text-muted)] text-sm">Manage global website configuration</p>
            </div>
          
          <div className="flex items-center gap-4">
            {notification && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {notification.message}
                </div>
            )}
            <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[var(--color-primary)]/20"
            >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-2 overflow-x-auto">
            <TabButton label="General Info" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
            <TabButton label="Branding" active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
            <TabButton label="Social Media" active={activeTab === 'social'} onClick={() => setActiveTab('social')} />
            <TabButton label="Landing Page" active={activeTab === 'landing'} onClick={() => setActiveTab('landing')} />
            <TabButton label="About Page" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
            <TabButton label="Integrations" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
            <TabButton label="Sitemap" active={activeTab === 'sitemap'} onClick={() => setActiveTab('sitemap')} />
        </div>

        {/* Content */}
        <div className="glass p-8 rounded-2xl border border-white/5 space-y-8 min-h-[500px]">
            
            {activeTab === 'general' && (
                <div className="space-y-6 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Company Name" 
                            value={settings.company_name} 
                            onChange={(v) => handleChange('company_name', v)} 
                            icon={<Globe size={18} />}
                        />
                        <InputGroup 
                            label="Tagline" 
                            value={settings.company_tagline} 
                            onChange={(v) => handleChange('company_tagline', v)} 
                            icon={<span className="text-lg font-bold">T</span>}
                        />
                    </div>
                    <div className="h-px bg-white/5 my-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Contact Email" 
                            value={settings.contact_email} 
                            onChange={(v) => handleChange('contact_email', v)} 
                            icon={<Mail size={18} />}
                        />
                        <InputGroup 
                            label="Contact Phone" 
                            value={settings.contact_phone} 
                            onChange={(v) => handleChange('contact_phone', v)} 
                            icon={<Phone size={18} />}
                        />
                    </div>
                    <InputGroup 
                        label="Address" 
                        value={settings.contact_address} 
                        onChange={(v) => handleChange('contact_address', v)} 
                        icon={<MapPin size={18} />}
                        textarea
                    />
                </div>
            )}

            {activeTab === 'branding' && (
                <div className="space-y-6 max-w-4xl">
                    <div className="bg-[var(--color-primary)]/5 p-6 rounded-xl border border-[var(--color-primary)]/10 mb-6">
                        <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">Branding & Assets</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Upload your company logo and favicon. These will be updated across the site.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUpload 
                            label="Company Logo"
                            value={settings.company_logo}
                            onChange={(url) => handleChange('company_logo', url)}
                        />
                        <ImageUpload 
                            label="Footer Logo (Optional)"
                            value={settings.footer_logo}
                            onChange={(url) => handleChange('footer_logo', url)}
                        />
                        <ImageUpload 
                            label="Favicon"
                            value={settings.company_favicon}
                            onChange={(url) => handleChange('company_favicon', url)}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'social' && (
                <div className="space-y-6 max-w-2xl">
                     <InputGroup 
                        label="LinkedIn URL" 
                        value={settings.social_linkedin} 
                        onChange={(v) => handleChange('social_linkedin', v)} 
                        icon={<Linkedin size={18} />}
                    />
                    <InputGroup 
                        label="Twitter (X) URL" 
                        value={settings.social_twitter} 
                        onChange={(v) => handleChange('social_twitter', v)} 
                         icon={<Twitter size={18} />}
                    />
                    <InputGroup 
                        label="Instagram URL" 
                        value={settings.social_instagram} 
                        onChange={(v) => handleChange('social_instagram', v)} 
                         icon={<Instagram size={18} />}
                    />
                </div>
            )}

            {activeTab === 'landing' && (
                <div className="space-y-6 max-w-3xl">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Hero Section</h3>
                    <div className="mb-6">
                        <ImageUpload 
                            label="Hero Background Image"
                            value={settings.home_hero_image}
                            onChange={(url) => handleChange('home_hero_image', url)}
                            folder="general"
                        />
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">Recommended size: 1920x1080px. Dark or abstract images work best.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Hero Title (White Text)" 
                            value={settings.home_hero_title} 
                            onChange={(v) => handleChange('home_hero_title', v)} 
                            icon={<span className="text-lg font-bold">H1</span>}
                        />
                        <InputGroup 
                            label="Hero Title Suffix (Glow Text)" 
                            value={settings.home_hero_title_suffix} 
                            onChange={(v) => handleChange('home_hero_title_suffix', v)} 
                            icon={<span className="text-lg font-bold">H1+</span>}
                        />
                    </div>
                    <InputGroup 
                        label="Hero Subtitle" 
                        value={settings.home_hero_subtitle} 
                        onChange={(v) => handleChange('home_hero_subtitle', v)} 
                         icon={<span className="text-lg font-bold">H2</span>}
                         textarea
                    />
                     <div className="grid grid-cols-2 gap-6">
                        <InputGroup 
                            label="CTA Text" 
                            value={settings.home_hero_cta_text} 
                            onChange={(v) => handleChange('home_hero_cta_text', v)} 
                            icon={<span className="text-lg font-bold">Btn</span>}
                        />
                         <InputGroup 
                            label="CTA Link" 
                            value={settings.home_hero_cta_link} 
                            onChange={(v) => handleChange('home_hero_cta_link', v)} 
                            icon={<span className="text-lg font-bold">Link</span>}
                        />
                     </div>


                    {/* Trust Indicators */}
                    <h3 className="text-xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-2">Trust Indicators (Counters)</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">Edit the stats shown below the main hero CTA.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/5 mb-6">
                        <div className="col-span-full mb-2 border-b border-white/10 pb-2">
                            <h4 className="font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Badge 1 (Users/Clients)</h4>
                        </div>
                        <InputGroup 
                            label="Value (e.g. 50+)" 
                            value={settings.trust_badge_1_value} 
                            onChange={(v) => handleChange('trust_badge_1_value', v)} 
                            icon={<span className="text-lg font-bold">#</span>}
                        />
                        <InputGroup 
                            label="Label (e.g. Businesses Served)" 
                            value={settings.trust_badge_1_label} 
                            onChange={(v) => handleChange('trust_badge_1_label', v)} 
                            icon={<span className="text-lg font-bold">Tt</span>}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/5 mb-6">
                        <div className="col-span-full mb-2 border-b border-white/10 pb-2">
                            <h4 className="font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Badge 2 (Projects/Work)</h4>
                        </div>
                        <InputGroup 
                            label="Value (e.g. 200+)" 
                            value={settings.trust_badge_2_value} 
                            onChange={(v) => handleChange('trust_badge_2_value', v)} 
                            icon={<span className="text-lg font-bold">#</span>}
                        />
                        <InputGroup 
                            label="Label (e.g. Projects Delivered)" 
                            value={settings.trust_badge_2_label} 
                            onChange={(v) => handleChange('trust_badge_2_label', v)} 
                            icon={<span className="text-lg font-bold">Tt</span>}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/5">
                        <div className="col-span-full mb-2 border-b border-white/10 pb-2">
                            <h4 className="font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white"></div> Badge 3 (Location/Team)</h4>
                        </div>
                        <InputGroup 
                            label="Value (e.g. Pune)" 
                            value={settings.trust_badge_3_value} 
                            onChange={(v) => handleChange('trust_badge_3_value', v)} 
                            icon={<span className="text-lg font-bold">#</span>}
                        />
                        <InputGroup 
                            label="Label (e.g. Based Company)" 
                            value={settings.trust_badge_3_label} 
                            onChange={(v) => handleChange('trust_badge_3_label', v)} 
                            icon={<span className="text-lg font-bold">Tt</span>}
                        />
                    </div>

                    {/* Section Labels */}
                    <h3 className="text-xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-2">Section Labels</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">Edit the labels and headings for each homepage section.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Services — Label" 
                            value={settings.section_services_label} 
                            onChange={(v) => handleChange('section_services_label', v)} 
                            icon={<span className="text-lg font-bold">Tag</span>}
                        />
                        <InputGroup 
                            label="Services — Heading" 
                            value={settings.section_services_heading} 
                            onChange={(v) => handleChange('section_services_heading', v)} 
                            icon={<span className="text-lg font-bold">H2</span>}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Work — Label" 
                            value={settings.section_work_label} 
                            onChange={(v) => handleChange('section_work_label', v)} 
                            icon={<span className="text-lg font-bold">Tag</span>}
                        />
                        <InputGroup 
                            label="Work — Heading" 
                            value={settings.section_work_heading} 
                            onChange={(v) => handleChange('section_work_heading', v)} 
                            icon={<span className="text-lg font-bold">H2</span>}
                        />
                    </div>
                    <InputGroup 
                        label="CTA — Heading" 
                        value={settings.section_cta_heading} 
                        onChange={(v) => handleChange('section_cta_heading', v)} 
                        icon={<span className="text-lg font-bold">H2</span>}
                    />
                    <InputGroup 
                        label="CTA — Subtitle" 
                        value={settings.section_cta_subtitle} 
                        onChange={(v) => handleChange('section_cta_subtitle', v)} 
                        icon={<span className="text-lg font-bold">P</span>}
                        textarea
                    />

                    {/* New Homepage Sections */}
                    <h3 className="text-xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-2">New Homepage Sections</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">Edit the labels and headings for the Value Proposition, How We Work, and Social Proof sections.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Value Proposition — Label" 
                            value={settings.section_value_prop_label} 
                            onChange={(v) => handleChange('section_value_prop_label', v)} 
                            icon={<span className="text-lg font-bold">Tag</span>}
                        />
                        <InputGroup 
                            label="Value Proposition — Heading" 
                            value={settings.section_value_prop_heading} 
                            onChange={(v) => handleChange('section_value_prop_heading', v)} 
                            icon={<span className="text-lg font-bold">H2</span>}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="How We Work — Label" 
                            value={settings.section_process_label} 
                            onChange={(v) => handleChange('section_process_label', v)} 
                            icon={<span className="text-lg font-bold">Tag</span>}
                        />
                        <InputGroup 
                            label="How We Work — Heading" 
                            value={settings.section_process_heading} 
                            onChange={(v) => handleChange('section_process_heading', v)} 
                            icon={<span className="text-lg font-bold">H2</span>}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Social Proof — Label" 
                            value={settings.section_social_proof_label} 
                            onChange={(v) => handleChange('section_social_proof_label', v)} 
                            icon={<span className="text-lg font-bold">Tag</span>}
                        />
                        <InputGroup 
                            label="Social Proof — Heading" 
                            value={settings.section_social_proof_heading} 
                            onChange={(v) => handleChange('section_social_proof_heading', v)} 
                            icon={<span className="text-lg font-bold">H2</span>}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="space-y-8 max-w-3xl">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             Google ReCAPTCHA
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6 bg-white/5 p-4 rounded-xl">
                            Protect your contact forms from spam. Get your keys from the <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline font-bold">Google ReCAPTCHA Admin Console</a>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup 
                                label="Site Key" 
                                value={settings.recaptcha_site_key} 
                                onChange={(v) => handleChange('recaptcha_site_key', v)} 
                                icon={<span className="text-lg font-bold">Key</span>}
                            />
                            <InputGroup 
                                label="Secret Key" 
                                value={settings.recaptcha_secret_key} 
                                onChange={(v) => handleChange('recaptcha_secret_key', v)} 
                                icon={<span className="text-lg font-bold">Sec</span>}
                            />
                        </div>
                    </div>
                    
                    <div className="h-px bg-white/10"></div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Google Analytics</h3>
                        <InputGroup 
                            label="Measurement ID (G-XXXXXXXXXX)" 
                            value={settings.google_analytics_id} 
                            onChange={(v) => handleChange('google_analytics_id', v)} 
                            icon={<span className="text-lg font-bold">GA</span>}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'about' && (
                <div className="space-y-6 max-w-3xl">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">About Page Configuration</h3>
                    
                    <div className="mb-6">
                        <ImageUpload 
                            label="Our Team Photo" 
                            value={settings.team_photo} 
                            onChange={(url) => handleChange('team_photo', url)} 
                            folder="about"
                        />
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                            A high-quality photo of your team or office to be displayed on the About page.
                        </p>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Years of Experience" 
                            value={settings.about_stats_years} 
                            onChange={(v) => handleChange('about_stats_years', v)} 
                            icon={<span className="text-lg font-bold">#</span>}
                        />
                        <InputGroup 
                            label="Projects Completed" 
                            value={settings.about_stats_projects} 
                            onChange={(v) => handleChange('about_stats_projects', v)} 
                            icon={<span className="text-lg font-bold">#</span>}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'sitemap' && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-4">Sitemap</h3>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)] mb-2">
                                The sitemap is generated automatically based on your pages and content.
                            </p>
                            <code className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded">/sitemap.xml</code>
                        </div>
                        <a 
                            href="/sitemap.xml" 
                            target="_blank" 
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 font-medium"
                        >
                            <Globe size={18} /> View Sitemap
                        </a>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`px-6 py-3 font-medium transition-all rounded-lg whitespace-nowrap ${active ? 'bg-[var(--color-primary)] text-black font-bold shadow-lg shadow-[var(--color-primary)]/20' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`}
        >
            {label}
        </button>
    )
}

function InputGroup({ label, value, onChange, icon, textarea }: { label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, textarea?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-3 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors pointer-events-none">
                    {icon}
                </div>
                {textarea ? (
                    <textarea 
                        title={label}
                        aria-label={label}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none min-h-[120px] transition-all"
                    />
                ) : (
                    <input 
                        title={label}
                        aria-label={label}
                        type="text" 
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                    />
                )}
            </div>
        </div>
    )
}
