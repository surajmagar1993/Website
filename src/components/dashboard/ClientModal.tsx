"use client";

import { useState } from "react";
import { X, Save, Shield, User, Mail, Building, Edit2, UserPlus, Globe } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  logo_url?: string;
  website_url?: string;
  role: string;
  created_at: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Record<string, string>) => Promise<void>;
  editingProfile: Profile | null;
  submitting: boolean;
}

export default function ClientModal({ isOpen, onClose, onSave, editingProfile, submitting }: ClientModalProps) {
  const [formData, setFormData] = useState({
    email: editingProfile?.email || "",
    password: "",
    fullName: editingProfile?.full_name || "",
    companyName: editingProfile?.company_name || "",
    logoUrl: editingProfile?.logo_url || "",
    websiteUrl: editingProfile?.website_url || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {editingProfile ? <Edit2 size={20} className="text-[var(--color-primary)]" /> : <UserPlus size={20} className="text-[var(--color-primary)]" />}
                    {editingProfile ? 'Edit Client Information' : 'Add New Client'}
                </h2>
                <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white transition-colors" title="Close Modal">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 rounded-xl p-4 flex items-start gap-3 mb-2">
                        <Shield className="text-[var(--color-primary)] mt-1" size={18} />
                        <div>
                            <p className="text-xs text-[var(--color-primary)] font-bold uppercase tracking-wider mb-1">Setup Portal Access</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">Enter a User ID and Password for the client. They will use these credentials to access the Client Portal immediately.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={16} className="text-[var(--color-primary)]" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Portal Credentials</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-3.5 text-[var(--color-text-muted)]" />
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">User ID (Email)</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-3.5 text-[var(--color-text-muted)]" />
                            <input 
                                type="email" 
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                placeholder="client@company.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl shadow-inner animate-in fade-in slide-in-from-top-4">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-primary)] font-bold ml-1">
                            {editingProfile ? "Change Portal Password" : "Set Portal Password"}
                        </label>
                        <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-mono focus:ring-1 focus:ring-[var(--color-primary)] outline-none mt-2"
                            placeholder={editingProfile ? "Leave blank to keep current" : "Enter initial password"}
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required={!editingProfile}
                        />
                        <p className="text-[10px] text-[var(--color-text-muted)] italic mt-2">
                            {editingProfile 
                                ? "Only enter a value if you want to reset the client's current password." 
                                : "Required for the client's first-time login."}
                        </p>
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Building size={16} className="text-[var(--color-primary)]" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Business Details</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Company Name</label>
                            <div className="relative">
                                <Building size={16} className="absolute left-4 top-3.5 text-[var(--color-text-muted)]" />
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    placeholder="Acme Inc"
                                    value={formData.companyName}
                                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-2" />

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Brand Logo</label>
                        <ImageUpload 
                            label="Upload Logo" 
                            value={formData.logoUrl} 
                            onChange={(url) => setFormData({...formData, logoUrl: url})}
                            folder="clients"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Website</label>
                        <div className="relative">
                            <Globe size={16} className="absolute left-4 top-3.5 text-[var(--color-text-muted)]" />
                            <input 
                                type="text" 
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                placeholder="https://company.com"
                                value={formData.websiteUrl}
                                onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/10">
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-2 text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/10 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : (
                            <>
                                <Save size={18} /> {editingProfile ? 'Save Changes' : 'Create Client'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
