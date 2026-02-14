"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, CheckCircle, AlertCircle, LayoutGrid, ChevronDown, ChevronUp, Eye } from "lucide-react";
import * as Icons from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface PainPoint { title: string; description: string }
interface Solution { title: string; description: string; features: string[] }
interface Benefit { title: string; description: string }
interface FAQ { question: string; answer: string }
interface CaseStudyResult { title: string; industry: string; metrics: { label: string; value: string }[] }

interface Service {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  icon: string;
  display_order: number;
  features: string[];
  technologies: string[];
  process: { title: string; description: string }[];
  pain_points: PainPoint[];
  solutions: Solution[];
  benefits: Benefit[];
  faqs: FAQ[];
  case_study_results: CaseStudyResult[];
}

const emptyService = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  icon: "Globe",
  display_order: 0,
  features: [] as string[],
  technologies: [] as string[],
  process: [] as { title: string; description: string }[],
  pain_points: [] as PainPoint[],
  solutions: [] as Solution[],
  benefits: [] as Benefit[],
  faqs: [] as FAQ[],
  case_study_results: [] as CaseStudyResult[],
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({ ...emptyService });
  const [activeFormTab, setActiveFormTab] = useState("basic");

  const fetchServices = useCallback(async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (data) setServices(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => { fetchServices(); }, 0);
  }, [fetchServices]);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title || "",
        slug: service.slug || "",
        subtitle: service.subtitle || "",
        description: service.description || "",
        icon: service.icon || "Globe",
        display_order: service.display_order || 0,
        features: service.features || [],
        technologies: service.technologies || [],
        process: service.process || [],
        pain_points: service.pain_points || [],
        solutions: service.solutions || [],
        benefits: service.benefits || [],
        faqs: service.faqs || [],
        case_study_results: service.case_study_results || [],
      });
    } else {
      setEditingService(null);
      setFormData({ ...emptyService, display_order: services.length + 1 });
    }
    setActiveFormTab("basic");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingService(null); };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      setNotification({ type: 'error', message: "Title and Description are required." });
      return;
    }

    const payload = {
      ...formData,
      slug: formData.slug || slugify(formData.title),
    };

    let error;
    if (editingService) {
      const { error: e } = await supabase.from("services").update(payload).eq("id", editingService.id);
      error = e;
    } else {
      const { error: e } = await supabase.from("services").insert([payload]);
      error = e;
    }

    if (error) {
      setNotification({ type: 'error', message: error.message });
    } else {
      setNotification({ type: 'success', message: "Service saved successfully!" });
      closeModal();
      fetchServices();
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

    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      setNotification({ type: 'error', message: error.message });
    } else {
      setNotification({ type: 'success', message: "Service deleted." });
      fetchServices();
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const renderIcon = (iconName: string, size = 20) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (Icons as any)[iconName] || Icons.HelpCircle;
    return <Icon size={size} />;
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
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Manage Services</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Add, edit, or remove services. These appear on the homepage and individual service pages.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Plus size={20} /> Add Service
          </button>
        </div>

        {/* Notification */}
        {notification && (
            <div className={`fixed bottom-8 right-8 flex items-center gap-2 px-6 py-4 rounded-xl shadow-2xl z-50 text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {notification.message}
            </div>
        )}

        {/* Service Cards Grid */}
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
            {loading ? (
                <div className="p-12 text-center text-[var(--color-text-muted)]">Loading services...</div>
            ) : services.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-text-muted)]">
                        <LayoutGrid size={32} />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">No services found</p>
                    <p className="text-[var(--color-text-muted)]">Add services to display them on the homepage and service pages.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                    {services.map((service) => (
                        <div key={service.id} className="glass rounded-xl p-5 border border-white/5 hover:border-[var(--color-primary)]/30 transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                    {renderIcon(service.icon)}
                                </div>
                                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <Link 
                                      href={`/services/${service.slug || slugify(service.title)}`}
                                      target="_blank"
                                      className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                      title="Preview"
                                    >
                                        <Eye size={16} />
                                    </Link>
                                    <button 
                                        onClick={() => openModal(service)}
                                        className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Edit Service" aria-label="Edit Service"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(service.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Delete Service" aria-label="Delete Service"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">{service.title}</h3>
                            <p className="text-[var(--color-text-muted)] text-sm line-clamp-2 mb-3">{service.description}</p>
                            <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                <span className="bg-white/5 px-2 py-1 rounded">#{service.display_order}</span>
                                {service.slug && <span className="bg-white/5 px-2 py-1 rounded truncate max-w-[150px]">/{service.slug}</span>}
                                {service.features?.length > 0 && <span className="bg-white/5 px-2 py-1 rounded">{service.features.length} features</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* ═══ EDIT MODAL ═══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        {editingService ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Close Service Modal">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Tabs */}
                <div className="flex gap-1 px-5 pt-4 border-b border-white/10 flex-shrink-0 overflow-x-auto">
                    {[
                      { id: "basic", label: "Basic Info" },
                      { id: "content", label: "Features & Tech" },
                      { id: "process", label: "Process" },
                      { id: "challenges", label: "Pain Points" },
                      { id: "solutions", label: "Solutions" },
                      { id: "benefits", label: "Benefits" },
                      { id: "faq", label: "FAQ" },
                      { id: "casestudies", label: "Case Studies" },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveFormTab(tab.id)}
                            className={`px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg whitespace-nowrap ${activeFormTab === tab.id ? 'bg-white/10 text-white border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Modal Content (Scrollable) */}
                <div className="p-5 overflow-y-auto flex-1 space-y-5">
                    
                    {/* ─── BASIC INFO ─── */}
                    {activeFormTab === "basic" && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FieldInput label="Service Title" value={formData.title} onChange={v => {
                                    setFormData(p => ({ ...p, title: v, slug: p.slug || slugify(v) }));
                                }} placeholder="e.g. Web Development" />
                                <FieldInput label="URL Slug" value={formData.slug} onChange={v => setFormData(p => ({ ...p, slug: v }))} placeholder="e.g. web-development" />
                            </div>
                            <FieldInput label="Subtitle" value={formData.subtitle} onChange={v => setFormData(p => ({ ...p, subtitle: v }))} placeholder="Short compelling tagline" />
                            <FieldTextarea label="Description" value={formData.description} onChange={v => setFormData(p => ({ ...p, description: v }))} placeholder="Full description of the service..." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <ImageUpload 
                                            label="Service Icon/Logo" 
                                            value={formData.icon} 
                                            onChange={url => setFormData(p => ({ ...p, icon: url }))} 
                                            folder="services"
                                        />
                                    </div>
                                <FieldInput label="Display Order" value={String(formData.display_order)} onChange={v => setFormData(p => ({ ...p, display_order: parseInt(v) || 0 }))} placeholder="1" type="number" />
                            </div>
                        </div>
                    )}

                    {/* ─── FEATURES & TECHNOLOGIES ─── */}
                    {activeFormTab === "content" && (
                        <div className="space-y-6">
                            <TagListEditor 
                                label="Features" 
                                items={formData.features} 
                                onChange={items => setFormData(p => ({ ...p, features: items }))} 
                                placeholder="Add a feature and press Enter"
                            />
                            <div className="h-px bg-white/10" />
                            <TagListEditor 
                                label="Technologies" 
                                items={formData.technologies} 
                                onChange={items => setFormData(p => ({ ...p, technologies: items }))} 
                                placeholder="Add a technology and press Enter"
                            />
                        </div>
                    )}

                    {/* ─── PROCESS STEPS ─── */}
                    {activeFormTab === "process" && (
                        <DynamicList
                            label="Process Steps"
                            items={formData.process}
                            onChange={items => setFormData(p => ({ ...p, process: items }))}
                            renderItem={(item, i, update) => (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FieldInput label={`Step ${i+1} Title`} value={item.title} onChange={v => update({ ...item, title: v })} placeholder="e.g. Discovery" />
                                    <div className="md:col-span-2">
                                        <FieldInput label="Description" value={item.description} onChange={v => update({ ...item, description: v })} placeholder="What happens in this step" />
                                    </div>
                                </div>
                            )}
                            newItem={() => ({ title: "", description: "" })}
                        />
                    )}

                    {/* ─── PAIN POINTS ─── */}
                    {activeFormTab === "challenges" && (
                        <DynamicList
                            label="Pain Points / Challenges"
                            items={formData.pain_points}
                            onChange={items => setFormData(p => ({ ...p, pain_points: items }))}
                            renderItem={(item, i, update) => (
                                <div className="space-y-3">
                                    <FieldInput label={`Challenge ${i+1} Title`} value={item.title} onChange={v => update({ ...item, title: v })} placeholder="e.g. Outdated Website" />
                                    <FieldTextarea label="Description" value={item.description} onChange={v => update({ ...item, description: v })} placeholder="Describe the challenge..." rows={2} />
                                </div>
                            )}
                            newItem={() => ({ title: "", description: "" })}
                        />
                    )}

                    {/* ─── SOLUTIONS ─── */}
                    {activeFormTab === "solutions" && (
                        <DynamicList
                            label="Solutions"
                            items={formData.solutions}
                            onChange={items => setFormData(p => ({ ...p, solutions: items }))}
                            renderItem={(item, i, update) => (
                                <div className="space-y-3">
                                    <FieldInput label={`Solution ${i+1} Title`} value={item.title} onChange={v => update({ ...item, title: v })} placeholder="e.g. Corporate Websites" />
                                    <FieldTextarea label="Description" value={item.description} onChange={v => update({ ...item, description: v })} placeholder="Describe the solution..." rows={2} />
                                    <TagListEditor
                                        label="Features"
                                        items={item.features}
                                        onChange={features => update({ ...item, features })}
                                        placeholder="Add feature and press Enter"
                                    />
                                </div>
                            )}
                            newItem={() => ({ title: "", description: "", features: [] })}
                        />
                    )}

                    {/* ─── BENEFITS ─── */}
                    {activeFormTab === "benefits" && (
                        <DynamicList
                            label="Benefits"
                            items={formData.benefits}
                            onChange={items => setFormData(p => ({ ...p, benefits: items }))}
                            renderItem={(item, i, update) => (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FieldInput label={`Benefit ${i+1} Title`} value={item.title} onChange={v => update({ ...item, title: v })} placeholder="e.g. Fast Performance" />
                                    <div className="md:col-span-2">
                                        <FieldInput label="Description" value={item.description} onChange={v => update({ ...item, description: v })} placeholder="Short description" />
                                    </div>
                                </div>
                            )}
                            newItem={() => ({ title: "", description: "" })}
                        />
                    )}

                    {/* ─── FAQ ─── */}
                    {activeFormTab === "faq" && (
                        <DynamicList
                            label="Frequently Asked Questions"
                            items={formData.faqs}
                            onChange={items => setFormData(p => ({ ...p, faqs: items }))}
                            renderItem={(item, i, update) => (
                                <div className="space-y-3">
                                    <FieldInput label={`Question ${i+1}`} value={item.question} onChange={v => update({ ...item, question: v })} placeholder="e.g. How long does it take?" />
                                    <FieldTextarea label="Answer" value={item.answer} onChange={v => update({ ...item, answer: v })} placeholder="Detailed answer..." rows={3} />
                                </div>
                            )}
                            newItem={() => ({ question: "", answer: "" })}
                        />
                    )}

                    {/* ─── CASE STUDIES ─── */}
                    {activeFormTab === "casestudies" && (
                        <DynamicList
                            label="Case Study Results"
                            items={formData.case_study_results}
                            onChange={items => setFormData(p => ({ ...p, case_study_results: items }))}
                            renderItem={(item, i, update) => (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <FieldInput label={`Case Study ${i+1} Title`} value={item.title} onChange={v => update({ ...item, title: v })} placeholder="e.g. E-Commerce Platform" />
                                        <FieldInput label="Industry" value={item.industry} onChange={v => update({ ...item, industry: v })} placeholder="e.g. Retail / Fashion" />
                                    </div>
                                    <MetricsList 
                                        metrics={item.metrics}
                                        onChange={metrics => update({ ...item, metrics })}
                                    />
                                </div>
                            )}
                            newItem={() => ({ title: "", industry: "", metrics: [{ label: "", value: "" }] })}
                        />
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-black/20 flex-shrink-0">
                    <button onClick={closeModal} className="px-6 py-2.5 text-white hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Save size={18} /> Save Service
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
                <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to delete this service? This action cannot be undone.</p>
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

/* ═══════════════════════════════════════════
   REUSABLE FORM COMPONENTS
   ═══════════════════════════════════════════ */

function FieldInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">{label}</label>
      <input
        title={label}
        type={type}
        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">{label}</label>
      <textarea
        title={label}
        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}

function TagListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");

  const addItem = () => {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">{label} ({items.length})</label>
      <div className="flex gap-2">
        <input
          title={`Add ${label}`}
          type="text"
          className="flex-1 bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
        />
        <button onClick={addItem} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-medium" aria-label="Add Item">
          <Plus size={16} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--color-primary)]/20">
              {item}
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="hover:text-red-400 transition-colors" aria-label={`Remove ${item}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DynamicList<T>({ label, items, onChange, renderItem, newItem }: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (updated: T) => void) => React.ReactNode;
  newItem: () => T;
}) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">{label} ({items.length})</label>
        <button
          onClick={() => onChange([...items, newItem()])}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors text-xs font-bold"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 text-[var(--color-text-muted)] text-sm bg-white/5 rounded-xl">
          No items yet. Click &quot;Add&quot; to create one.
        </div>
      )}

      {items.map((item, i) => (
        <div key={i} className="glass rounded-xl border border-white/5">
          <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer" onClick={() => setCollapsed(p => ({ ...p, [i]: !p[i] }))}>
            <span className="text-xs font-bold text-[var(--color-text-muted)]">Item {i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); onChange(items.filter((_, idx) => idx !== i)); }}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                aria-label="Remove item"
              >
                <Trash2 size={14} />
              </button>
              {collapsed[i] ? <ChevronDown size={16} className="text-[var(--color-text-muted)]" /> : <ChevronUp size={16} className="text-[var(--color-text-muted)]" />}
            </div>
          </div>
          {!collapsed[i] && (
            <div className="px-4 pb-4">
              {renderItem(item, i, (updated) => {
                const copy = [...items];
                copy[i] = updated;
                onChange(copy);
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MetricsList({ metrics, onChange }: { metrics: { label: string; value: string }[]; onChange: (metrics: { label: string; value: string }[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Metrics ({metrics.length})</label>
        <button
          onClick={() => onChange([...metrics, { label: "", value: "" }])}
          className="flex items-center gap-1 px-2 py-1 bg-white/10 text-[var(--color-text-muted)] rounded-lg hover:bg-white/20 transition-colors text-xs"
        >
          <Plus size={12} /> Add Metric
        </button>
      </div>
      {metrics.map((metric, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            title="Metric Value"
            type="text"
            className="w-24 bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
            placeholder="300%"
            value={metric.value}
            onChange={e => { const copy = [...metrics]; copy[i] = { ...metric, value: e.target.value }; onChange(copy); }}
          />
          <input
            title="Metric Label"
            type="text"
            className="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
            placeholder="Increase in sales"
            value={metric.label}
            onChange={e => { const copy = [...metrics]; copy[i] = { ...metric, label: e.target.value }; onChange(copy); }}
          />
          <button onClick={() => onChange(metrics.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors" aria-label="Remove metric">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
