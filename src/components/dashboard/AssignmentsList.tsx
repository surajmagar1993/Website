"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Laptop, Monitor, AlertCircle, Package, X, RefreshCw, Paperclip, Loader2 } from "lucide-react";
import Link from "next/link";
import ModalPortal from "@/components/ui/ModalPortal";
import { sendTicketReceiptEmail } from "@/actions/tickets";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AssignmentsList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Action State
  const [activeAction, setActiveAction] = useState<{ type: 'issue' | 'return', product: any } | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [replacementRequested, setReplacementRequested] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('current_client_id', profile.id)
        .eq('status', 'rented'); // Only show currently rented items

      if (data) {
        setAssignments(data);
      }
      setLoading(false);
    };

    fetchAssignments();
  }, []);



  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
      if (e) {
          e.preventDefault();
          e.stopPropagation();
      }
      if (!activeAction || !description || submitting) return;
      try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
              const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
              
              if (profile) {
                  let attachmentUrl = null;

                  if (attachment) {
                      setUploading(true);
                      const fileExt = attachment.name.split('.').pop();
                      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
                      
                      const { error: uploadError } = await supabase.storage
                          .from('tickets')
                          .upload(fileName, attachment);

                      if (uploadError) {
                          console.error("Upload error:", uploadError);
                          alert("Failed to upload attachment. Proceeding without it.");
                      } else {
                          const { data: { publicUrl } } = supabase.storage
                              .from('tickets')
                              .getPublicUrl(fileName);
                          attachmentUrl = publicUrl;
                      }
                      setUploading(false);
                  }

                  const defaultSubject = activeAction.type === 'issue' 
                      ? `Issue Report: ${activeAction.product.name} (${activeAction.product.serial_number})`
                      : `${replacementRequested ? 'Replacement Request' : 'Return Request'}: ${activeAction.product.name} (${activeAction.product.serial_number})`;
                  
                  const finalSubject = subject.trim() || defaultSubject;

                   const { error } = await supabase.from('tickets').insert({
                       client_id: profile.id,
                       product_id: activeAction.product.id,
                       subject: finalSubject,
                       description: description,
                       priority: priority,
                       replacement_requested: activeAction.type === 'return' ? replacementRequested : false,
                       status: 'open',
                       attachments: attachmentUrl ? [attachmentUrl] : []
                   });
 
                   if (!error) {
                       // Send automated receipt email
                       sendTicketReceiptEmail(user.email!, subject, description).catch(console.error);

                       setSuccess(true);
                       setTimeout(() => {
                           setActiveAction(null);
                           setDescription("");
                           setSubject("");
                           setPriority('medium');
                           setReplacementRequested(false);
                           setAttachment(null);
                           setSuccess(false);
                       }, 2000);
                   } else {
                       console.error("Supabase Error Full:", error);
                       alert(`Failed to submit ticket: ${error.message}${error.details ? ' - ' + error.details : ''}`);
                   }
              }
          }
      } catch (err) {
          console.error("Submission error:", err);
      } finally {
          setSubmitting(false);
      }
  };

    // Widget Mode Logic: No local search/filter, just show top 5
    const displayedItems = assignments.slice(0, 5);

    if (loading) {
        return <div className="text-[var(--color-text-muted)] text-center py-8">Loading your products...</div>;
    }

  return (
    <div className="space-y-4">
        {/* Header Removed - Managed by Parent or simplified */}
        
        {/* Product List - Minimal Widget View */}
        <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                            <th className="p-3 pl-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Product</th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Serial</th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Assigned</th>
                            <th className="p-3 pr-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {displayedItems.length === 0 ? (
                             <tr>
                                <td colSpan={3} className="p-8 text-center text-[var(--color-text-muted)]">No active product assignments found.</td>
                            </tr>
                        ) : (
                            displayedItems.map((product) => (
                                <tr key={product.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="p-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${product.name.toLowerCase().includes('desktop') ? 'bg-blue-500/10 text-blue-400' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                                                {product.name.toLowerCase().includes('desktop') ? <Monitor size={16} /> : <Laptop size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white leading-tight">{product.name}</div>
                                                <div className="text-[10px] text-[var(--color-text-muted)]">{product.model}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm font-mono text-[var(--color-text-muted)]">
                                        {product.serial_number}
                                    </td>
                                    <td className="p-3 text-sm text-[var(--color-text-muted)]">
                                        {product.assigned_date ? new Date(product.assigned_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-3 pr-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveAction({ type: 'issue', product }); }}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Report Issue"
                                            >
                                                <AlertCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveAction({ type: 'return', product }); }}
                                                className="p-1.5 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                                title="Request Return"
                                            >
                                                <Package size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {assignments.length > 5 && (
                <div className="bg-white/5 p-2 text-center border-t border-white/5">
                    <Link href="/dashboard/catalog" className="text-xs text-[var(--color-primary)] hover:text-white font-medium transition-colors">
                        View All {assignments.length} Items &rarr;
                    </Link>
                </div>
            )}
        </div>

        {/* Removed: Pagination Controls */}

        <ModalPortal 
            isOpen={activeAction !== null} 
            onClose={() => {
                if (!submitting) {
                    setActiveAction(null);
                    setDescription("");
                    setPriority('medium');
                    setReplacementRequested(false);
                }
            }}
        >
            <div className="glass p-6 rounded-2xl border border-[var(--color-primary)]/20 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">
                        {activeAction?.type === 'issue' ? 'Report an Issue' : 'Request Return'}
                    </h3>
                    <button 
                        onClick={() => { setActiveAction(null); setDescription(""); setPriority('medium'); setReplacementRequested(false); }}
                        className="text-[var(--color-text-muted)] hover:text-white transition-colors p-1"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-[var(--color-text-muted)] text-sm mb-4">
                    {activeAction?.product.name} ({activeAction?.product.serial_number})
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {success ? (
                        <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in duration-300">
                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                                <Package size={24} />
                            </div>
                            <p className="text-white font-medium">Ticket submitted successfully!</p>
                            <p className="text-sm text-[var(--color-text-muted)]">Closing modal...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[var(--color-text-muted)] mb-2">Priority</label>
                                    <select 
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as any)}
                                        title="Select Ticket Priority"
                                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                {activeAction?.type === 'return' && (
                                    <div>
                                        <label className="block text-sm text-[var(--color-text-muted)] mb-2">Action Type</label>
                                        <button
                                            type="button"
                                            onClick={() => setReplacementRequested(!replacementRequested)}
                                            className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-lg border transition-all ${
                                                replacementRequested 
                                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                                : 'bg-white/5 border-white/10 text-[var(--color-text-muted)] h-11'
                                            }`}
                                        >
                                            {replacementRequested ? <RefreshCw size={14} className="animate-spin-slow" /> : <X size={14} />}
                                            <span className="text-xs font-medium">
                                                {replacementRequested ? 'Replacement' : 'Standard Return'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                             <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Subject</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(activeAction?.type === 'issue' ? ['Hardware Issue', 'Software Error', 'Connection Problem', 'Screen Damage'] : ['Contract End', 'Upgrade Required', 'Moving Office', 'Project Finished']).map(topic => (
                                        <button 
                                            key={topic}
                                            type="button"
                                            onClick={() => setSubject(`${topic}: ${activeAction?.product.name}`)}
                                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-all"
                                            title={`Select topic: ${topic}`}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    placeholder="Brief summary..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                                    Description {activeAction?.type === 'issue' ? '(What went wrong?)' : '(Reason for return)'}
                                </label>
                                <textarea 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none min-h-[120px] resize-none"
                                    placeholder={activeAction?.type === 'issue' ? "Please describe the problem in detail..." : "Please state the reason for returning this product..."}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                                                       <div className="space-y-2">
                                <label className="block text-sm text-[var(--color-text-muted)]">Attachment (Optional)</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 cursor-pointer transition-colors">
                                        <Paperclip size={14} />
                                        <span>Choose File</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                                            accept="image/*,.pdf"
                                        />
                                    </label>
                                    {attachment && (
                                        <div className="flex items-center gap-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-2 py-1 rounded text-[10px] text-[var(--color-primary)]">
                                            <span className="truncate max-w-[150px]">{attachment.name}</span>
                                            <button 
                                                type="button"
                                                onClick={() => setAttachment(null)}
                                                className="hover:text-white"
                                                title="Remove attachment"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-[var(--color-text-muted)] italic">Max 5MB. Images or PDF only.</p>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setActiveAction(null); setDescription(""); setSubject(""); setPriority('medium'); setReplacementRequested(false); setAttachment(null); }} 
                                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting || !description.trim() || uploading}
                                    className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                                >
                                    {(submitting || uploading) && <Loader2 size={16} className="animate-spin" />}
                                    {submitting ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </ModalPortal>
    </div>
  );
}
