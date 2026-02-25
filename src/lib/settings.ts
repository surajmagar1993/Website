/** Settings — Fetches global site configuration from the `site_settings` Supabase table. */
import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  company_name?: string;
  company_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  social_linkedin?: string;
  social_twitter?: string;
  social_instagram?: string;
  company_logo?: string;
  footer_logo?: string;
  company_favicon?: string;
  home_hero_title?: string;
  home_hero_title_suffix?: string;
  home_hero_subtitle?: string;
  home_hero_image?: string;
  home_hero_cta_text?: string;
  home_hero_cta_link?: string;
  /* Section labels & headings — editable from Landing Page tab */
  section_services_label?: string;
  section_services_heading?: string;
  section_work_label?: string;
  section_work_heading?: string;
  section_cta_heading?: string;
  section_cta_subtitle?: string;
  section_value_prop_label?: string;
  section_value_prop_heading?: string;
  section_process_label?: string;
  section_process_heading?: string;
  section_social_proof_label?: string;
  section_social_proof_heading?: string;
  recaptcha_site_key?: string;
  recaptcha_secret_key?: string;
  google_analytics_id?: string;
  
  /* Trust Indicators (Hero Counters) */
  trust_badge_1_value?: string;
  trust_badge_1_label?: string;
  trust_badge_2_value?: string;
  trust_badge_2_label?: string;
  trust_badge_3_value?: string;
  trust_badge_3_label?: string;
  /* Img Assets */
  team_photo?: string;
  [key: string]: string | undefined;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from('site_settings').select('*');
  
  const settings: SiteSettings = {};
  
  if (data) {
    data.forEach((item: { key: string; value: string }) => {
      settings[item.key] = item.value;
    });
  }

  return settings;
}
