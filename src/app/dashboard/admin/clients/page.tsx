"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Globe, Link as LinkIcon, Image as ImageIcon, X, Save, CheckCircle, AlertCircle } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Client {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  display_order?: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    logoType: "upload" as "upload" | "url",
    logoUrl: "",
    websiteUrl: "",
  });

  const fetchClients = useCallback(async () => {
    // setLoading(true); 
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
        fetchClients();
    }, 0);
  }, [fetchClients]);

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        logoType: "url", // Default to URL for editing to show current value, or detect if it's a supabase URL?
        // Actually, let's just use "url" mode but populate the value.
        // If the user wants to upload a new one, they switch to upload.
        logoUrl: client.logo_url,
        websiteUrl: client.website_url || "",
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: "",
        logoType: "upload",
        logoUrl: "",
        websiteUrl: "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.logoUrl) {
      setNotification({ type: 'error', message: "Name and Logo are required." });
      return;
    }

    const payload = {
      name: formData.name,
      logo_url: formData.logoUrl,
      website_url: formData.websiteUrl,
    };

    let error;
    if (editingClient) {
      const { error: updateError } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", editingClient.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("clients")
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      setNotification({ type: 'error', message: error.message });
    } else {
      setNotification({ type: 'success', message: "Client saved successfully!" });
      closeModal();
      fetchClients();
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

    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
        setNotification({ type: 'error', message: error.message });
    } else {
        setNotification({ type: 'success', message: "Client deleted." });
        fetchClients();
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
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Manage Clients</h1>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Plus size={20} /> Add Client
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
                <div className="p-12 text-center text-[var(--color-text-muted)]">Loading clients...</div>
            ) : clients.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-text-muted)]">
                        <ImageIcon size={32} />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">No clients found</p>
                    <p className="text-[var(--color-text-muted)]">Add your first client to display them on the homepage.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[var(--color-text-muted)] uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Logo</th>
                                <th className="px-6 py-5">Name</th>
                                <th className="px-6 py-5">Website</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={client.logo_url} alt={client.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-white font-medium text-lg">{client.name}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {client.website_url ? (
                                            <a href={client.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--color-primary)] hover:underline font-mono text-sm">
                                                <Globe size={14} /> {client.website_url.replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : (
                                            <span className="text-[var(--color-text-muted)]">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openModal(client)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit Client"
                                                aria-label="Edit Client"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(client.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete Client"
                                                aria-label="Delete Client"
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
                        {editingClient ? 'Edit Client' : 'Add New Client'}
                    </h2>
                    <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Close Modal">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Client Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="e.g. Acme Corp"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* Logo Source */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Logo Source</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="logoType" 
                                    className="text-[var(--color-primary)]"
                                    checked={formData.logoType === 'upload'}
                                    onChange={() => setFormData({...formData, logoType: 'upload'})}
                                />
                                <span className="text-white">Upload Image</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="logoType" 
                                    className="text-[var(--color-primary)]"
                                    checked={formData.logoType === 'url'}
                                    onChange={() => setFormData({...formData, logoType: 'url'})}
                                />
                                <span className="text-white">Image URL</span>
                            </label>
                        </div>
                    </div>

                    {/* Logo Input */}
                    {formData.logoType === 'upload' ? (
                        <ImageUpload 
                            label="Upload Logo" 
                            value={formData.logoUrl} 
                            onChange={(url) => setFormData({...formData, logoUrl: url})}
                            folder="clients"
                        />
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Logo URL</label>
                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-4 top-3.5 text-[var(--color-text-muted)]" />
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    placeholder="https://example.com/logo.png"
                                    value={formData.logoUrl}
                                    onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                                />
                            </div>
                            {formData.logoUrl && (
                                <div className="mt-2 p-2 bg-white rounded-lg w-fit">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formData.logoUrl} alt="Preview" className="h-10 object-contain" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Website */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Website (Optional)</label>
                        <div className="relative">
                            <Globe size={16} className="absolute left-4 top-3.5 text-[var(--color-text-muted)]" />
                            <input 
                                type="text" 
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                placeholder="https://example.com"
                                value={formData.websiteUrl}
                                onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                            />
                        </div>
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
                        <Save size={18} /> Save Client
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
                <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to delete this client? This action cannot be undone.</p>
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
