"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Plus, Edit, Trash2, Package, ArrowLeft, Monitor, Loader2, FileSpreadsheet, CheckSquare, HardDrive, Tag, ChevronUp, ChevronDown, Upload, QrCode, Wrench, History } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { TableSkeleton } from "@/components/ui/Skeletons";
import { createProduct, updateProduct, deleteProduct, deleteBulkProducts, updateBulkProductStatus, ProductFormData } from "@/actions/products";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  asset_id: string;
  serial_number: string;
  model: string;
  brand?: string | null;
  status: string;
  created_at: string;
  current_client_id: string | null;
  assigned_date?: string;
  replacement_date?: string;
  return_date?: string;
  description: string | null;
  specifications: Record<string, string>;
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
  
  // Custom Specs state for Add/Edit Form
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Assignment State
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    asset_id: "",
    serial_number: "",
    model: "",
    brand: "",
    status: "available",
    description: "",
    specifications: {} as Record<string, string>
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk Edit State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isExporting, setIsExporting] = useState(false);
  
  // Filtering
  const [clientFilter, setClientFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [specFilterKey, setSpecFilterKey] = useState("");
  const [specFilterValue, setSpecFilterValue] = useState("");

  // Sort state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Hover panel state
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
  };

  // CSV Import state
  const [isImporting, setIsImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // QR Code modal
  const [qrProductId, setQrProductId] = useState<string | null>(null);

  // Maintenance mode
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<string | null>(null);
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [maintenanceReturn, setMaintenanceReturn] = useState("");

  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<{id:string;assigned_date:string;client_id:string;status:string}[]>([]);

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
        if (!formData.category && data.length > 0 && !editingId) {
            setFormData(prev => ({ ...prev, category: data[0].name }));
        }
    }
  }, [formData.category, editingId]);

  useEffect(() => {
    setTimeout(() => {
        fetchProducts();
        fetchClients();
        fetchCategories();
    }, 0);
  }, [fetchProducts, fetchClients, fetchCategories]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowForm(false);
        setShowCategoryModal(false);
        setShowDeleteConfirm(null);
        setShowAssignModal(null);
        setShowReturnConfirm(null);
        setShowBulkDeleteConfirm(false);
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !showForm && !showCategoryModal) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          setShowForm(true);
          setEditingId(null);
          setFormData({ name: "", category: categories[0]?.name || "", asset_id: "", serial_number: "", model: "", brand: "", status: "available", description: "", specifications: {} });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showForm, showCategoryModal, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        let result;
        if (editingId) {
           result = await updateProduct(editingId, formData as ProductFormData);
        } else {
           result = await createProduct(formData as ProductFormData);
        }

        if (result.success) {
            toast.success(editingId ? "Product updated" : "Product created");
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: "", category: categories[0]?.name || "", asset_id: "", serial_number: "", model: "", brand: "", status: "available", description: "", specifications: {} });
            fetchProducts(); 
        } else {
            toast.error(result.error ? String(result.error) : "Operation failed");
            console.error(result.error);
        }
    } catch (e) {
        console.error(e);
        toast.error("An unexpected error occurred");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
        name: product.name,
        category: product.category,
        asset_id: product.asset_id || "",
        serial_number: product.serial_number,
        model: product.model,
        brand: product.brand || "",
        status: product.status,
        description: product.description || "",
        specifications: product.specifications || {}
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleQuickStatusToggle = async (product: Product) => {
    const nextStatus = product.status === 'available' ? 'rented' :
                       product.status === 'rented' ? 'available' : product.status;
    if (nextStatus === product.status) return;
    const { error } = await supabase.from('products').update({ status: nextStatus }).eq('id', product.id);
    if (!error) {
      toast.success(`Status → ${nextStatus}`);
      fetchProducts();
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const CONFIRM_DELETE = async () => {
    if (!showDeleteConfirm) return;
    
    const result = await deleteProduct(showDeleteConfirm);
    
    if (result.success) {
        toast.success("Product deleted");
        setShowDeleteConfirm(null);
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(showDeleteConfirm);
            return next;
        });
        fetchProducts();
    } else {
        toast.error("Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkActing(true);
    const result = await deleteBulkProducts(Array.from(selectedIds));
    if (result.success) {
        toast.success(`Deleted ${selectedIds.size} products`);
        setSelectedIds(new Set());
        setShowBulkDeleteConfirm(false);
        fetchProducts();
    } else {
        toast.error("Bulk delete failed");
    }
    setIsBulkActing(false);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    setIsBulkActing(true);
    const result = await updateBulkProductStatus(Array.from(selectedIds), status);
    if (result.success) {
        toast.success(`Updated status for ${selectedIds.size} products`);
        setSelectedIds(new Set());
        fetchProducts();
    } else {
        toast.error("Bulk block update failed");
    }
    setIsBulkActing(false);
  };

  const CONFIRM_RETURN = async () => {
    if (!showReturnConfirm) return;
    
    await supabase.from("products").update({
        status: 'available',
        current_client_id: null,
        return_date: new Date().toISOString()
    }).eq('id', showReturnConfirm);
    
    setShowReturnConfirm(null);
    fetchProducts();
  };

  const handleAssign = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!showAssignModal || !selectedClient) return;

      await supabase.from("products").update({
          status: 'rented',
          current_client_id: selectedClient,
          assigned_date: new Date().toISOString(),
          return_date: null
      }).eq('id', showAssignModal);

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

  const addSpecToForm = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!newSpecKey.trim()) return;
      setFormData({
          ...formData,
          specifications: { ...formData.specifications, [newSpecKey.trim()]: newSpecValue.trim() }
      });
      setNewSpecKey("");
      setNewSpecValue("");
  };

  const removeSpecFromForm = (key: string) => {
      const newSpecs = { ...formData.specifications };
      delete newSpecs[key];
      setFormData({ ...formData, specifications: newSpecs });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          p.serial_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          p.model.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          (p.asset_id && p.asset_id.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                          (p.category && p.category.toLowerCase().includes(debouncedSearch.toLowerCase()));
    
    const matchesClient = clientFilter === "all" ? true : p.current_client_id === clientFilter;
    const matchesCategory = categoryFilter === "all" ? true : p.category === categoryFilter;
    const matchesModel = modelFilter === "all" ? true : p.model === modelFilter;
    
    const matchesSpecFilter = (!specFilterKey || (!specFilterValue)) ? true :
        (p.specifications && p.specifications[specFilterKey] && p.specifications[specFilterKey].toLowerCase().includes(specFilterValue.toLowerCase()));
    
    return matchesSearch && matchesClient && matchesCategory && matchesModel && matchesSpecFilter;
  }).sort((a, b) => {
    if (!sortField) return 0;
    const aVal = (a[sortField as keyof Product] ?? '') as string;
    const bVal = (b[sortField as keyof Product] ?? '') as string;
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // Extract unique models for the filter dropdown
  const uniqueModels = Array.from(new Set(products.map(p => p.model).filter(Boolean))).sort();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(new Set(currentItems.map(p => p.id)));
    } else {
        setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
      const next = new Set(selectedIds);
      if (checked) next.add(id);
      else next.delete(id);
      setSelectedIds(next);
  };

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
            AssetID: p.asset_id || 'N/A',
            Category: p.category || 'N/A',
            SerialNumber: p.serial_number,
            Status: p.status,
            AssignedTo: p.profiles?.full_name || 'N/A',
            AssignedDate: p.assigned_date ? new Date(p.assigned_date).toLocaleDateString() : 'N/A',
            RegisteredDate: new Date(p.created_at).toLocaleDateString(),
            ...p.specifications // Flatten specs
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
            head: [['Name', 'Model', 'Category', 'Asset ID', 'Status', 'Assigned To']],
            body: filteredProducts.map(p => [
                p.name, 
                p.model, 
                p.category || 'N/A', 
                p.asset_id || 'N/A',
                p.status,
                p.profiles?.full_name || 'N/A'
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


  // CSV Import
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, '_'));
      let created = 0;
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',');
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = (vals[idx] || '').trim().replace(/^"|"$/g, ''); });
        if (!row.name && !row.product_name) continue;
        const data: Record<string, string> = {
          name: row.name || row.product_name || '',
          category: row.category || categories[0]?.name || '',
          asset_id: row.asset_id || row.id || '',
          serial_number: row.serial_number || row.serial || '',
          model: row.model || '',
          brand: row.brand || '',
          status: row.status || 'available',
          description: row.description || '',
        };
        const result = await createProduct(data as unknown as ProductFormData);
        if (result.success) created++;
      }
      toast.success(`Imported ${created} products from CSV`);
      fetchProducts();
    } catch (err) {
      toast.error('CSV import failed: ' + (err as Error).message);
    }
    setIsImporting(false);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  // Show assignment history
  const handleShowHistory = async (productId: string) => {
    const { data } = await supabase
      .from('assignments')
      .select('id, assigned_date, client_id, status')
      .eq('product_id', productId)
      .order('assigned_date', { ascending: false })
      .limit(20);
    setHistoryData(data || []);
    setShowHistoryModal(productId);
  };

  // Mark as maintenance
  const handleSetMaintenance = async () => {
    if (!showMaintenanceModal) return;
    await supabase.from('products').update({
      status: 'maintenance',
      description: maintenanceNote ? `[MAINTENANCE] ${maintenanceNote}` : undefined,
    }).eq('id', showMaintenanceModal);
    toast.success('Product marked as under maintenance');
    setShowMaintenanceModal(null);
    setMaintenanceNote('');
    setMaintenanceReturn('');
    fetchProducts();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white mb-3 transition-colors text-sm">
               <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Product Inventory</h1>
            <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Manage hardware assets, categories, and assignments.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            {/* Hidden CSV input */}
            <input ref={csvInputRef} type="file" accept=".csv" className="hidden" title="Import CSV" onChange={handleCsvImport} />
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50"
              title="Import products from CSV file"
            >
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isImporting ? 'Importing...' : 'CSV Import'}
            </button>
            <button 
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all text-sm font-medium whitespace-nowrap"
            >
                Manage Categories
            </button>
            <button 
                type="button"
                onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", category: categories[0]?.name || "", asset_id: "", serial_number: "", model: "", brand: "", status: "available", description: "", specifications: {} }); }}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-[var(--color-primary)]/20 whitespace-nowrap"
            >
                <Plus size={17} /> Add Product
            </button>
          </div>
        </div>

        {/* Inventory Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass border-white/10 bg-black/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Products</CardTitle>
              <HardDrive size={18} className="text-[var(--color-primary)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-gray-500 mt-1">{filteredProducts.length} matching filters</p>
            </CardContent>
          </Card>
          <Card className="glass border-white/10 bg-black/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Available</CardTitle>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{products.filter(p => p.status === 'available').length}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to assign</p>
            </CardContent>
          </Card>
          <Card className="glass border-white/10 bg-black/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Rented</CardTitle>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{products.filter(p => p.status === 'rented').length}</div>
              <p className="text-xs text-gray-500 mt-1">Currently deployed</p>
            </CardContent>
          </Card>
          <Card className="glass border-white/10 bg-black/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Categories</CardTitle>
              <Tag size={18} className="text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{categories.length}</div>
              <p className="text-xs text-gray-500 mt-1">Asset types</p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
            <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
               <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold">
                   <CheckSquare className="text-[var(--color-primary)]" />
                   {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
               </div>
               <div className="flex flex-wrap items-center gap-2">
                   <select 
                        className="bg-black/40 border border-[var(--color-primary)]/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] text-sm disabled:opacity-50"
                        onChange={(e) => { if (e.target.value) handleBulkStatusUpdate(e.target.value); e.target.value = ""; }}
                        defaultValue=""
                        disabled={isBulkActing}
                        title="Update Bulk Status"
                        aria-label="Update Bulk Status"
                    >
                        <option value="" disabled>Change Status...</option>
                        <option value="available">Set Available</option>
                        <option value="rented">Set Rented</option>
                        <option value="maintenance">Set Maintenance</option>
                        <option value="retired">Set Retired</option>
                    </select>
                   <button 
                       onClick={() => setShowBulkDeleteConfirm(true)}
                       disabled={isBulkActing}
                       className="bg-red-500/20 text-red-500 hover:bg-red-500/40 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-red-500/20 flex items-center gap-2 disabled:opacity-50"
                   >
                       {isBulkActing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                       Bulk Delete
                   </button>
               </div>
            </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors h-full min-h-[42px]"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>
            
            <div className="w-full md:w-48 lg:w-48">
                <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50 h-full min-h-[42px]"
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

            <div className="w-full md:w-36 lg:w-40">
                <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50 h-full min-h-[42px]"
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    aria-label="Filter by Category"
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="w-full md:w-36 lg:w-40">
                <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50 h-full min-h-[42px]"
                    value={modelFilter}
                    onChange={(e) => { setModelFilter(e.target.value); setCurrentPage(1); }}
                    aria-label="Filter by Model"
                >
                    <option value="all">All Models</option>
                    {uniqueModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Specification Filter */}
            <div className="flex gap-2 w-full md:flex-1 lg:max-w-md">
                <input 
                    type="text" 
                    placeholder="Spec Key (e.g. RAM)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50 h-full min-h-[42px]"
                    value={specFilterKey}
                    onChange={(e) => { setSpecFilterKey(e.target.value); if(!e.target.value) setSpecFilterValue(""); setCurrentPage(1); }}
                />
                <input 
                    type="text" 
                    placeholder="Spec Value..."
                    disabled={!specFilterKey}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50 h-full disabled:opacity-50 min-h-[42px]"
                    value={specFilterValue}
                    onChange={(e) => { setSpecFilterValue(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={exportToExcel}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all font-medium text-sm disabled:opacity-50 whitespace-nowrap"
                >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />} 
                    <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Excel'}</span>
                </button>
                <button 
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm disabled:opacity-50 whitespace-nowrap"
                >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />} 
                    <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'PDF'}</span>
                </button>
            </div>
        </div>



        {/* Existing modals (Assign, Delete Confirm, Return, Category Management) */}
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
        
        {showBulkDeleteConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowBulkDeleteConfirm(false)}>
                <div className="glass p-8 rounded-2xl w-full max-w-sm border border-red-500/30 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-white mb-4">Delete {selectedIds.size} Products?</h2>
                    <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to bulk delete the selected items? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowBulkDeleteConfirm(false)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                        <button type="button" disabled={isBulkActing} onClick={handleBulkDelete} className="flex gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50">
                            {isBulkActing && <Loader2 size={16} className="animate-spin" />}
                            Bulk Delete
                        </button>
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

        {/* Dynamic Form Modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                <div className="glass p-8 rounded-2xl w-full max-w-2xl border border-[var(--color-primary)]/20 shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-white mb-6">
                        {editingId ? "Edit Product" : "Add New Product"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                             <div>
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Model</label>
                                <input 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                    placeholder="Model Number / Name"
                                    value={formData.model}
                                    title="Model Number"
                                    onChange={e => setFormData({...formData, model: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Brand</label>
                                <input 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                    placeholder="e.g. Apple, Dell, Lenovo"
                                    title="Product Brand"
                                    value={formData.brand}
                                    onChange={e => setFormData({...formData, brand: e.target.value})}
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
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Asset ID (Unique)</label>
                                <input 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none" 
                                    placeholder="e.g. LAP-2024-001" 
                                    value={formData.asset_id} 
                                    onChange={e => setFormData({...formData, asset_id: e.target.value})} 
                                    required 
                                    aria-label="Asset ID"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 mb-1 block">Description</label>
                                <textarea 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none min-h-[80px]" 
                                    placeholder="Product description and notes..." 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    aria-label="Description"
                                />
                            </div>
                        </div>

                        {/* Specifications Section */}
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1 block mb-2">Specifications Details</label>
                                    <p className="text-xs text-[var(--color-text-muted)] ml-1">Add custom key-value pairs (e.g. RAM: 16GB)</p>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <input 
                                        className="bg-[var(--color-surface)] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-primary)] w-full md:w-32"
                                        placeholder="Key (e.g. CPU)"
                                        value={newSpecKey}
                                        onChange={e => setNewSpecKey(e.target.value)}
                                    />
                                    <input 
                                        className="bg-[var(--color-surface)] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-primary)] w-full md:w-48"
                                        placeholder="Value (e.g. i7-12700H)"
                                        value={newSpecValue}
                                        onChange={e => setNewSpecValue(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecToForm(); } }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => addSpecToForm()}
                                        disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                                        className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black font-bold px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {Object.keys(formData.specifications).length === 0 && (
                                    <p className="text-xs text-[var(--color-text-muted)] italic py-2">No specifications added yet. Select a category to add details.</p>
                                )}
                                {Object.entries(formData.specifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-3">
                                        <div className="w-1/3 min-w-[120px]">
                                            <input 
                                                value={key} 
                                                disabled 
                                                title="Specification Key"
                                                className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-sm text-[var(--color-text-muted)] outline-none cursor-not-allowed" 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                placeholder={`Enter value for ${key}`}
                                                value={value}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    specifications: { ...formData.specifications, [key]: e.target.value }
                                                })}
                                                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeSpecFromForm(key)}
                                            className="p-2 text-[var(--color-text-muted)] hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Remove specification"
                                            aria-label="Remove specification"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="btn-primary px-6 py-2 rounded-lg">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Product Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={5} />
        ) : (
          <div className="glass rounded-xl border border-white/5 overflow-x-auto">
            {/* DESKTOP TABLE - hidden on mobile */}
            <div className="hidden md:block">
                <table className="w-full min-w-[760px] text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-white/5 border-b border-white/5">
                            <th className="p-3 w-12 text-center">
                                <input 
                                    type="checkbox"
                                    disabled={currentItems.length === 0}
                                    checked={currentItems.length > 0 && selectedIds.size === currentItems.length}
                                    ref={input => {
                                        if (input) {
                                            input.indeterminate = selectedIds.size > 0 && selectedIds.size < currentItems.length;
                                        }
                                    }}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-white/20 bg-black/20 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                    aria-label="Select all products"
                                    title="Select all products"
                                />
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0 w-9 h-4"></div>
                                    <span>Product</span>
                                    {sortField === 'name' ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronUp size={12} className="opacity-20" />}
                                </div>
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort('category')}>
                                <span className="flex items-center gap-1">Category {sortField === 'category' ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronUp size={12} className="opacity-20" />}</span>
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">Serial / Asset ID</th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort('status')}>
                                <span className="flex items-center gap-1">Status {sortField === 'status' ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronUp size={12} className="opacity-20" />}</span>
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">Assigned To</th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredProducts.length === 0 ? (
                             <tr><td colSpan={7} className="p-16 text-center">
                               <div className="flex flex-col items-center gap-3">
                                 <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                                   <Package size={26} className="text-[var(--color-text-muted)]" />
                                 </div>
                                 <p className="text-white font-medium">No products found</p>
                                 <p className="text-sm text-[var(--color-text-muted)]">Try adjusting your search or filter criteria</p>
                               </div>
                             </td></tr>
                         ) : (
                                 currentItems.map((product) => (
                                     <tr key={product.id}
                                         className={`group hover:bg-white/5 transition-colors ${selectedIds.has(product.id) ? 'bg-[var(--color-primary)]/5' : ''}`}
                                         onMouseEnter={() => setHoveredProductId(product.id)}
                                         onMouseLeave={() => setHoveredProductId(null)}
                                     >
                                         <td className="p-3 text-center align-middle">
                                             <input 
                                                 type="checkbox"
                                                 checked={selectedIds.has(product.id)}
                                                 onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                                                 className="w-4 h-4 rounded border-white/20 bg-black/20 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                                 aria-label={`Select product ${product.name}`}
                                                 title="Select product"
                                             />
                                         </td>
                                         <td className="p-3 align-middle">
                                             <div className="flex items-center gap-3">
                                                 <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${product.category?.toLowerCase() === 'desktop' ? 'bg-blue-500/10 text-blue-400' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                                                     {product.category?.toLowerCase() === 'desktop' ? <Monitor size={18} /> : <Package size={18} />}
                                                 </div>
                                                 <div className="flex flex-col min-w-0">
                                                     <span className="font-semibold text-white leading-tight text-sm truncate">{product.name}</span>
                                                     {product.model && <span className="text-[10px] text-[var(--color-text-muted)] truncate">{product.model}</span>}
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="p-3 align-middle">
                                             <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-white/5 text-[var(--color-text-muted)] border border-white/10 inline-block whitespace-nowrap">
                                                 {product.category || 'N/A'}
                                             </span>
                                         </td>
                                         <td className="p-3 align-middle">
                                             <div className="flex flex-col gap-0.5">
                                                 {product.asset_id && <span className="text-[var(--color-primary)] font-bold text-[11px] uppercase tracking-wider">ID: {product.asset_id}</span>}
                                                 <span className="text-[var(--color-text-muted)] font-mono text-[11px]">SN: {product.serial_number}</span>
                                             </div>
                                         </td>
                                         <td className="p-3 align-middle">
                                             <button
                                               onClick={() => ['available','rented'].includes(product.status) ? handleQuickStatusToggle(product) : undefined}
                                               className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap transition-all ${
                                                   product.status === 'available' ? 'text-green-400 bg-green-400/5 border-green-400/20 hover:bg-green-400/20 cursor-pointer' :
                                                   product.status === 'rented' ? 'text-blue-400 bg-blue-400/5 border-blue-400/20 hover:bg-blue-400/20 cursor-pointer' :
                                                   'text-orange-400 bg-orange-400/5 border-orange-400/20 cursor-default'
                                               }`}
                                               title={['available','rented'].includes(product.status) ? 'Click to toggle status' : undefined}
                                             >
                                                 {product.status}
                                             </button>
                                         </td>
                                         <td className="p-3 align-middle">
                                             {product.current_client_id ? (
                                                  <div className="flex items-center gap-2">
                                                     <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0"></div>
                                                     <span className="text-sm text-white truncate max-w-[120px]" title={product.profiles?.full_name}>{product.profiles?.full_name || 'Unknown'}</span>
                                                  </div>
                                             ) : (
                                                 <span className="text-[var(--color-text-muted)] text-xs">—</span>
                                             )}
                                         </td>
                                         <td className="p-3 align-middle text-right">
                                             <div className="flex items-center justify-end gap-1">
                                                 {product.status === 'available' && (
                                                     <button 
                                                         onClick={() => setShowAssignModal(product.id)}
                                                         className="p-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-black transition-colors shrink-0"
                                                         title="Assign to Client"
                                                     >
                                                         <Package size={15} />
                                                     </button>
                                                 )}
                                                 {product.status === 'rented' && (
                                                     <button 
                                                         onClick={() => setShowReturnConfirm(product.id)}
                                                         className="p-1.5 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition-colors shrink-0"
                                                         title="Return Product"
                                                     >
                                                         <ArrowLeft size={15} />
                                                     </button>
                                                 )}
                                                  <button onClick={() => handleEdit(product)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors shrink-0" title="Edit Product">
                                                      <Edit size={15} />
                                                  </button>
                                                  <button onClick={() => setShowMaintenanceModal(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-orange-400 transition-colors shrink-0" title="Mark as Maintenance">
                                                      <Wrench size={15} />
                                                  </button>
                                                  <button onClick={() => handleShowHistory(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-blue-400 transition-colors shrink-0" title="Assignment History">
                                                      <History size={15} />
                                                  </button>
                                                  <button onClick={() => setQrProductId(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-purple-400 transition-colors shrink-0" title="Show QR Code">
                                                      <QrCode size={15} />
                                                  </button>
                                                  <button onClick={() => setShowDeleteConfirm(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors shrink-0" title="Delete Product">
                                                      <Trash2 size={15} />
                                                  </button>
                                             </div>
                                         </td>
                                     </tr>
                                 ))
                         )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARDS - shown only on mobile */}
            <div className="block md:hidden">
                {filteredProducts.length === 0 ? (
                    <p className="p-8 text-center text-[var(--color-text-muted)]">No products found matching filters.</p>
                ) : (
                    <div className="divide-y divide-white/5">
                        {currentItems.map((product) => (
                            <div key={product.id} className={`p-4 ${selectedIds.has(product.id) ? 'bg-[var(--color-primary)]/5' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <input 
                                        type="checkbox"
                                        checked={selectedIds.has(product.id)}
                                        onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-white/20 bg-black/20 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer shrink-0"
                                        aria-label={`Select product ${product.name}`}
                                        title="Select product"
                                    />
                                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${product.category?.toLowerCase() === 'desktop' ? 'bg-blue-500/10 text-blue-400' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                                        {product.category?.toLowerCase() === 'desktop' ? <Monitor size={20} /> : <Package size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-white text-sm leading-tight">{product.name}</p>
                                                {product.model && <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{product.model}</p>}
                                            </div>
                                            <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                                                product.status === 'available' ? 'text-green-400 bg-green-400/5 border-green-400/20' :
                                                product.status === 'rented' ? 'text-blue-400 bg-blue-400/5 border-blue-400/20' :
                                                'text-orange-400 bg-orange-400/5 border-orange-400/20'
                                            }`}>
                                                {product.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <span className="text-[11px] text-[var(--color-text-muted)]">Cat: <span className="text-white">{product.category || 'N/A'}</span></span>
                                            {product.asset_id && <span className="text-[11px] text-[var(--color-primary)] font-mono">ID: {product.asset_id}</span>}
                                            <span className="text-[11px] text-[var(--color-text-muted)] font-mono">SN: {product.serial_number}</span>
                                            {product.current_client_id && (
                                                <span className="text-[11px] text-white flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>{product.profiles?.full_name}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-3">
                                            {product.status === 'available' && (
                                                <button 
                                                    onClick={() => setShowAssignModal(product.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-black transition-colors text-xs font-medium"
                                                    title="Assign to Client"
                                                >
                                                    <Package size={13} /> Assign
                                                </button>
                                            )}
                                            {product.status === 'rented' && (
                                                <button 
                                                    onClick={() => setShowReturnConfirm(product.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition-colors text-xs font-medium"
                                                    title="Return Product"
                                                >
                                                    <ArrowLeft size={13} /> Return
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(product)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors" title="Edit Product">
                                                <Edit size={15} />
                                            </button>
                                            <button onClick={() => setShowDeleteConfirm(product.id)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors" title="Delete Product">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-white/5 bg-white/5">
                    <span className="text-sm text-[var(--color-text-muted)]">
                        Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >← Prev</button>
                        <span className="text-sm text-white font-medium px-2">{currentPage} / {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >Next →</button>
                    </div>
                </div>
            )}
          </div>
        )}
        {/* ─── QR Code Modal ─── */}
        {qrProductId && (() => {
          const p = products.find(x => x.id === qrProductId);
          return p ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setQrProductId(null)}>
              <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-8 max-w-xs w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                <p className="text-[var(--color-text-muted)] text-xs mb-5">{p.asset_id || p.id}</p>
                <div className="bg-white rounded-xl p-4 mx-auto w-fit mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" className="w-40 h-40" shapeRendering="crispEdges">
                    {/* Simple QR placeholder grid – real apps would use a QR library */}
                    <rect width="10" height="10" fill="white" />
                    <rect x="1" y="1" width="3" height="3" fill="black" />
                    <rect x="6" y="1" width="3" height="3" fill="black" />
                    <rect x="1" y="6" width="3" height="3" fill="black" />
                    <rect x="4.5" y="4.5" width="1" height="1" fill="black" />
                  </svg>
                </div>
                <div className="text-left text-xs font-mono text-[var(--color-text-muted)] bg-black/20 rounded-xl p-3 mb-4">
                  <p className="text-white font-bold mb-1">Asset Info</p>
                  <p>Name: {p.name}</p>
                  {p.asset_id && <p>ID: {p.asset_id}</p>}
                  <p>SN: {p.serial_number}</p>
                  <p>Status: {p.status}</p>
                </div>
                <button onClick={() => setQrProductId(null)} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Close</button>
              </div>
            </div>
          ) : null;
        })()}

        {/* ─── History Modal ─── */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowHistoryModal(null)}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><History size={20} /> Assignment History</h3>
              {historyData.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-center py-8">No assignment history found.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {historyData.map((h) => (
                    <div key={h.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                      <span className="text-xs text-[var(--color-text-muted)]">{new Date(h.assigned_date).toLocaleDateString()}</span>
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${h.status === 'rented' ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10'}`}>{h.status}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setShowHistoryModal(null)} className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Close</button>
            </div>
          </div>
        )}

        {/* ─── Maintenance Modal ─── */}
        {showMaintenanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowMaintenanceModal(null)}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Wrench size={18} /> Mark as Maintenance</h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">This will set the status to <strong className="text-orange-400">maintenance</strong> and remove it from active assignments.</p>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1.5 block">Maintenance Note (optional)</label>
                  <textarea title="Maintenance note" rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-400/50 transition-colors" placeholder="e.g. Screen cracked, sent for repair..." value={maintenanceNote} onChange={e => setMaintenanceNote(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1.5 block">Expected Return Date (optional)</label>
                  <input type="date" title="Expected return date" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-400/50 transition-colors" value={maintenanceReturn} onChange={e => setMaintenanceReturn(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowMaintenanceModal(null); setMaintenanceNote(''); setMaintenanceReturn(''); }} className="px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSetMaintenance} className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"><Wrench size={15} /> Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
