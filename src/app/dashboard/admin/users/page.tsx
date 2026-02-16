"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, UserPlus, User, Building, CheckCircle, AlertCircle, Trash2, Edit2, Globe } from "lucide-react";
import Image from "next/image";
import ClientModal from "@/components/dashboard/ClientModal";
import { useProfile } from "@/hooks/useProfile";
import { fromShadowEmail } from "@/lib/constants";

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

export default function UsersManagementPage() {
  const { loading: profileLoading } = useProfile();
  console.log("Profile loading:", profileLoading); // Keep if needed or just remove
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form State


  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq('role', 'client')
      .order("created_at", { ascending: false });
    
    if (data) setProfiles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const openModal = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
    } else {
      setEditingProfile(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleSaveUser = async (submittedData: any) => {
    if (!submittedData.email || (!editingProfile && !submittedData.password) || !submittedData.fullName) {
      setNotification({ type: 'error', message: "Email, Full Name, and Password (for new users) are required." });
      return;
    }

    setSubmitting(true);
    try {
      // Get current session for API authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session. Please log in again.");
      }
      const token = session.access_token;

      if (editingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: submittedData.fullName,
            company_name: submittedData.companyName,
            logo_url: submittedData.logoUrl,
            website_url: submittedData.websiteUrl,
          })
          .eq("id", editingProfile.id);

        if (profileError) throw profileError;
        
        // Handle Username (Email) Update if changed
        if (submittedData.email !== editingProfile.email) {
          const emailResponse = await fetch('/api/admin/update-username', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: editingProfile.id, email: submittedData.email }),
          });

          const emailResult = await emailResponse.json();
          if (!emailResponse.ok) throw new Error(emailResult.error || "Failed to update username");
        }

        // NEW: Handle Password Update if provided
        if (submittedData.password) {
          const passResponse = await fetch('/api/admin/update-password', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: editingProfile.id, password: submittedData.password }),
          });

          const passResult = await passResponse.json();
          if (!passResponse.ok) throw new Error(passResult.error || "Failed to update password");
        }

        setNotification({ type: 'success', message: "Client profile updated successfully." });
      } else {
        // Create new user via API
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submittedData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to create user");
        setNotification({ type: 'success', message: "Client login created successfully!" });
      }

      closeModal();
      fetchProfiles();
    } catch (error: unknown) {
      console.error("Client management error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      // Get current session for API authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session. Please log in again.");
      }
      const token = session.access_token;

      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: deleteConfirm }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete user");

      setNotification({ type: 'success', message: "Client and all associated data permanently removed." });
      fetchProfiles();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setDeleteConfirm(null);
      setSubmitting(false);
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
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Manage Clients</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Create and manage client accounts with brand assets</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
          >
            <UserPlus size={20} /> Add New Client
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
                <div className="p-12 text-center text-[var(--color-text-muted)]">Loading profiles...</div>
            ) : profiles.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-text-muted)]">
                        <User size={32} />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">No client users found</p>
                    <p className="text-[var(--color-text-muted)]">Create your first client login to grant portal access.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[var(--color-text-muted)] uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Client / Brand</th>
                                <th className="px-6 py-5">Contact Details</th>
                                <th className="px-6 py-5">Website</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            {profile.logo_url ? (
                                                <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 flex-shrink-0 shadow-sm relative overflow-hidden">
                                                    <Image 
                                                        src={profile.logo_url} 
                                                        alt={profile.company_name || "Client Logo"} 
                                                        fill
                                                        className="object-contain p-1" 
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-10 bg-white/5 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] flex-shrink-0 border border-white/5">
                                                    <Building size={18} />
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-white font-medium block">{profile.full_name || 'No Name'}</span>
                                                <span className="text-[var(--color-text-muted)] text-xs">{profile.company_name || 'Individual'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm">{fromShadowEmail(profile.email)}</span>
                                            <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider mt-0.5">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {profile.website_url ? (
                                            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline flex items-center gap-1.5 text-sm">
                                                <Globe size={14} /> {profile.website_url.replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : (
                                            <span className="text-[var(--color-text-muted)] text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openModal(profile)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit Client"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirm(profile.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete Client"
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

      {/* Client Modal Component */}
      <ClientModal 
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSaveUser}
        editingProfile={editingProfile}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Confirm Permanent Removal</h3>
                <p className="text-[var(--color-text-muted)] mb-6 text-sm">Are you sure you want to remove this client? This will permanently delete their **Portal Login**, **Profile**, and all associated data. This action cannot be undone.</p>
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
