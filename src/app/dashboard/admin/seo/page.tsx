"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, CheckCircle, AlertCircle, Search, Globe } from "lucide-react";

interface PageSeo {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string;
  updated_at: string;
}

export default function SeoManagerPage() {
  const [pages, setPages] = useState<PageSeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PageSeo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    path: "",
    title: "",
    description: "",
    keywords: "",
    og_image: "",
  });

  const fetchPages = useCallback(async () => {
    const { data } = await supabase
      .from("page_seo")
      .select("*")
      .order("path", { ascending: true });
    
    if (data) setPages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
        fetchPages();
    }, 0);
  }, [fetchPages]);

  const openModal = (item?: PageSeo) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        path: item.path,
        title: item.title || "",
        description: item.description || "",
        keywords: item.keywords || "",
        og_image: item.og_image || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        path: "/",
        title: "",
        description: "",
        keywords: "",
        og_image: "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!formData.path) {
      setNotification({ type: 'error', message: "Path is required." });
      return;
    }

    const payload = {
      path: formData.path,
      title: formData.title,
      description: formData.description,
      keywords: formData.keywords,
      og_image: formData.og_image,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingItem) {
      const { error: updateError } = await supabase
        .from("page_seo")
        .update(payload)
        .eq("id", editingItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("page_seo")
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      setNotification({ type: 'error', message: error.message });
    } else {
      setNotification({ type: 'success', message: "SEO Metadata saved successfully!" });
      closeModal();
      fetchPages();
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm;
    setDeleteConfirm(null);

    const { error } = await supabase.from("page_seo").delete().eq("id", id);
    if (error) {
        setNotification({ type: 'error', message: error.message });
    } else {
        setNotification({ type: 'success', message: "Entry deleted." });
        fetchPages();
    }
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white mb-2 transition-colors">
               <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">SEO Manager</h1>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Plus size={20} /> Add Page
          </button>
        </div>

        {/* Notification */}
        {notification && (
            <div className={`fixed bottom-8 right-8 flex items-center gap-2 px-6 py-4 rounded-xl shadow-2xl z-50 text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {notification.message}
            </div>
        )}

        {/* List */}
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
            {loading ? (
                <div className="p-12 text-center text-[var(--color-text-muted)]">Loading metadata...</div>
            ) : pages.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-text-muted)]">
                        <Search size={32} />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">No SEO configurations found</p>
                    <p className="text-[var(--color-text-muted)]">Add metadata for your pages to improve search ranking.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[var(--color-text-muted)] uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Path</th>
                                <th className="px-6 py-5">Title</th>
                                <th className="px-6 py-5">Description</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pages.map((page) => (
                                <tr key={page.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-[var(--color-text-muted)]" />
                                            <span className="text-[var(--color-primary)] font-mono text-sm px-2 py-1 bg-[var(--color-primary)]/10 rounded-lg">{page.path}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 max-w-[200px] truncate">
                                        <span className="text-white font-medium">{page.title || "-"}</span>
                                    </td>
                                    <td className="px-6 py-5 text-[var(--color-text-muted)] max-w-sm truncate">
                                        {page.description || "-"}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openModal(page)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit Metadata"
                                                aria-label="Edit Metadata"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(page.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete Entry"
                                                aria-label="Delete Entry"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {editingItem ? 'Edit SEO Metadata' : 'Add New Page'}
                    </h2>
                    <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Close SEO Modal">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Path */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Page Path</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none font-mono"
                            placeholder="e.g. /about or /services/web-dev"
                            value={formData.path}
                            onChange={e => setFormData({...formData, path: e.target.value})}
                        />
                         <p className="text-xs text-[var(--color-text-muted)] ml-1">
                            Start with forwarding slash /. Use / for homepage.
                        </p>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Meta Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="Page Title | Brand Name"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                         <p className="text-xs text-[var(--color-text-muted)] ml-1 flex justify-between">
                            <span>Recommended: 50-60 characters</span>
                            <span className={formData.title.length > 60 ? "text-red-400" : "text-green-400"}>{formData.title.length} chars</span>
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Meta Description</label>
                        <textarea 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none min-h-[100px]"
                            placeholder="Brief summary of the page content..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                        <p className="text-xs text-[var(--color-text-muted)] ml-1 flex justify-between">
                            <span>Recommended: 150-160 characters</span>
                            <span className={formData.description.length > 160 ? "text-red-400" : "text-green-400"}>{formData.description.length} chars</span>
                        </p>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Keywords (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="comma, separated, keywords"
                            value={formData.keywords}
                            onChange={e => setFormData({...formData, keywords: e.target.value})}
                        />
                    </div>

                     {/* OG Image */}
                     <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">OG Image URL (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="https://example.com/image.jpg"
                            value={formData.og_image}
                            onChange={e => setFormData({...formData, og_image: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                    <button 
                        onClick={closeModal}
                        className="px-6 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Save size={18} /> Save SEO
                    </button>
                </div>
            </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
                <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to delete this SEO entry? This action cannot be undone.</p>
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
