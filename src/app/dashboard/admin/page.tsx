import AdminOverview from "@/components/admin/AdminOverview";

export default function AdminDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Welcome back, Admin. Here&apos;s what&apos;s happening today.
        </p>
      </div>
      
      <AdminOverview />
    </div>
  );
}
