"use client";

import { createClient } from "@/lib/supabase-client";
import { useEffect, useState, useCallback } from "react";
import { TableSkeleton } from "@/components/ui/Skeletons";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Log = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  }
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load logs");
    } else {
      setLogs(data as Log[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-6 md:p-10 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">Audit Logs</h1>
                <p className="text-[var(--color-text-muted)]">Track system activity and administrative actions.</p>
            </div>
            <button onClick={fetchLogs} className="btn-outline px-4 py-2 text-sm">
                Refresh
            </button>
        </header>

        {loading ? (
             <TableSkeleton rows={10} columns={4} />
        ) : (
            <div className="glass rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Action</th>
                                <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Entity</th>
                                <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Details</th>
                                <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">No activity recorded yet.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-white/5 transition-colors text-sm">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{log.profiles?.full_name || 'System'}</span>
                                                <span className="text-xs text-[var(--color-text-muted)]">{log.profiles?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-mono border ${
                                                log.action.includes('delete') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                log.action.includes('create') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[var(--color-text-secondary)]">
                                            {log.entity_type} <span className="opacity-50">#{log.entity_id?.slice(0, 8)}</span>
                                        </td>
                                        <td className="p-4 max-w-xs truncate text-[var(--color-text-muted)]" title={JSON.stringify(log.details, null, 2)}>
                                            {JSON.stringify(log.details)}
                                        </td>
                                        <td className="p-4 text-right text-[var(--color-text-muted)] whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
