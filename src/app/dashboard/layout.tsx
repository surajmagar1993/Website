"use client";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      setRole(profile?.role);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
     return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      <DashboardSidebar userRole={role} />
      <main className="flex-1 p-8 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
