"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AssignmentsList from "@/components/dashboard/AssignmentsList";
import TicketList from "@/components/dashboard/TicketList";
import TicketForm from "@/components/dashboard/TicketForm";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email?: string;
}

interface Profile {
  id: string;
  role: string;
  full_name?: string;
  email?: string;
  company_name?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setProfile(profileData);

        // Redirect Admin to their specific dashboard
        if (profileData?.role === 'admin') {
            router.replace('/dashboard/admin');
            return;
        }
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) {
     return <div className="p-8 text-[var(--color-text-muted)] animate-pulse">Loading dashboard...</div>;
  }

  // If user is admin (and hasn't redirected yet), show loading or null
  if (profile?.role === 'admin') return null;

  return (
      <div className="space-y-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">
             My Dashboard
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Welcome back, {profile?.full_name || profile?.company_name || user?.email}
            </p>
        </div>

          <div className="space-y-8">
            <div className="glass p-8 rounded-2xl">
               {/* Client Widgets */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl text-white font-[family-name:var(--font-heading)]">Your Rented Products</h3>
                    <Link href="/dashboard/catalog" className="text-sm text-[var(--color-primary)] hover:text-white transition-colors">
                        Browse Catalog &rarr;
                    </Link>
                  </div>
                  <AssignmentsList />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass p-8 rounded-2xl">
                <h3 className="text-xl text-white font-[family-name:var(--font-heading)] mb-6">Your Support Tickets</h3>
                {user && <TicketList userId={user.id} role="client" />}
              </div>
              <div>
                <TicketForm onSuccess={() => {
                  // TicketList subscribes to changes, so it will update automatically
                }} />
              </div>
            </div>
          </div>
      </div>
  );
}
