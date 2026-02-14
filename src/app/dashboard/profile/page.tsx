"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Lock, Save, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data) setProfile(data);
      setLoading(false);
    };

    getProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: "Profile updated successfully." });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match." });
      return;
    }
    
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setMessage({ type: 'success', text: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors mb-4">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border mb-6 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Details Form */}
          <div className="glass p-8 rounded-2xl border border-white/5">
            <h2 className="text-xl text-white font-[family-name:var(--font-heading)] mb-6 flex items-center gap-2">
              <User size={20} className="text-[var(--color-primary)]" /> Personal Details
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  aria-label="Email address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--color-text-muted)] cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    aria-label="Full name"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Company</label>
                  <input
                    type="text"
                    value={profile.company_name || ""}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                    aria-label="Company name"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="glass p-8 rounded-2xl border border-white/5">
            <h2 className="text-xl text-white font-[family-name:var(--font-heading)] mb-6 flex items-center gap-2">
              <Lock size={20} className="text-[var(--color-primary)]" /> Security
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="Re-enter password"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !newPassword}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={18} /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
