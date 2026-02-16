"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  MessageSquare, 
  Settings, 
  Briefcase, 
  Globe, 
  Mail, 
  LogOut, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  Image as ImageIcon,
  AlertOctagon
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface DashboardSidebarProps {
  userRole?: string;
}

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes - handled by Link click now
  
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const adminLinks = [
    { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/admin/inquiries", label: "Inquiries", icon: <Mail size={20} /> },
    { href: "/dashboard/admin/users", label: "Clients", icon: <Users size={20} /> },
    { href: "/dashboard/admin/services", label: "Services", icon: <Settings size={20} /> },
    { href: "/dashboard/admin/products", label: "Products", icon: <Package size={20} /> },
    { href: "/dashboard/admin/work", label: "Case Studies", icon: <Briefcase size={20} /> },
    { href: "/dashboard/admin/tickets", label: "Tickets", icon: <MessageSquare size={20} /> },
    { href: "/dashboard/admin/seo", label: "SEO", icon: <Globe size={20} /> },
    { href: "/dashboard/admin/media", label: "Media Library", icon: <ImageIcon size={20} /> },
    { href: "/dashboard/admin/logs", label: "System Logs", icon: <AlertOctagon size={20} /> },
    { href: "/dashboard/admin/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const clientLinks = [
    { href: "/dashboard", label: "My Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/profile", label: "Profile", icon: <UserIcon size={20} /> },
  ];

  const links = userRole === 'admin' ? adminLinks : clientLinks;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--color-bg)] border-b border-white/10 flex items-center justify-between px-4 z-50">
        <Link href="/" className="font-bold text-lg text-white font-[family-name:var(--font-heading)]">
          Genesoft
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          title={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out
        bg-[var(--color-bg)] h-full w-64 border-r border-white/5 shadow-2xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        <div className="flex flex-col h-full bg-[var(--color-surface)]">
          {/* Logo Area */}
          <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <Link href="/" className="font-bold text-xl text-white font-[family-name:var(--font-heading)] truncate">
                Genesoft
              </Link>
            )}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-white transition-colors hidden md:block"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' 
                      : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? link.label : undefined}
                >
                  <div className={`${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] group-hover:text-white'}`}>
                    {link.icon}
                  </div>
                  {!collapsed && (
                    <span className="truncate">{link.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                text-red-400 hover:bg-red-500/10 hover:text-red-300
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut size={20} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Spacer */}
      <div className="md:hidden h-16" />
    </>
  );
}
