"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { Loader2, Trash2, Upload, Folder, Image as ImageIcon, Search, CheckCircle, AlertCircle } from "lucide-react";

export default function MediaLibraryPage() {
  interface FileObject {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, unknown>;
  }

  const [images, setImages] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const folders = ["general", "services", "clients", "projects"];

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from("images").list(selectedFolder, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) throw error;
      setImages((data as FileObject[]) || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      logger.error("MediaLibrary: Error fetching images", error);
    } finally {
      setLoading(false);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
      console.log("Processing files:", files.length);
      setUploading(true);
      setNotification(null);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `${selectedFolder}/${fileName}`;

          console.log(`Uploading ${file.name} to ${filePath}...`);
          const { data, error } = await supabase.storage.from("images").upload(filePath, file);

          if (error) {
              console.error(`Error uploading ${file.name}:`, error);
              logger.error(`MediaLibrary: Upload failed for ${file.name}`, error);
              errorCount++;
          } else {
              console.log(`Upload success for ${file.name}:`, data);
              successCount++;
          }
      }

      console.log(`Upload finished. Success: ${successCount}, Error: ${errorCount}`);
      setUploading(false);
      
      // Refresh images immediately
      await fetchImages();

      if (errorCount > 0) {
          const msg = `Uploaded ${successCount} images. Failed: ${errorCount}.`;
          console.log("Setting error notification:", msg);
          setNotification({ type: 'error', message: msg });
      } else if (successCount > 0) {
          const msg = `Successfully uploaded ${successCount} image(s) to ${selectedFolder}.`;
          console.log("Setting success notification:", msg);
          setNotification({ type: 'success', message: msg });
      } else {
          console.log("No files uploaded?");
      }
      
      // Clear notification after 5s
      setTimeout(() => setNotification(null), 5000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        await processFiles(e.target.files);
        // Reset input value to allow selecting the same file again
        e.target.value = ''; 
    }
  };

  const handleDeleteClick = (fileName: string) => {
    setDeleteConfirm(fileName);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const fileName = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const { error } = await supabase.storage.from("images").remove([`${selectedFolder}/${fileName}`]);
      if (error) throw error;
      setImages(images.filter((img) => img.name !== fileName));
      setNotification({ type: 'success', message: 'Image deleted successfully' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
       logger.error(`MediaLibrary: Delete failed for ${fileName}`, error);
       if (error instanceof Error) {
            setNotification({ type: 'error', message: error.message });
        } else {
            setNotification({ type: 'error', message: "An unknown error occurred" });
        }
        setTimeout(() => setNotification(null), 5000);
    }
  };

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white">Media Library</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
             Viewing folder: <span className="text-[var(--color-primary)] font-bold uppercase tracking-wider">{selectedFolder}</span>
          </p>
        </div>
        
        <div className="relative">
          <label className="btn-primary cursor-pointer flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/20 hover:opacity-90 transition-opacity">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            Upload to {selectedFolder}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar Folders */}
        <aside className="glass p-4 rounded-xl h-fit space-y-1">
          <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 px-2">Folders</h3>
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                selectedFolder === folder
                  ? "bg-[var(--color-primary)]/20 text-white border border-[var(--color-primary)]/30 font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Folder size={18} className={selectedFolder === folder ? "text-[var(--color-primary)]" : ""} />
              <span className="capitalize">{folder}</span>
              {selectedFolder === folder && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />}
            </button>
          ))}
        </aside>

        {/* Image Grid */}
        <div className="space-y-6">
          
          {/* Status Notification */}
          {notification && (
             <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                 notification.type === 'success' 
                 ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                 : 'bg-red-500/10 border-red-500/20 text-red-400'
             }`}>
                 {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                 {notification.message}
             </div>
          )}

          {/* Drag & Drop Zone */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive 
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white scan-line-active" 
                : "border-white/10 hover:border-[var(--color-primary)]/50 hover:bg-white/5 text-[var(--color-text-muted)]"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
             <input
              type="file"
              accept="image/*"
              multiple
              title="Upload images"
              aria-label="Upload images"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleUpload}
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                {uploading ? (
                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                ) : (
                    <Upload size={32} className={dragActive ? "text-[var(--color-primary)]" : "opacity-50"} />
                )}
                <div>
                    <p className="font-bold text-lg text-white">
                        {uploading ? "Uploading files..." : `Drop files to upload to "${selectedFolder}"`}
                    </p>
                    <p className="text-sm opacity-70 mt-1">
                        {uploading ? "Please wait" : "or click to select files"}
                    </p>
                </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input 
              type="text" 
              title="Search images"
              aria-label="Search images"
              placeholder={`Search in ${selectedFolder}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)] border-2 border-dashed border-white/10 rounded-xl bg-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon size={32} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-white mb-1">No images in &quot;{selectedFolder}&quot;</p>
              <p className="text-sm">Upload an image to this folder to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img) => {
                const publicUrl = supabase.storage.from("images").getPublicUrl(`${selectedFolder}/${img.name}`).data.publicUrl;
                return (
                  <div key={img.id} className="group relative aspect-square bg-black/40 rounded-xl border border-white/10 overflow-hidden hover:border-[var(--color-primary)]/50 transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                       <p className="text-xs text-white truncate w-full text-center px-2">{img.name}</p>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(publicUrl);
                             alert("URL copied to clipboard!");
                           }}
                           className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                           title="Copy URL"
                         >
                           <Upload size={16} className="rotate-90" />
                         </button>
                         <button 
                           onClick={() => handleDeleteClick(img.name)}
                           className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                           title="Delete"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

       {/* Delete Confirmation Modal */}
       {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div className="glass p-8 rounded-2xl w-full max-w-sm border border-red-500/30 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">Delete Image?</h2>
                <p className="text-[var(--color-text-muted)] mb-6">
                    Are you sure you want to delete <span className="text-white font-mono">{deleteConfirm}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={() => setDeleteConfirm(null)} 
                        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={confirmDelete} 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/20"
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
