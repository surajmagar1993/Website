"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Mail, Trash2, CheckCircle, Clock } from "lucide-react";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setInquiries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
        fetchInquiries();
    }, 0);
  }, [fetchInquiries]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm;
    setDeleteConfirm(null);

    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (!error) {
        fetchInquiries();
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", id);
    if (!error) {
        fetchInquiries();
        if (selectedInquiry?.id === id) {
            setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
        }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white mb-2 transition-colors">
               <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Inquiries</h1>
             <p className="text-[var(--color-text-muted)] text-sm">Customer contact form submissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            {/* List */}
            <div className={`lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar ${selectedInquiry ? 'hidden lg:block' : 'block'}`}>
                {loading ? (
                    <div className="text-[var(--color-text-muted)] text-center py-8">Loading...</div>
                ) : inquiries.length === 0 ? (
                    <div className="glass p-8 rounded-2xl text-center border border-white/5">
                        <p className="text-[var(--color-text-muted)]">No inquiries found.</p>
                    </div>
                ) : (
                    inquiries.map(inquiry => (
                        <div 
                            key={inquiry.id}
                            onClick={() => setSelectedInquiry(inquiry)}
                            className={`glass p-5 rounded-xl cursor-pointer transition-all border group ${
                                selectedInquiry?.id === inquiry.id 
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-lg shadow-[var(--color-primary)]/5' 
                                : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                        inquiry.status === 'new' 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'bg-green-500/20 text-green-400'
                                    }`}>
                                        {inquiry.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[var(--color-text-muted)] group-hover:opacity-0 transition-opacity">
                                        {new Date(inquiry.created_at).toLocaleDateString()}
                                    </span>
                                    <button 
                                        onClick={(e) => handleDeleteClick(inquiry.id, e)}
                                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        title="Delete Inquiry"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-white font-bold truncate mb-1">{inquiry.name}</h3>
                            <p className="text-sm text-[var(--color-text-muted)] truncate flex items-center gap-2">
                                <span className="block w-2 h-2 rounded-full bg-white/20"></span>
                                {inquiry.service}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Detail View */}
            <div className={`lg:col-span-2 h-full ${selectedInquiry ? 'block' : 'hidden lg:block'}`}>
                {selectedInquiry ? (
                    <div className="glass p-5 md:p-8 rounded-2xl h-full flex flex-col border border-white/5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 md:mb-8 border-b border-white/10 pb-6 gap-4">
                            <div>
                                <button 
                                    onClick={() => setSelectedInquiry(null)}
                                    className="lg:hidden mb-4 flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white text-sm"
                                >
                                    <ArrowLeft size={16} /> Back to List
                                </button>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">{selectedInquiry.name}</h2>
                                <p className="text-[var(--color-primary)] text-base md:text-lg flex items-center gap-2">
                                    Inquiry for: <span className="font-bold">{selectedInquiry.service}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-auto">
                                {selectedInquiry.status === 'new' && (
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedInquiry.id, 'read')}
                                        className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-sm transition-colors flex items-center gap-2 font-bold"
                                    >
                                        <CheckCircle size={16} /> <span className="hidden md:inline">Mark Read</span>
                                    </button>
                                )}
                                    <button 
                                        onClick={(e) => handleDeleteClick(selectedInquiry.id, e)}
                                        className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors border border-red-500/20 flex items-center gap-2 font-bold text-sm"
                                        title="Delete Inquiry"
                                    >
                                        <Trash2 size={18} /> Delete Inquiry
                                    </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8 bg-white/5 p-4 md:p-6 rounded-xl border border-white/5">
                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold mb-1 block">Email Address</label>
                                <p className="text-white text-base md:text-lg"><a href={`mailto:${selectedInquiry.email}`} className="hover:text-[var(--color-primary)] transition-colors break-all">{selectedInquiry.email}</a></p>
                            </div>
                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold mb-1 block">Phone Number</label>
                                <p className="text-white text-base md:text-lg">{selectedInquiry.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold mb-3 block">Message Content</label>
                            <div className="bg-black/20 p-5 md:p-8 rounded-xl text-white/90 whitespace-pre-wrap leading-relaxed shadow-inner border border-black/20 text-base md:text-lg">
                                {selectedInquiry.message}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                            <Clock size={14} /> Received on {new Date(selectedInquiry.created_at).toLocaleString()}
                        </div>
                    </div>
                ) : (
                    <div className="glass p-12 rounded-2xl flex flex-col items-center justify-center text-center h-full border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6 text-[var(--color-primary)]">
                            <Mail size={40} />
                        </div>
                        <h3 className="text-2xl text-white font-bold mb-2">Select an Inquiry</h3>
                        <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">Click on any inquiry from the list on the left to view full details and manage its status.</p>
                    </div>
                )}
            </div>
        </div>
        </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Delete Inquiry?</h3>
                <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to delete this message?</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
