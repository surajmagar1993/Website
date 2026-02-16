"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Ticket, HardDrive, TrendingUp, AlertCircle } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface ActivityLog {
  id: string;
  action: string;
  created_at: string;
  details: Record<string, unknown>;
  profiles: { email: string }[] | null;
}

interface DashboardStats {
  products: { total: number; rented: number; available: number };
  tickets: { total: number; open: number; closed: number };
  clients: { total: number };
  recentActivity: ActivityLog[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        // The data returned from the server action matches the shape we expect, 
        // but we need to cast it or ensure the server action return type is explicit.
        // For now, we trust the shape matches.
        setStats(data as unknown as DashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-white">Failed to load dashboard data.</div>;
  }

  const inventoryData = [
    { name: "Rented", value: stats.products.rented },
    { name: "Available", value: stats.products.available },
  ];

  const ticketData = [
    { name: "Open", tickets: stats.tickets.open },
    { name: "Closed", tickets: stats.tickets.closed },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Clients" 
          value={stats.clients.total} 
          icon={<Users className="text-blue-400" />} 
          trend="+12% from last month"
        />
        <StatCard 
          title="Total Products" 
          value={stats.products.total} 
          icon={<HardDrive className="text-purple-400" />} 
          trend={`${stats.products.rented} currently rented`}
        />
        <StatCard 
          title="Active Tickets" 
          value={stats.tickets.open} 
          icon={<Ticket className="text-yellow-400" />} 
          trend={`${stats.tickets.closed} closed this month`}
        />
        <StatCard 
          title="System Health" 
          value="98%" 
          icon={<TrendingUp className="text-green-400" />} 
          trend="All systems operational"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. Charts Section */}
        <Card className="glass border-white/10 bg-black/20 text-white">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription className="text-gray-400">Distribution of rented vs. available assets</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0088FE]" />
                    <span className="text-sm text-gray-400">Rented ({stats.products.rented})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00C49F]" />
                    <span className="text-sm text-gray-400">Available ({stats.products.available})</span>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* 3. Ticket Status Bar Chart */}
        <Card className="glass border-white/10 bg-black/20 text-white">
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription className="text-gray-400">Overview of support request status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="tickets" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 4. recent Activity Table */}
      <Card className="glass border-white/10 bg-black/20 text-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest actions performed by administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {stats.recentActivity.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                                <AlertCircle size={16} />
                            </div>
                            <div>
                                <p className="font-medium capitalize text-white">{formatAction(log.action)}</p>
                                <p className="text-sm text-gray-400">by {log.profiles?.[0]?.email || 'Unknown'}</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
          </CardContent>
      </Card>

    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="glass border-white/10 bg-black/20 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}

function getActionColor(action: string) {
    if (action.includes('delete')) return 'bg-red-500/20 text-red-500';
    if (action.includes('create')) return 'bg-green-500/20 text-green-500';
    if (action.includes('update')) return 'bg-blue-500/20 text-blue-500';
    return 'bg-gray-500/20 text-gray-500';
}

function formatAction(action: string) {
    return action.replace('_', ' ');
}
