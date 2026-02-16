"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Plus, Edit, Trash2, Package, ArrowLeft, Monitor, Loader2, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Product {
  id: string;
  name: string;
  category: string;
  serial_number: string;
  model: string;
  status: string;
  created_at: string;
  current_client_id: string | null;
  assigned_date?: string;
  replacement_date?: string;
  return_date?: string;
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

interface Category {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Assignment State
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serial_number: "",
    model: "",
    status: "available"
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isExporting, setIsExporting] = useState(false);
  const [clientFilter, setClientFilter] = useState("all");

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

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("product_categories").select("*").order("name");
    if (data) {
        setCategories(data);
        if (!formData.category && data.length > 0) {
            setFormData(prev => ({ ...prev, category: data[0].name }));
        }
    }
  }, [formData.category]);

  useEffect(() => {
    setTimeout(() => {
        fetchProducts();
        fetchClients();
        fetchCategories();
    }, 0);
  }, [fetchProducts, fetchClients, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
       await supabase.from("products").update(formData).eq("id", editingId);
    } else {
       await supabase.from("products").insert(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", category: categories[0]?.name || "", serial_number: "", model: "", status: "available" });
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
        current_client_id: null,
        return_date: new Date().toISOString()
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
          current_client_id: selectedClient,
          assigned_date: new Date().toISOString(),
          return_date: null
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

  const handleCreateCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      setIsAddingCategory(true);
      const { error } = await supabase.from("product_categories").insert({ name: newCategoryName.trim() });
      if (!error) {
          setNewCategoryName("");
          fetchCategories();
      }
      setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (id: string) => {
      if (!window.confirm("Are you sure? This won't delete products in this category, but they will become 'Uncategorized'.")) return;
      await supabase.from("product_categories").delete().eq("id", id);
      fetchCategories();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                          p.model.toLowerCase().includes(search.toLowerCase()) ||
                          (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
    
    const matchesClient = clientFilter === "all" ? true : p.current_client_id === clientFilter;
    
    return matchesSearch && matchesClient;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset page on search
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [search]);

  // Robust download helper
  const downloadFile = (blob: Blob, fileName: string) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
  };

  const exportToExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
        if (!filteredProducts || filteredProducts.length === 0) {
            alert("No data available to export.");
            setIsExporting(false);
            return;
        }

        const XLSX = await import('xlsx');

        const dataToExport = filteredProducts.map(p => ({
            Name: p.name,
            Model: p.model,
            Category: p.category || 'N/A',
            SerialNumber: p.serial_number,
            Status: p.status,
            AssignedTo: p.profiles?.full_name || 'N/A',
            AssignedDate: p.assigned_date ? new Date(p.assigned_date).toLocaleDateString() : 'N/A',
            ReturnDate: p.return_date ? new Date(p.return_date).toLocaleDateString() : 'N/A',
            ReplacementDate: p.replacement_date ? new Date(p.replacement_date).toLocaleDateString() : 'N/A',
            RegisteredDate: new Date(p.created_at).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory_Export");
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        downloadFile(blob, `Genesoft_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
        setIsExporting(false);

    } catch (error) {
        console.error("Export to Excel failed:", error);
        alert(`Failed to export to Excel: ${(error as Error).message}`);
        setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
        if (!filteredProducts || filteredProducts.length === 0) {
            alert("No data available to export.");
            setIsExporting(false);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = new jsPDF() as any;
        
        doc.text("Genesoft Infotech - Product Inventory", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Filter: ${clientFilter === 'all' ? 'All Clients' : clients.find(c => c.id === clientFilter)?.full_name || 'Unknown Client'}`, 14, 35);

        autoTable(doc, {
            head: [['Name', 'Model', 'Category', 'Serial', 'Status', 'Assigned To', 'Assigned Date']],
            body: filteredProducts.map(p => [
                p.name, 
                p.model, 
                p.category || 'N/A', 
                p.serial_number,
                p.status,
                p.profiles?.full_name || 'N/A',
                p.assigned_date ? new Date(p.assigned_date).toLocaleDateString() : 'N/A'
            ]),
            startY: 45,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 133, 244] }
        });

        const pdfBlob = doc.output('blob');
        downloadFile(pdfBlob, `Genesoft_Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsExporting(false);
        
    } catch (error) {
        console.error("Export to PDF failed:", error);
        alert(`Failed to export to PDF: ${(error as Error).message}`);
        setIsExporting(false);
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
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Product Inventory</h1>
             <p className="text-[var(--color-text-muted)] text-sm">Manage hardware assets & assignments</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-3 rounded-xl border border-white/10 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
            >
                Manage Categories
            </button>
            <button 
                type="button"
                onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", category: categories[0]?.name || "", serial_number: "", model: "", status: "available" }); }}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-[var(--color-primary)]/20"
            >
                <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors h-full"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
            </div>
            
            <div className="w-full md:w-64">
                <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50 h-full"
                    value={clientFilter}
                    onChange={(e) => { setClientFilter(e.target.value); setCurrentPage(1); }}
                    aria-label="Filter by Client"
                >
                    <option value="all">All Clients</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={exportToExcel}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all font-medium text-sm disabled:opacity-50 whitespace-nowrap"
                >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />} 
                    {isExporting ? 'Exporting...' : 'Excel'}
                </button>
                <button 
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm disabled:opacity-50 whitespace-nowrap"
                >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />} 
                    {isExporting ? 'Exporting...' : 'PDF'}
                </button>
            </div>
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

        {/* Category Management Modal */}
        {showCategoryModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)}>
                <div className="glass p-8 rounded-2xl w-full max-w-md border border-[var(--color-primary)]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Manage Categories</h2>
                        <button onClick={() => setShowCategoryModal(false)} className="text-[var(--color-text-muted)] hover:text-white transition-colors">✕</button>
                    </div>

                    <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
                        <input 
                            className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            placeholder="New category name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={isAddingCategory}
                            className="bg-[var(--color-primary)] text-black font-bold px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {isAddingCategory ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        </button>
                    </form>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                                <span className="text-white text-sm font-medium">{cat.name}</span>
                                <button 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-2 text-[var(--color-text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete Category"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
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
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
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

        {/* Product Table */}
        <div className="glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                            <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Product</th>
                            <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Category</th>
                            <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Serial / Model</th>
                            <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Dates</th>
                            <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Assigned To</th>
                            <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                             <tr><td colSpan={7} className="p-8 text-center text-[var(--color-text-muted)]">Loading inventory...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                             <tr><td colSpan={7} className="p-8 text-center text-[var(--color-text-muted)]">No products found.</td></tr>
                        ) : (
                            currentItems.map((product) => (
                                <tr key={product.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${product.name.toLowerCase().includes('desktop') ? 'bg-blue-500/10 text-blue-400' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                                                {product.name.toLowerCase().includes('desktop') ? <Monitor size={20} /> : <Package size={20} />}
                                            </div>
                                            <span className="font-bold text-white">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 text-[var(--color-text-muted)] border border-white/10">
                                            {product.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-mono text-xs">{product.serial_number}</span>
                                            <span className="text-[var(--color-text-muted)] text-xs">{product.model}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                                            product.status === 'available' ? 'text-green-400 bg-green-400/5 border-green-400/20' :
                                            product.status === 'rented' ? 'text-blue-400 bg-blue-400/5 border-blue-400/20' :
                                            'text-orange-400 bg-orange-400/5 border-orange-400/20'
                                        }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {product.assigned_date && (
                                                <div className="text-[10px] text-[var(--color-text-muted)]">
                                                    Assign: <span className="text-white">{new Date(product.assigned_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {product.return_date && (
                                                <div className="text-[10px] text-[var(--color-text-muted)]">
                                                    Return: <span className="text-white">{new Date(product.return_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {!product.assigned_date && !product.return_date && (
                                                <span className="text-[var(--color-text-muted)] text-xs">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {product.current_client_id ? (
                                             <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                                <span className="text-sm text-white">{product.profiles?.full_name || 'Unknown'}</span>
                                             </div>
                                        ) : (
                                            <span className="text-[var(--color-text-muted)] text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {product.status === 'available' && (
                                                <button 
                                                    onClick={() => setShowAssignModal(product.id)}
                                                    className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-black transition-colors"
                                                    title="Assign to Client"
                                                >
                                                    <Package size={16} />
                                                </button>
                                            )}
                                            {product.status === 'rented' && (
                                                <button 
                                                    onClick={() => setShowReturnConfirm(product.id)}
                                                    className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition-colors"
                                                    title="Return Product"
                                                >
                                                    <ArrowLeft size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(product)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors" title="Edit Product" aria-label="Edit Product">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => setShowDeleteConfirm(product.id)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors" title="Delete Product" aria-label="Delete Product">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {!loading && filteredProducts.length > 0 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/5">
                    <div className="text-xs text-[var(--color-text-muted)]">
                        Showing <span className="text-white font-medium">{indexOfFirstItem + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="text-white font-medium">{filteredProducts.length}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-[var(--color-text-muted)]">
                            Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
