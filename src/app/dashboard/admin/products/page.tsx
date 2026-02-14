"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Search, Edit, Trash2, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category: string;
  serial_number: string;
  model: string;
  status: string;
  created_at: string;
  current_client_id: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Client {
  id: string;
  full_name: string;
  email: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Assignment State
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Laptop",
    serial_number: "",
    model: "",
    status: "available"
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select(`*, profiles:current_client_id(full_name, email)`) 
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }, []);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, email").eq("role", "client");
    if (data) setClients(data);
  }, []);

  useEffect(() => {
    setTimeout(() => {
        fetchProducts();
        fetchClients();
    }, 0);
  }, [fetchProducts, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
       await supabase.from("products").update(formData).eq("id", editingId);
    } else {
       await supabase.from("products").insert(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", category: "Laptop", serial_number: "", model: "", status: "available" });
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setFormData({
        name: product.name,
        category: product.category,
        serial_number: product.serial_number,
        model: product.model,
        status: product.status
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const CONFIRM_DELETE = async () => {
    if (!showDeleteConfirm) return;
    await supabase.from("products").delete().eq("id", showDeleteConfirm);
    setShowDeleteConfirm(null);
    fetchProducts();
  };

  const CONFIRM_RETURN = async () => {
    if (!showReturnConfirm) return;
    
    // 1. Update Product
    await supabase.from("products").update({
        status: 'available',
        current_client_id: null
    }).eq('id', showReturnConfirm);

    // 2. Here we would ideally close the assignment record too, but for now we just free the product.
    
    setShowReturnConfirm(null);
    fetchProducts();
  };

  const handleAssign = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!showAssignModal || !selectedClient) return;

      // 1. Update Product
      await supabase.from("products").update({
          status: 'rented',
          current_client_id: selectedClient
      }).eq('id', showAssignModal);

      // 2. Create Assignment Record
      await supabase.from("assignments").insert({
          product_id: showAssignModal,
          client_id: selectedClient,
          status: 'active',
          assigned_date: new Date().toISOString()
      });

      setShowAssignModal(null);
      setSelectedClient("");
      fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.serial_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white mb-2 transition-colors">
               <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Product Inventory</h1>
             <p className="text-[var(--color-text-muted)] text-sm">Manage hardware assets & assignments</p>
          </div>
          <button 
                type="button"
                onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", category: "Laptop", serial_number: "", model: "", status: "available" }); }}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-[var(--color-primary)]/20"
            >
                <Plus size={18} /> Add Product
            </button>
        </div>

        {/* Search Bar */}
        <div className="glass p-4 rounded-xl mb-8 flex items-center gap-4 border border-white/5">
            <Search className="text-[var(--color-text-muted)]" size={20} />
            <input 
                type="text" 
                placeholder="Search by name, serial, or category..." 
                className="bg-transparent border-none focus:ring-0 text-white w-full outline-none placeholder:text-[var(--color-text-muted)]/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowAssignModal(null)}>
                <div className="glass p-8 rounded-2xl w-full max-w-sm border border-[var(--color-primary)]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-white mb-4">Assign Product</h2>
                    <p className="text-[var(--color-text-muted)] mb-4">Select a client to assign this product to.</p>
                    <form onSubmit={handleAssign}>
                        <select 
                            className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white mb-6 focus:ring-1 focus:ring-[var(--color-primary)]"
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            required
                            aria-label="Select Client"
                        >
                            <option value="">Select Client...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowAssignModal(null)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Confirm Assignment</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Confirmation Modals */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
                <div className="glass p-8 rounded-2xl w-full max-w-sm border border-red-500/30 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-white mb-4">Delete Product?</h2>
                    <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                        <button type="button" onClick={CONFIRM_DELETE} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/20">Delete</button>
                    </div>
                </div>
            </div>
        )}

        {showReturnConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowReturnConfirm(null)}>
                <div className="glass p-8 rounded-2xl w-full max-w-sm border border-[var(--color-primary)]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-white mb-4">Return Product?</h2>
                    <p className="text-[var(--color-text-muted)] mb-6">Mark this product as returned and available?</p>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowReturnConfirm(null)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                        <button type="button" onClick={CONFIRM_RETURN} className="btn-primary px-4 py-2 rounded-lg">Confirm Return</button>
                    </div>
                </div>
            </div>
        )}

        {/* Form Modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                <div className="glass p-8 rounded-2xl w-full max-w-md border border-[var(--color-primary)]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-white mb-6">
                        {editingId ? "Edit Product" : "Add New Product"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                             <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Name</label>
                            <input 
                                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                placeholder="Product Name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Model</label>
                                <input 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                    placeholder="Model" 
                                    value={formData.model} 
                                    onChange={e => setFormData({...formData, model: e.target.value})} 
                                    aria-label="Product Model"
                                />
                             </div>
                             <div>
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Category</label>
                                <select 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    aria-label="Product Category"
                                >
                                    <option value="Laptop">Laptop</option>
                                    <option value="Desktop">Desktop</option>
                                    <option value="Server">Server</option>
                                    <option value="Accessory">Accessory</option>
                                </select>
                             </div>
                        </div>
                        <div>
                             <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Serial Number</label>
                            <input 
                                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                placeholder="Serial Number" 
                                value={formData.serial_number} 
                                onChange={e => setFormData({...formData, serial_number: e.target.value})} 
                                required 
                                aria-label="Serial Number"
                            />
                        </div>
                         <div>
                             <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Status</label>
                            <select 
                                 className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                 value={formData.status} 
                                 onChange={e => setFormData({...formData, status: e.target.value})}
                                 aria-label="Product Status"
                            >
                                <option value="available">Available</option>
                                <option value="rented">Rented</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="btn-primary px-6 py-2 rounded-lg">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Product List Grouped by Category */}
        <div className="space-y-8">
            {loading ? (
                <div className="p-12 text-center text-[var(--color-text-muted)]">Loading inventory...</div>
            ) : (
                Object.entries(
                    filteredProducts.reduce((acc, product) => {
                        const cat = product.category || 'Uncategorized';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(product);
                        return acc;
                    }, {} as Record<string, Product[]>)
                ).map(([category, items]) => (
                    <div key={category}>
                        <h2 className="text-xl font-bold text-white mb-6 pb-2 flex items-center gap-2">
                             <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-sm">
                                {category}
                             </div>
                             <span className="text-sm font-normal text-[var(--color-text-muted)] ml-auto">{items.length} units</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((product) => (
                                <div key={product.id} className="glass p-5 rounded-xl flex flex-col justify-between border border-white/5 hover:border-[var(--color-primary)]/30 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                            <Package size={20} />
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                                            product.status === 'available' ? 'text-green-400 bg-green-400/5 border-green-400/20' :
                                            product.status === 'rented' ? 'text-blue-400 bg-blue-400/5 border-blue-400/20' :
                                            'text-orange-400 bg-orange-400/5 border-orange-400/20'
                                        }`}>
                                            {product.status}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                                        <p className="text-xs text-[var(--color-text-muted)] font-mono">SN: {product.serial_number}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{product.model}</p>
                                    </div>

                                    {product.current_client_id && (
                                        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Assigned To</p>
                                            <p className="text-sm text-white font-medium flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                                {product.profiles?.full_name || 'Unknown'}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => handleEdit(product)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Edit Product"><Edit size={16} /></button>
                                            <button type="button" onClick={() => setShowDeleteConfirm(product.id)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors" aria-label="Delete Product"><Trash2 size={16} /></button>
                                        </div>

                                        {product.status === 'available' && (
                                            <button 
                                                type="button" 
                                                onClick={() => setShowAssignModal(product.id)} 
                                                className="px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-lg hover:bg-[var(--color-primary)] hover:text-black transition-colors"
                                            >
                                                Assign
                                            </button>
                                        )}
                                        {product.status === 'rented' && (
                                            <button 
                                                type="button" 
                                                onClick={() => setShowReturnConfirm(product.id)} 
                                                className="px-3 py-1.5 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 border border-white/10"
                                            >
                                                Return
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
            
            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Package size={48} className="mx-auto text-[var(--color-text-muted)] mb-4 opacity-50" />
                    <p className="text-lg text-white font-medium">No products found</p>
                    <p className="text-[var(--color-text-muted)] text-sm">Try adjusting your search query.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
