import { supabase } from "@/lib/supabase";

export default async function ClientLogos() {
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, logo_url')
    .eq('role', 'client')
    .not('logo_url', 'is', null)
    .order('created_at', { ascending: false });

  if (!clients || clients.length === 0) return null;

  const displayClients = [...clients, ...clients];

  return (
    <div className="relative overflow-hidden mt-12">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10" />
      <div className="logo-carousel hover:pause">
        {displayClients.map((client, i) => (
          <div
            key={`${client.id}-${i}`}
            className="mx-6 flex-shrink-0 flex items-center justify-center min-w-[140px] h-20 group cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={client.logo_url}
              alt={client.full_name}
              className="max-h-12 w-auto object-contain transition-transform group-hover:scale-110"
              title={client.full_name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
