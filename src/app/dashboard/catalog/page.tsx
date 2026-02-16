"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Laptop, Monitor, FileSpreadsheet, FileText, ArrowLeft, ChevronLeft, ChevronRight, AlertCircle, Package, X, RefreshCw, Paperclip, Loader2 } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { sendTicketReceiptEmail } from "@/actions/tickets";
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
  assigned_date?: string;
  replacement_date?: string;
  return_date?: string;
}


export default function ClientCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Laptop' | 'Desktop'>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action State (Ported from AssignmentsList)
  const [activeAction, setActiveAction] = useState<{ type: 'issue' | 'return', product: Product } | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [replacementRequested, setReplacementRequested] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { profile, loading: profileLoading } = useProfile();

  const fetchProducts = useCallback(async () => {
    if (!profile) return;
    setLoading(true);

    // Fetch Client's Rented Products
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq('current_client_id', profile.id)
      .eq('status', 'rented')
      .order("name", { ascending: true });

    if (data) setProducts(data);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    if (!profileLoading) {
      fetchProducts();
    }
  }, [profileLoading, fetchProducts]);

  // Filtering Logic
  const filteredProducts = products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' 
        ? true 
        : (product.name + product.model).toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
        setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

// Helper function to force download removed in favor of file-saver

  // Robust download helper
  const downloadFile = (blob: Blob, fileName: string) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay to ensure browser register
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
  };

  const exportToExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    // Removed alert to avoid blocking UI

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
            AssignedDate: p.assigned_date ? new Date(p.assigned_date).toLocaleDateString() : 'N/A',
            ReturnDate: p.return_date ? new Date(p.return_date).toLocaleDateString() : 'N/A',
            ReplacementDate: p.replacement_date ? new Date(p.replacement_date).toLocaleDateString() : 'N/A',
            RegisteredDate: new Date(p.created_at).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hardware_On_Rent");
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        downloadFile(blob, `Genesoft_Rentals_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        
        doc.text("Genesoft Infotech - Hardware On Rent", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Client: ${products.length > 0 ? 'Verified Client' : ''}`, 14, 35);
        
        autoTable(doc, {
            head: [['Name', 'Model', 'Category', 'Serial', 'Assigned', 'Return', 'Replacement']],
            body: filteredProducts.map(p => [
                p.name, 
                p.model, 
                p.category || 'N/A', 
                p.serial_number,
                p.assigned_date ? new Date(p.assigned_date).toLocaleDateString() : '-',
                p.return_date ? new Date(p.return_date).toLocaleDateString() : '-',
                p.replacement_date ? new Date(p.replacement_date).toLocaleDateString() : '-'
            ]),
            startY: 45,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 133, 244] }
        });

        const pdfBlob = doc.output('blob');
        downloadFile(pdfBlob, `Genesoft_Rentals_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsExporting(false);
        
    } catch (error) {
        console.error("Export to PDF failed:", error);
        alert(`Failed to export to PDF: ${(error as Error).message}`);
        setIsExporting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
      if (e) {
          e.preventDefault();
          e.stopPropagation();
      }
      if (!activeAction || !description || submitting) return;
      
      setSubmitting(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
              const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
              
              if (profile) {
                  let attachmentUrl = null;

                  if (attachment) {
                      setUploading(true);
                      const fileExt = attachment.name.split('.').pop();
                      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
                      
                      const { error: uploadError } = await supabase.storage
                          .from('tickets')
                          .upload(fileName, attachment);

                      if (uploadError) {
                          console.error("Upload error:", uploadError);
                          alert("Failed to upload attachment. Proceeding without it.");
                      } else {
                          const { data: { publicUrl } } = supabase.storage
                              .from('tickets')
                              .getPublicUrl(fileName);
                          attachmentUrl = publicUrl;
                      }
                      setUploading(false);
                  }

                  const subject = activeAction.type === 'issue' 
                      ? `Issue Report: ${activeAction.product.name} (${activeAction.product.serial_number})`
                      : `${replacementRequested ? 'Replacement Request' : 'Return Request'}: ${activeAction.product.name} (${activeAction.product.serial_number})`;
                           
                  const { error } = await supabase.from('tickets').insert({
                      client_id: profile.id,
                      product_id: activeAction.product.id,
                      subject: subject,
                      description: description,
                      priority: priority,
                      replacement_requested: activeAction.type === 'return' ? replacementRequested : false,
                      status: 'open',
                      attachments: attachmentUrl ? [attachmentUrl] : []
                  });

                  if (!error) {
                      // Send automated receipt email
                      sendTicketReceiptEmail(user.email!, subject, description).catch(console.error);
                      
                      setSuccess(true);
                      setTimeout(() => {
                          setActiveAction(null);
                          setDescription("");
                          setPriority('medium');
                          setReplacementRequested(false);
                          setAttachment(null);
                          setSuccess(false);
                      }, 2000);
                  } else {
                      console.error("Supabase Error Full:", error);
                      alert(`Failed to submit ticket: ${error.message}${error.details ? ' - ' + error.details : ''}`);
                  }
              }
          }
      } catch (err) {
          console.error("Submission error:", err);
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
                <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white mb-2 transition-colors">
                   <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Hardware On Rent</h1>
                <p className="text-[var(--color-text-muted)]">Manage and view your currently rented assets.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={exportToExcel}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all font-medium text-sm disabled:opacity-50"
                >
                    <FileSpreadsheet size={18} /> {isExporting ? 'Exporting...' : 'Export Excel'}
                </button>
                <button 
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm disabled:opacity-50"
                >
                    <FileText size={18} /> Export PDF
                </button>
            </div>
        </div>

        {/* Filters */}
        <div className="glass p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                <input 
                    type="text" 
                    placeholder="Search catalog..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {(['All', 'Laptop', 'Desktop'] as const).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                            categoryFilter === cat 
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                            : 'bg-white/5 text-[var(--color-text-muted)] border-white/10 hover:bg-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Table View (Minimal Style) - Desktop */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
            {loading ? (
                <div className="text-[var(--color-text-muted)] text-center py-8">Loading catalog...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-[var(--color-text-muted)] text-center py-8">No products found.</div>
            ) : (
                currentItems.map((product) => (
                    <div key={product.id} className="glass p-4 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${product.name.toLowerCase().includes('desktop') ? 'bg-blue-500/10 text-blue-400' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                                    {product.name.toLowerCase().includes('desktop') ? <Monitor size={20} /> : <Laptop size={20} />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{product.name}</div>
                                    <div className="text-xs text-[var(--color-text-muted)]">{product.model}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveAction({ type: 'issue', product }); }}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-400"
                                    aria-label="Report Issue"
                                >
                                    <AlertCircle size={18} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveAction({ type: 'return', product }); }}
                                    className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                    aria-label="Request Return"
                                >
                                    <Package size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--color-text-muted)] border-t border-white/5 pt-3">
                            <span>Serial: <span className="text-white font-mono">{product.serial_number}</span></span>
                            <span>{new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
        {/* Table View (Minimal Style) - Desktop */}
        <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                            <th className="p-3 pl-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Product</th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Serial</th>
                            <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                            <th className="p-3 pr-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[var(--color-text-muted)]">Loading catalog...</td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                             <tr>
                                <td colSpan={4} className="p-8 text-center text-[var(--color-text-muted)]">No available products found matching your criteria.</td>
                            </tr>
                        ) : (
                            currentItems.map((product) => (
                                <tr key={product.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="p-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${product.name.toLowerCase().includes('desktop') ? 'bg-blue-500/10 text-blue-400' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                                                {product.name.toLowerCase().includes('desktop') ? <Monitor size={16} /> : <Laptop size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white leading-tight">{product.name}</div>
                                                <div className="text-[10px] text-[var(--color-text-muted)]">{product.model}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm font-mono text-[var(--color-text-muted)]">
                                        {/* Masking serial number partially for privacy if needed - Removed masking for client view validity */}
                                        {product.serial_number}
                                    </td>
                                    <td className="p-3 text-xs text-[var(--color-text-muted)]">
                                        <div className="flex flex-col gap-0.5">
                                            {/* <span>Reg: {new Date(product.created_at).toLocaleDateString()}</span> */}
                                            {product.assigned_date && <span className="text-green-400">Assigned: {new Date(product.assigned_date).toLocaleDateString()}</span>}
                                            {product.return_date && <span className="text-orange-400">Return: {new Date(product.return_date).toLocaleDateString()}</span>}
                                            {product.replacement_date && <span className="text-blue-400">Replace: {new Date(product.replacement_date).toLocaleDateString()}</span>}
                                            {!product.assigned_date && !product.return_date && !product.replacement_date && <span>-</span>}
                                        </div>
                                    </td>
                                    <td className="p-3 pr-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveAction({ type: 'issue', product }); }}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Report Issue"
                                            >
                                                <AlertCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveAction({ type: 'return', product }); }}
                                                className="p-1.5 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                                title="Request Return"
                                            >
                                                <Package size={16} />
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
                            aria-label="Previous Page"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs text-[var(--color-text-muted)]">
                            Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next Page"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>

        <ModalPortal 
            isOpen={activeAction !== null} 
            onClose={() => {
                if (!submitting) {
                    setActiveAction(null);
                    setDescription("");
                    setPriority('medium');
                    setReplacementRequested(false);
                }
            }}
        >
            <div className="glass p-6 rounded-2xl border border-[var(--color-primary)]/20 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">
                        {activeAction?.type === 'issue' ? 'Report an Issue' : 'Request Return'}
                    </h3>
                    <button 
                        onClick={() => { setActiveAction(null); setDescription(""); setPriority('medium'); setReplacementRequested(false); }}
                        className="text-[var(--color-text-muted)] hover:text-white transition-colors p-1"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-[var(--color-text-muted)] text-sm mb-4">
                    {activeAction?.product.name} ({activeAction?.product.serial_number})
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {success ? (
                        <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in duration-300">
                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                                <Package size={24} />
                            </div>
                            <p className="text-white font-medium">Ticket submitted successfully!</p>
                            <p className="text-sm text-[var(--color-text-muted)]">Closing modal...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[var(--color-text-muted)] mb-2">Priority</label>
                                    <select 
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                                        title="Select Ticket Priority"
                                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                {activeAction?.type === 'return' && (
                                    <div>
                                        <label className="block text-sm text-[var(--color-text-muted)] mb-2">Action Type</label>
                                        <button
                                            type="button"
                                            onClick={() => setReplacementRequested(!replacementRequested)}
                                            className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-lg border transition-all ${
                                                replacementRequested 
                                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                                : 'bg-white/5 border-white/10 text-[var(--color-text-muted)] h-11'
                                            }`}
                                        >
                                            {replacementRequested ? <RefreshCw size={14} className="animate-spin-slow" /> : <X size={14} />}
                                            <span className="text-xs font-medium">
                                                {replacementRequested ? 'Replacement' : 'Standard Return'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Subject</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(activeAction?.type === 'issue' ? ['Hardware Issue', 'Software Error', 'Connection Problem', 'Screen Damage'] : ['Contract End', 'Upgrade Required', 'Moving Office', 'Project Finished']).map(topic => (
                                        <button 
                                            key={topic}
                                            type="button"
                                            onClick={() => setSubject(`${topic}: ${activeAction?.product.name}`)}
                                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-all"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    placeholder="Brief summary..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                                    Description {activeAction?.type === 'issue' ? '(What went wrong?)' : '(Reason for return)'}
                                </label>
                                <textarea 
                                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none"
                                    placeholder="Please provide details..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm text-[var(--color-text-muted)]">Attachment (Optional)</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 cursor-pointer transition-colors">
                                        <Paperclip size={14} />
                                        <span>Choose File</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                                            accept="image/*,.pdf"
                                        />
                                    </label>
                                    {attachment && (
                                        <div className="flex items-center gap-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-2 py-1 rounded text-[10px] text-[var(--color-primary)]">
                                            <span className="truncate max-w-[150px]">{attachment.name}</span>
                                            <button 
                                                type="button"
                                                onClick={() => setAttachment(null)}
                                                className="hover:text-white"
                                                title="Remove attachment"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-[var(--color-text-muted)] italic">Max 5MB. Images or PDF only.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setActiveAction(null); setDescription(""); setPriority('medium'); setReplacementRequested(false); setAttachment(null); }} 
                                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting || !description.trim() || uploading}
                                    className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                                >
                                    {(submitting || uploading) && <Loader2 size={16} className="animate-spin" />}
                                    {submitting ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </ModalPortal>
    </div>
  );
}
