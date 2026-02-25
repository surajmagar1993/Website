"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, AlertCircle } from "lucide-react";

export default function TicketForm({ onSuccess }: { onSuccess: () => void }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    // Get current profile ID for client_id reference
    const { error: insertError } = await supabase
      .from("tickets")
      .insert({
        client_id: user.id,
        subject,
        description,
        status: "open",
        priority: "medium"
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSubject("");
      setDescription("");
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="glass p-6 rounded-2xl border border-[var(--color-primary)]/20">
      <h3 className="text-lg font-bold text-white mb-4">Open New Ticket</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            placeholder="Brief subject of your issue"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
            placeholder="Describe the issue in detail..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <Send size={16} /> Submit Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
}
