"use client";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading, user } = useProfile();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
     return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      <DashboardSidebar userRole={profile?.role} />
      <main className="flex-1 p-4 md:p-8 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
