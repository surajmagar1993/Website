"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import TicketList from "@/components/dashboard/TicketList";

export default function AdminTicketsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
      const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
      };
      getUser();
  }, []);

  if (!user) return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white mb-3 transition-colors text-sm">
               <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Support Tickets</h1>
            <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Manage customer inquiries and support issues</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 border-b border-white/10">
            <button 
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === 'all' ? 'bg-[var(--color-primary)] text-black shadow-lg shadow-[var(--color-primary)]/20' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`}
            >
                <MessageSquare size={18} /> All Tickets
            </button>
            <button 
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === 'pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`}
            >
                <Clock size={18} /> Pending
            </button>
            <button 
                onClick={() => setActiveTab("resolved")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === 'resolved' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`}
            >
                <CheckCircle size={18} /> Resolved
            </button>
            <button 
                onClick={() => setActiveTab("closed")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === 'closed' ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/20' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`}
            >
                <AlertCircle size={18} /> Closed
            </button>
        </div>

        {/* Ticket List */}
        <div className="glass p-8 rounded-2xl border border-white/5 shadow-2xl">
            <TicketList 
                userId={user.id} 
                role="admin" 
                statusFilter={activeTab === 'all' ? undefined : activeTab} 
            />
        </div>
    </div>
  );
}
