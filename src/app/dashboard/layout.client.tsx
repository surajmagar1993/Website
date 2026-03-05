"use client";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <main
      className={`flex-1 min-w-0 overflow-x-hidden p-4 md:p-8 transition-all duration-300 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      }`}
    >
      {children}
    </main>
  );
}

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
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
    <SidebarProvider>
      <div className="min-h-screen bg-[var(--color-bg)] flex">
        <DashboardSidebar userRole={profile?.role} />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
