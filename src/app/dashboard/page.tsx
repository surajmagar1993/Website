"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Package, MessageSquare, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import AssignmentsList from "@/components/dashboard/AssignmentsList";
import TicketList from "@/components/dashboard/TicketList";
import TicketForm from "@/components/dashboard/TicketForm";

interface User {
  id: string;
  email?: string;
}

interface Profile {
  id: string;
  role: string;
  full_name?: string;
  email?: string;
}

interface DashboardStats {
  clients: number;
  assignments: number;
  tickets: number;
  services: number;
  caseStudies: number;
  inquiries: number;
  users: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    clients: 0,
    assignments: 0,
    tickets: 0,
    services: 0,
    caseStudies: 0,
    inquiries: 0,
    users: 0,
  });

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

        if (false) { // FORCE CLIENT ROLE FOR TESTING
          const [
            { count: clientsCount },
            { count: assignmentsCount },
            { count: ticketsCount },
            { count: servicesCount },
            { count: caseStudiesCount },
            { count: inquiriesCount }
          ] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
            supabase.from("assignments").select("*", { count: "exact", head: true }),
            supabase.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
            supabase.from("services").select("*", { count: "exact", head: true }),
            supabase.from("case_studies").select("*", { count: "exact", head: true }),
            supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "unread"),
          ]);

          setStats({
            clients: clientsCount || 0,
            assignments: assignmentsCount || 0,
            tickets: ticketsCount || 0,
            services: servicesCount || 0,
            caseStudies: caseStudiesCount || 0,
            inquiries: inquiriesCount || 0,
            users: clientsCount || 0,
          });
        }
      }
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
     return null; // Layout handles loading state
  }

  return (
      <div className="space-y-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">
             {/* FORCE CLIENT ROLE FOR TESTING */} {'My Dashboard'}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Welcome back, {profile?.full_name || user?.email}
            </p>
        </div>

        {profile?.role === 'admin' ? (
          <div className="space-y-12">
            
            {/* 1. Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               <Link href="/dashboard/admin/users" className="glass p-5 rounded-2xl hover:bg-white/5 transition-all group border border-white/5 hover:border-[var(--color-primary)]/30">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/20 transition-colors">
                          <Users size={20} />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] bg-white/5 px-2 py-1 rounded-md">
                        Total
                      </div>
                  </div>
                  <div>
                      <h3 className="text-3xl font-bold text-white mb-1 font-[family-name:var(--font-heading)]">{stats.clients}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">Manage Clients</p>
                  </div>
               </Link>

               <Link href="/dashboard/admin/inquiries" className="glass p-5 rounded-2xl hover:bg-white/5 transition-all group border border-white/5 hover:border-pink-500/30">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                          <Mail size={20} />
                      </div>
                      {stats.inquiries > 0 && <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>}
                  </div>
                  <div>
                      <h3 className="text-3xl font-bold text-white mb-1 font-[family-name:var(--font-heading)]">{stats.inquiries}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">New Inquiries</p>
                  </div>
               </Link>

               <Link href="/dashboard/admin/tickets" className="glass p-5 rounded-2xl hover:bg-white/5 transition-all group border border-white/5 hover:border-orange-500/30">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                          <MessageSquare size={20} />
                      </div>
                      {stats.tickets > 0 && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>}
                  </div>
                  <div>
                      <h3 className="text-3xl font-bold text-white mb-1 font-[family-name:var(--font-heading)]">{stats.tickets}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">Pending Tickets</p>
                  </div>
               </Link>

               <Link href="/dashboard/admin/products" className="glass p-5 rounded-2xl hover:bg-white/5 transition-all group border border-white/5 hover:border-blue-500/30">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                          <Package size={20} />
                      </div>
                  </div>
                  <div>
                      <h3 className="text-3xl font-bold text-white mb-1 font-[family-name:var(--font-heading)]">{stats.assignments}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">Active Rentals</p>
                  </div>
               </Link>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Management Links */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Support Tickets Section */}
                    <div id="tickets" className="glass p-6 md:p-8 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl text-white font-[family-name:var(--font-heading)]">Recent Support Tickets</h3>
                            <Link href="/dashboard/admin/tickets" className="text-sm text-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-1">
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>
                <TicketList userId={user!.id} role="admin" />
                    </div>
                </div>

                {/* 3. System Status Widget */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)]">
                        <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--color-text-secondary)]">Database</span>
                                <span className="text-green-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Online</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--color-text-secondary)]">API Status</span>
                                <span className="text-green-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Stable</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>
  );
}
