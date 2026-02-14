"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Laptop, AlertCircle, Package } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AssignmentsList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<{ type: 'issue' | 'return', product: any } | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('current_client_id', profile.id)
        .eq('status', 'rented'); // Only show currently rented items

      if (data) setAssignments(data);
      setLoading(false);
    };

    fetchAssignments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeAction || !description) return;
      
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
          const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
          
          if (profile) {
              const subject = activeAction.type === 'issue' 
                  ? `Issue Report: ${activeAction.product.name} (${activeAction.product.serial_number})`
                  : `Return Request: ${activeAction.product.name} (${activeAction.product.serial_number})`;
              
              const category = activeAction.type === 'issue' ? 'Hardware' : 'Other';

              const { error } = await supabase.from('tickets').insert({
                  client_id: profile.id,
                  subject: subject,
                  description: description,
                  category: category,
                  priority: 'medium',
                  status: 'open'
              });

              if (!error) {
                  alert("Ticket submitted successfully!");
                  setActiveAction(null);
                  setDescription("");
              } else {
                  alert("Failed to submit ticket.");
              }
          }
      }
      setSubmitting(false);
  };

  if (loading) return <div className="text-white">Loading assignments...</div>;

  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.length === 0 ? (
            <div className="col-span-2 text-center py-8 glass rounded-xl border border-white/5">
            <p className="text-[var(--color-text-muted)]">No active product assignments.</p>
            </div>
        ) : (
            assignments.map((product) => (
            <div key={product.id} className="glass p-6 rounded-xl border border-white/5 hover:border-[var(--color-primary)]/30 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                    <Laptop size={24} />
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                    Active
                </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                <p className="text-[var(--color-text-muted)] text-sm mb-4">{product.model}</p>
                
                <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Serial Number</span>
                    <span className="text-white font-mono">{product.serial_number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Assigned Date</span>
                    <span className="text-white">{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => setActiveAction({ type: 'issue', product })}
                        className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <AlertCircle size={14} /> Report Issue
                    </button>
                    <button 
                         onClick={() => setActiveAction({ type: 'return', product })}
                         className="flex-1 px-3 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Package size={14} /> Request Return
                    </button>
                </div>
            </div>
            ))
        )}
        </div>

        {/* Action Modal */}
        {activeAction && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="glass p-6 rounded-2xl w-full max-w-md border border-[var(--color-primary)]/20">
                    <h3 className="text-xl font-bold text-white mb-2">
                        {activeAction.type === 'issue' ? 'Report an Issue' : 'Request Return'}
                    </h3>
                    <p className="text-[var(--color-text-muted)] text-sm mb-4">
                        {activeAction.product.name} ({activeAction.product.serial_number})
                    </p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                                Description {activeAction.type === 'issue' ? '(What went wrong?)' : '(Reason for return)'}
                            </label>
                            <textarea 
                                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                placeholder="Please provide details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => { setActiveAction(null); setDescription(""); }} 
                                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="btn-primary"
                            >
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </>
  );
}
