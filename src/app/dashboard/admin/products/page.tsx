"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Plus, Edit, Trash2, Package, ArrowLeft, Monitor, Loader2, FileSpreadsheet, CheckSquare, HardDrive, Tag, ChevronUp, ChevronDown, Upload, Barcode, Wrench, History, Filter, X, Info, Download, Printer, Cpu } from "lucide-react";
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
  // const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

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
  const [barcodeProductId, setBarcodeProductId] = useState<string | null>(null);

  // Maintenance mode
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<string | null>(null);
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [maintenanceReturn, setMaintenanceReturn] = useState("");

  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<{id:string;assigned_date:string;client_id:string;status:string}[]>([]);

  // Filter Drawer
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // View Details
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

  // Quick Status Toggle
  const [activeStatusToggleId, setActiveStatusToggleId] = useState<string | null>(null);

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Bulk Barcode Print
  const [isPrintingBarcode, setIsPrintingBarcode] = useState(false);

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
        setShowFilterDrawer(false);
        setViewDetailsId(null);
        setShowImportModal(false);
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

  const handleQuickStatusToggle = async (product: Product, nextStatus: string) => {
    if (nextStatus === product.status) return;
    const { error } = await supabase.from('products').update({ status: nextStatus }).eq('id', product.id);
    if (!error) {
      toast.success(`Status → ${nextStatus}`);
      fetchProducts();
      setActiveStatusToggleId(null);
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


  // CSV Import Logic & Drag Drop
  const processCsvFile = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) throw new Error("File seems empty or missing headers");
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
      setShowImportModal(false);
    } catch (err) {
      toast.error('CSV import failed: ' + (err as Error).message);
    }
    setIsImporting(false);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processCsvFile(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const downloadSampleCsv = () => {
    const content = "Name,Category,Asset_ID,Serial_Number,Model,Brand,Status,Description\nSample Laptop,Laptop,LAP-001,SN-12345,XPS 15,Dell,available,Test item\n";
    const blob = new Blob([content], { type: 'text/csv' });
    downloadFile(blob, 'Genesoft_Inventory_Template.csv');
  };

  // Bulk Barcode Print
  const printBulkBarcodes = async () => {
    if (selectedIds.size === 0 || isPrintingBarcode) return;
    setIsPrintingBarcode(true);
    try {
        const { jsPDF } = await import('jspdf');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = new jsPDF() as any;
        const selectedProducts = products.filter(p => selectedIds.has(p.id));
        
        doc.setFontSize(16);
        doc.text("Asset Barcodes", 10, 15);
        
        let x = 10;
        let y = 25;
        const width = 55;
        const height = 20;
        const xSpacing = 10;
        const ySpacing = 15;
        
        for (let i = 0; i < selectedProducts.length; i++) {
            const p = selectedProducts[i];
            const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(p.asset_id || p.id)}`;
            
            try {
                const response = await fetch(barcodeUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                const base64data = await new Promise<string>((resolve) => {
                    reader.readAsDataURL(blob); 
                    reader.onloadend = () => resolve(reader.result as string);
                });
                
                doc.addImage(base64data, 'PNG', x, y, width, height);
                
                doc.setFontSize(8);
                doc.text(p.name.substring(0, 20), x, y + height + 4);
                doc.setFontSize(7);
                doc.text(p.asset_id || p.id.substring(0, 8), x, y + height + 8);
                
                x += width + xSpacing;
                if (x > 180) {
                    x = 10;
                    y += height + ySpacing + 5;
                }
                if (y > 260) {
                    doc.addPage();
                    x = 10;
                    y = 20;
                }
            } catch (err) {
                console.error("Failed to fetch Barcode for", p.name, err);
                doc.rect(x, y, width, height);
                doc.text("Barcode Error", x + 5, y + height/2);
            }
        }
        
        const pdfBlob = doc.output('blob');
        downloadFile(pdfBlob, `Asset_Barcodes_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("Barcodes generated successfully");
    } catch (err) {
        console.error("Bulk Barcode failure:", err);
        toast.error("Failed to generate Barcodes");
    }
    setIsPrintingBarcode(false);
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
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all text-sm font-medium whitespace-nowrap"
              title="Import products from CSV file"
            >
              <Upload size={16} />
              CSV Import
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
                   <button 
                       onClick={printBulkBarcodes}
                       disabled={isPrintingBarcode || isBulkActing}
                       className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-purple-500/20 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                   >
                       {isPrintingBarcode ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                       Print Barcodes
                   </button>
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
            <div className="flex gap-2 flex-1">
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
                <button 
                    onClick={() => setShowFilterDrawer(true)}
                    className={`flex items-center justify-center gap-2 px-4 rounded-xl border transition-all h-full min-h-[42px] whitespace-nowrap ${
                        (clientFilter !== 'all' || categoryFilter !== 'all' || modelFilter !== 'all' || specFilterKey) 
                        ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/50 text-white font-bold' 
                        : 'bg-white/5 border-white/10 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10'
                    }`}
                >
                    <Filter size={18} />
                    <span className="hidden md:inline">Filters</span>
                    {(clientFilter !== 'all' || categoryFilter !== 'all' || modelFilter !== 'all' || specFilterKey) && (
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black text-[10px] font-black ml-1">
                            {[clientFilter !== 'all', categoryFilter !== 'all', modelFilter !== 'all', !!specFilterKey].filter(Boolean).length}
                        </span>
                    )}
                </button>
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
                             <tr><td colSpan={7} className="p-16">
                               <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
                                 <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 relative">
                                   <div className="absolute inset-0 rounded-full border border-[var(--color-primary)]/20 animate-ping opacity-20"></div>
                                   <Search size={32} className="text-[var(--color-primary)] relative z-10" />
                                 </div>
                                 <h3 className="text-xl font-bold text-white mb-2">No hardware found</h3>
                                 <p className="text-[var(--color-text-muted)] mb-6">
                                   We couldn&apos;t find any products matching your current filters. Try adjusting your search or clear filters to see all inventory.
                                 </p>
                                 <div className="flex gap-3">
                                   <button 
                                     onClick={() => {
                                        setSearch(""); setDebouncedSearch("");
                                        setCategoryFilter('all');
                                        setClientFilter('all'); setModelFilter('all');
                                        setSpecFilterKey(''); setSpecFilterValue('');
                                     }} 
                                     className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm"
                                   >
                                     Clear Filters
                                   </button>
                                   <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-black rounded-lg transition-colors font-bold text-sm">
                                     Add Product
                                   </button>
                                 </div>
                               </div>
                             </td></tr>
                         ) : (
                                 currentItems.map((product) => (
                                     <tr key={product.id}
                                         className={`group hover:bg-white/5 transition-colors ${selectedIds.has(product.id) ? 'bg-[var(--color-primary)]/5' : ''}`}
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
                                         <td className="p-3 align-middle relative">
                                             <button
                                               onClick={() => setActiveStatusToggleId(activeStatusToggleId === product.id ? null : product.id)}
                                               className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap transition-all ${
                                                   product.status === 'available' ? 'text-green-400 bg-green-400/5 border-green-400/20 hover:bg-green-400/10 cursor-pointer' :
                                                   product.status === 'rented' ? 'text-blue-400 bg-blue-400/5 border-blue-400/20 hover:bg-blue-400/10 cursor-pointer' :
                                                   product.status === 'maintenance' ? 'text-orange-400 bg-orange-400/5 border-orange-400/20 hover:bg-orange-400/10 cursor-pointer' :
                                                   product.status === 'retired' ? 'text-red-400 bg-red-400/5 border-red-400/20 hover:bg-red-400/10 cursor-pointer' :
                                                   'text-gray-400 bg-gray-400/5 border-gray-400/20 cursor-pointer hover:bg-gray-400/10'
                                               }`}
                                               title='Click to change status'
                                             >
                                                 {product.status}
                                                 <ChevronDown size={10} className={`transition-transform duration-200 ${activeStatusToggleId === product.id ? 'rotate-180' : ''}`} />
                                             </button>
                                             
                                             {activeStatusToggleId === product.id && (
                                                <div className="absolute top-full mt-1 left-3 z-[100] bg-[#1a1c23] border border-white/10 rounded-lg shadow-2xl overflow-hidden py-1 w-36">
                                                    {['available', 'rented', 'maintenance', 'retired'].map((s) => (
                                                        <button 
                                                            key={s} 
                                                            onClick={(e) => { e.stopPropagation(); handleQuickStatusToggle(product, s); }}
                                                            className={`w-full text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${s === product.status ? 'bg-white/5 text-white' : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                                s === 'available' ? 'bg-green-400' : 
                                                                s === 'rented' ? 'bg-blue-400' : 
                                                                s === 'maintenance' ? 'bg-orange-400' : 'bg-red-400'
                                                            }`}></div>
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                             )}
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
                                                  <button onClick={() => setViewDetailsId(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-blue-400 transition-colors shrink-0" title="View Details">
                                                      <Info size={15} />
                                                  </button>
                                                  <button onClick={() => handleEdit(product)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors shrink-0" title="Edit Product">
                                                      <Edit size={15} />
                                                  </button>
                                                  <button onClick={() => setShowMaintenanceModal(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-orange-400 transition-colors shrink-0" title="Mark as Maintenance">
                                                      <Wrench size={15} />
                                                  </button>
                                                  <button onClick={() => handleShowHistory(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-blue-400 transition-colors shrink-0" title="Assignment History">
                                                      <History size={15} />
                                                  </button>
                                                  <button onClick={() => setBarcodeProductId(product.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-purple-400 transition-colors shrink-0" title="Show Barcode">
                                                      <Barcode size={15} />
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
                    <div className="flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-xl bg-white/5 mx-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 relative">
                            <div className="absolute inset-0 rounded-full border border-[var(--color-primary)]/20 animate-ping opacity-20"></div>
                            <Search size={24} className="text-[var(--color-primary)] relative z-10" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No hardware found</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                            Adjust filters or add a new product.
                        </p>
                        <div className="flex flex-col w-full gap-2">
                            <button 
                                onClick={() => {
                                    setSearch(""); setDebouncedSearch("");
                                    setCategoryFilter('all');
                                    setClientFilter('all'); setModelFilter('all');
                                    setSpecFilterKey(''); setSpecFilterValue('');
                                }} 
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm"
                            >
                                Clear Filters
                            </button>
                            <button onClick={() => setShowForm(true)} className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-black rounded-lg transition-colors font-bold text-sm">
                                Add Product
                            </button>
                        </div>
                    </div>
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
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveStatusToggleId(activeStatusToggleId === product.id ? null : product.id) }}
                                                    className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border transition-all ${
                                                        product.status === 'available' ? 'text-green-400 bg-green-400/5 border-green-400/20 hover:bg-green-400/10' :
                                                        product.status === 'rented' ? 'text-blue-400 bg-blue-400/5 border-blue-400/20 hover:bg-blue-400/10' :
                                                        product.status === 'maintenance' ? 'text-orange-400 bg-orange-400/5 border-orange-400/20 hover:bg-orange-400/10' :
                                                        product.status === 'retired' ? 'text-red-400 bg-red-400/5 border-red-400/20 hover:bg-red-400/10' :
                                                        'text-gray-400 bg-gray-400/5 border-gray-400/20 hover:bg-gray-400/10'
                                                    }`}
                                                >
                                                    {product.status}
                                                    <ChevronDown size={10} className={`transition-transform duration-200 ${activeStatusToggleId === product.id ? 'rotate-180' : ''}`} />
                                                </button>

                                                {activeStatusToggleId === product.id && (
                                                    <div className="absolute top-full mt-1 right-0 z-[100] bg-[#1a1c23] border border-white/10 rounded-lg shadow-2xl overflow-hidden py-1 w-36">
                                                        {['available', 'rented', 'maintenance', 'retired'].map((s) => (
                                                            <button 
                                                                key={s} 
                                                                onClick={(e) => { e.stopPropagation(); handleQuickStatusToggle(product, s); }}
                                                                className={`w-full text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${s === product.status ? 'bg-white/5 text-white' : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'}`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                                    s === 'available' ? 'bg-green-400' : 
                                                                    s === 'rented' ? 'bg-blue-400' : 
                                                                    s === 'maintenance' ? 'bg-orange-400' : 'bg-red-400'
                                                                }`}></div>
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
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
        {/* ─── Barcode Modal ─── */}
        {barcodeProductId && (() => {
          const p = products.find(x => x.id === barcodeProductId);
          return p ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setBarcodeProductId(null)}>
              <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-8 max-w-xs w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                <p className="text-[var(--color-text-muted)] text-xs mb-5">{p.asset_id || p.id}</p>
                <div className="bg-white rounded-xl p-4 mx-auto w-fit mb-5">
                  <div className="w-40 h-16 bg-black flex flex-col justify-between p-1">
                      {/* Placeholder Barcode visual */}
                      <div className="w-full h-full flex items-center justify-between opacity-80">
                         {Array.from({length: 20}).map((_, i) => (
                             <div key={i} className={`h-full bg-white ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'}`}></div>
                         ))}
                      </div>
                  </div>
                </div>
                <div className="text-left text-xs font-mono text-[var(--color-text-muted)] bg-black/20 rounded-xl p-3 mb-4">
                  <p className="text-white font-bold mb-1">Asset Info</p>
                  <p>Name: {p.name}</p>
                  {p.asset_id && <p>ID: {p.asset_id}</p>}
                  <p>SN: {p.serial_number}</p>
                  <p>Status: {p.status}</p>
                </div>
                <button onClick={() => setBarcodeProductId(null)} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Close</button>
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

        {/* ─── CSV Import Drag & Drop Modal ─── */}
        {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowImportModal(false)}>
                <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Upload size={20} className="text-[var(--color-primary)]" /> Import Data</h2>
                        <button onClick={() => setShowImportModal(false)} title="Close" className="text-[var(--color-text-muted)] hover:text-white transition-colors"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 p-4 rounded-xl">
                            <div>
                                <h4 className="text-white font-semibold text-sm">Download Template</h4>
                                <p className="text-[var(--color-text-muted)] text-xs mt-1">Use our template to ensure your CSV has the correct headers.</p>
                            </div>
                            <button onClick={downloadSampleCsv} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 whitespace-nowrap">
                                <Download size={16} /> Get Template
                            </button>
                        </div>

                        <div 
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all bg-black/20 ${
                                dragActive ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-white/10 hover:border-white/20"
                            }`}
                        >
                            <input ref={csvInputRef} type="file" accept=".csv" className="hidden" title="Import CSV" onChange={handleCsvImport} />
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'bg-white/5 text-[var(--color-text-muted)]'}`}>
                                <FileSpreadsheet size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Drag & drop your CSV file here</h3>
                            <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-sm text-center">or browse from your computer. Make sure you are using the correct column layouts.</p>
                            
                            <button disabled={isImporting} onClick={() => csvInputRef.current?.click()} className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 font-medium">
                                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                {isImporting ? 'Processing File...' : 'Browse Files'}
                            </button>
                        </div>
                        
                        <div className="mt-6 bg-white/5 rounded-xl p-4 text-xs text-[var(--color-text-muted)]">
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Required columns:</strong> <code className="bg-black/40 px-1 py-0.5 rounded ml-1">Name</code></li>
                                <li><strong>Supported status values:</strong> available, rented, maintenance, retired</li>
                                <li>Dynamic specification columns are currently <strong>not</strong> supported via bulk import.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ─── Filter Side Drawer ─── */}
        {showFilterDrawer && (
            <>
                <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setShowFilterDrawer(false)} />
                <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[var(--color-surface)] border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                            <Filter size={20} className="text-[var(--color-primary)]" />
                            Advanced Filters
                        </div>
                        <button onClick={() => setShowFilterDrawer(false)} title="Close Filters" className="text-[var(--color-text-muted)] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 block">Filter by Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Currently using a combined client filter to handle status conceptually - extending would require more state. Using existing states for UI presentation only */}
                                <div className="p-3 border border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 rounded-xl text-white text-sm font-medium flex items-center justify-between cursor-pointer">
                                    All Statuses <CheckSquare size={16} className="text-[var(--color-primary)]" />
                                </div>
                                <div className="p-3 border border-white/10 bg-white/5 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:border-white/20 transition-colors text-sm font-medium cursor-pointer">
                                    Available Only
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 block">Category</label>
                            <select 
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]/50"
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                                aria-label="Filter by Category"
                            >
                                <option value="all">Any Category</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 block">Client / Assignment</label>
                            <select 
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]/50"
                                value={clientFilter}
                                onChange={(e) => { setClientFilter(e.target.value); setCurrentPage(1); }}
                                aria-label="Filter by Client"
                            >
                                <option value="all">Any Client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 block">Hardware Model</label>
                            <select 
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]/50"
                                value={modelFilter}
                                onChange={(e) => { setModelFilter(e.target.value); setCurrentPage(1); }}
                                aria-label="Filter by Model"
                            >
                                <option value="all">Any Model</option>
                                {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 block flex items-center gap-2">
                                <Cpu size={14} /> Specification Search
                            </label>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-[var(--color-text-muted)] mb-1 block">Spec Property (ex. RAM)</span>
                                    <input 
                                        type="text" 
                                        title="Specification Key"
                                        placeholder="Spec Key"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50"
                                        value={specFilterKey}
                                        onChange={(e) => { setSpecFilterKey(e.target.value); if(!e.target.value) setSpecFilterValue(""); setCurrentPage(1); }}
                                    />
                                </div>
                                <div>
                                    <span className="text-xs text-[var(--color-text-muted)] mb-1 block">Property Value (ex. 16GB)</span>
                                    <input 
                                        type="text" 
                                        disabled={!specFilterKey}
                                        title="Specification Value"
                                        placeholder="Spec Value"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]/50 disabled:opacity-50"
                                        value={specFilterValue}
                                        onChange={(e) => { setSpecFilterValue(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 border-t border-white/5 bg-white/5">
                        <button 
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                            onClick={() => {
                                setClientFilter('all'); setCategoryFilter('all'); setModelFilter('all'); setSpecFilterKey(''); setSpecFilterValue('');
                            }}
                        >
                            Reset Defaults
                        </button>
                    </div>
                </div>
            </>
        )}

        {/* ─── View Details Slide Over ─── */}
        {viewDetailsId && (() => {
            const p = products.find(x => x.id === viewDetailsId);
            return p ? (
            <>
                <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setViewDetailsId(null)} />
                <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[600px] bg-[var(--color-surface)] border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-white line-clamp-1">{p.name}</h2>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${
                                    p.status === 'available' ? 'text-green-400 bg-green-400/5 border-green-400/20' :
                                    p.status === 'rented' ? 'text-blue-400 bg-blue-400/5 border-blue-400/20' :
                                    p.status === 'maintenance' ? 'text-orange-400 bg-orange-400/5 border-orange-400/20' :
                                    'text-[var(--color-text-muted)] bg-white/5 border-white/20'
                                }`}>
                                    {p.status}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)] font-mono">{p.asset_id || p.id} • SN: {p.serial_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setViewDetailsId(null); handleEdit(p); }} className="text-white bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] hover:text-black p-2 rounded-lg transition-colors" title="Edit Product">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => setViewDetailsId(null)} title="Close" className="text-[var(--color-text-muted)] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Status/Assignment Banner */}
                        {p.status === 'rented' && p.current_client_id && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Package size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-blue-400 font-bold mb-1">Currently Rented</h4>
                                    <p className="text-sm text-white mb-2">Assigned to: <span className="font-semibold">{p.profiles?.full_name || 'Unknown Client'}</span></p>
                                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5"><History size={12} /> Since {p.assigned_date ? new Date(p.assigned_date).toLocaleDateString() : 'Unknown date'}</p>
                                </div>
                            </div>
                        )}
                        
                        {p.status === 'maintenance' && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                    <Wrench size={20} className="text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="text-orange-400 font-bold mb-1">Under Maintenance</h4>
                                    {p.description && p.description.includes('[MAINTENANCE]') && (
                                        <p className="text-sm text-white">{p.description.replace('[MAINTENANCE]', '').trim()}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Core Details Grid */}
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Category</h5>
                                <p className="text-sm text-white font-medium">{p.category || 'Uncategorized'}</p>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Brand</h5>
                                <p className="text-sm text-white font-medium">{p.brand || '—'}</p>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Model</h5>
                                <p className="text-sm text-white font-medium">{p.model || '—'}</p>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Registered On</h5>
                                <p className="text-sm text-white font-medium">{new Date(p.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {p.description && !p.description.includes('[MAINTENANCE]') && (
                            <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Description / Notes</h5>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-[var(--color-text-muted)] whitespace-pre-wrap">
                                    {p.description}
                                </div>
                            </div>
                        )}

                        {/* Specifications Table */}
                        {p.specifications && Object.keys(p.specifications).length > 0 && (
                            <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Hardware Specifications</h5>
                                <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                                    {Object.entries(p.specifications).map(([key, value]) => (
                                        <div key={key} className="flex flex-col sm:flex-row sm:items-center py-3 px-4 px-4 hover:bg-white/5 transition-colors">
                                            <span className="text-xs text-[var(--color-text-muted)] w-1/3 shrink-0">{key}</span>
                                            <span className="text-sm text-white font-medium mt-1 sm:mt-0">{value as string}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Quick Actions Footer Space */}
                        <div className="h-6"></div>
                    </div>
                </div>
            </>
            ) : null;
        })()}
      </div>
  );
}
