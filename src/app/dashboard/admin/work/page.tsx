"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, CheckCircle, AlertCircle, Briefcase } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  result: string;
  slug?: string;
  case_study_image?: string;
  display_order: number;
}

export default function WorkPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CaseStudy | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    result: "",
    slug: "",
    case_study_image: "",
    display_order: 0,
  });

  const fetchCaseStudies = useCallback(async () => {
    const { data } = await supabase
      .from("case_studies")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (data) setCaseStudies(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
        fetchCaseStudies();
    }, 0);
  }, [fetchCaseStudies]);

  const openModal = (item?: CaseStudy) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        category: item.category,
        result: item.result,
        slug: item.slug || "",
        case_study_image: item.case_study_image || "",
        display_order: item.display_order,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        category: "",
        result: "",
        slug: "",
        case_study_image: "",
        display_order: caseStudies.length + 1,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      setNotification({ type: 'error', message: "Title and Category are required." });
      return;
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      result: formData.result,
      slug: formData.slug,
      case_study_image: formData.case_study_image,
      display_order: formData.display_order,
    };

    let error;
    if (editingItem) {
      const { error: updateError } = await supabase
        .from("case_studies")
        .update(payload)
        .eq("id", editingItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("case_studies")
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      setNotification({ type: 'error', message: error.message });
    } else {
      setNotification({ type: 'success', message: "Work item saved successfully!" });
      closeModal();
      fetchCaseStudies();
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

    const { error } = await supabase.from("case_studies").delete().eq("id", id);
    if (error) {
        setNotification({ type: 'error', message: error.message });
        setTimeout(() => setNotification(null), 3000);
    } else {
        setNotification({ type: 'success', message: "Item deleted." });
        fetchCaseStudies();
        setTimeout(() => setNotification(null), 3000);
    }
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
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Manage Case Studies</h1>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Plus size={20} /> Add Work Item
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
                <div className="p-12 text-center text-[var(--color-text-muted)]">Loading case studies...</div>
            ) : caseStudies.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-text-muted)]">
                        <Briefcase size={32} />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">No work items found</p>
                    <p className="text-[var(--color-text-muted)]">Add case studies to display on the homepage.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[var(--color-text-muted)] uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Title</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Result</th>
                                <th className="px-6 py-5">Order</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {caseStudies.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium text-lg">{item.title}</span>
                                            {item.slug && <span className="text-xs text-[var(--color-text-muted)] font-mono">/{item.slug}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[var(--color-text-muted)]">
                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-[var(--color-primary)] font-medium">
                                        {item.result}
                                    </td>
                                    <td className="px-6 py-5 text-[var(--color-text-muted)] font-mono">
                                        #{item.display_order}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openModal(item)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit Item"
                                                aria-label="Edit Item"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(item.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete Item"
                                                aria-label="Delete Item"
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
                        {editingItem ? 'Edit Case Study' : 'Add New Case Study'}
                    </h2>
                    <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Close Case Study Modal">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Project Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="e.g. Fintech App Rewrite"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Slug (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="e.g. fintech-app"
                            value={formData.slug}
                            onChange={e => setFormData({...formData, slug: e.target.value})}
                        />
                    </div>

                    {/* Hero Image */}
                    <div className="space-y-2">
                         <ImageUpload
                            label="Case Study Image"
                            value={formData.case_study_image}
                            onChange={url => setFormData(p => ({ ...p, case_study_image: url }))}
                            folder="projects"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Category</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="e.g. Mobile Development"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        />
                    </div>

                    {/* Result */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Key Result/Metric</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="e.g. 50% faster load times"
                            value={formData.result}
                            onChange={e => setFormData({...formData, result: e.target.value})}
                        />
                    </div>

                    {/* Order */}
                    <div className="space-y-2">
                        <label htmlFor="ws_display_order" className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Display Order</label>
                        <input 
                            id="ws_display_order"
                            type="number" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            value={formData.display_order}
                            onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
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
                        <Save size={18} /> Save Work Item
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
                <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to delete this case study? This action cannot be undone.</p>
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
