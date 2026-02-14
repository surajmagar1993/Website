"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertTriangle, Info, XCircle, AlertOctagon, Trash2, RefreshCw } from "lucide-react";

interface LogEntry {
  id: string;
  created_at: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  details: unknown;
  path: string;
  user_id: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [clearConfirm, setClearConfirm] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter !== "all") {
      query = query.eq("severity", filter);
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching logs:", error);
    else setLogs(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const getIcon = (severity: string) => {
    switch (severity) {
      case "info": return <Info className="text-blue-400" size={18} />;
      case "warning": return <AlertTriangle className="text-yellow-400" size={18} />;
      case "error": return <XCircle className="text-red-400" size={18} />;
      case "critical": return <AlertOctagon className="text-red-600" size={18} />;
      default: return <Info className="text-gray-400" size={18} />;
    }
  };

  const handleClearClick = () => {
    setClearConfirm(true);
  };

  const confirmClear = async () => {
    setClearConfirm(false);
    const { error } = await supabase.from("system_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
    if (error) alert("Failed to clear logs: " + error.message);
    else fetchLogs();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-white">System Logs</h1>
           <p className="text-[var(--color-text-secondary)]">Monitor application errors and events</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchLogs} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white" title="Refresh">
                <RefreshCw size={20} />
            </button>
            <button onClick={handleClearClick} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg" title="Clear Logs">
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "info", "warning", "error", "critical"].map(f => (
            <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-full text-sm capitalize ${filter === f ? 'bg-[var(--color-primary)] text-white' : 'bg-white/5 text-[var(--color-text-muted)] hover:text-white'}`}
            >
                {f}
            </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-text-muted)] bg-white/5 rounded-xl border border-white/10">
          No logs found.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-black/20 border border-white/5 rounded-lg p-4 hover:bg-black/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getIcon(log.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <p className="font-medium text-white truncate">{log.message}</p>
                    <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <pre className="text-xs text-[var(--color-text-muted)] bg-black/30 p-2 rounded mt-2 overflow-x-auto custom-scrollbar">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                  {log.path && <p className="text-xs text-[var(--color-text-muted)] mt-2">Path: {log.path}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Clear Confirmation Modal */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setClearConfirm(false)}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Clear All Logs?</h3>
                <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to clear all system logs? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setClearConfirm(false)}
                        className="px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmClear}
                        className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Clear Everything
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
