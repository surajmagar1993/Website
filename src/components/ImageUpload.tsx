/**
 * ImageUpload — Drag-and-drop image uploader backed by Supabase Storage.
 * Used in admin settings (Branding tab) for logo and favicon uploads.
 */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
}

export default function ImageUpload({ label, value, onChange, bucket = "images", folder = "general" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  interface StorageFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, unknown>;
  }
  const [libraryImages, setLibraryImages] = useState<StorageFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Fetch images for the library modal
  const fetchLibraryImages = async () => {
    setLoadingLibrary(true);
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      setLibraryImages((data as StorageFile[]) || []);
    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (showLibrary) {
      fetchLibraryImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLibrary, folder]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(data.publicUrl);
    } catch (error) {
        if (error instanceof Error) {
            setError(error.message);
        } else {
            setError("An unknown error occurred");
        }
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFromLibrary = (fileName: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(`${folder}/${fileName}`);
    onChange(data.publicUrl);
    setShowLibrary(false);
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">
        {label}
      </label>
      
      <div className="border border-white/10 rounded-xl p-4 bg-black/20">
        {value ? (
          <div className="relative group w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={value} 
              alt={label} 
              className="h-32 w-auto object-contain rounded-lg border border-white/10 bg-black/40"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Upload Box */}
            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6 hover:border-[var(--color-primary)]/50 transition-colors group cursor-pointer">
                <input
                  type="file"
                  title="Upload image"
                  aria-label="Upload image"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                {uploading ? (
                  <Loader2 className="animate-spin text-[var(--color-primary)] mb-2" size={24} />
                ) : (
                  <Upload className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] mb-2 transition-colors" size={24} />
                )}
                <p className="text-sm text-[var(--color-text-muted)]">
                  {uploading ? "Uploading..." : "Click to upload new image"}
                </p>
            </div>

            <div className="text-center text-xs text-[var(--color-text-muted)]">- OR -</div>

            {/* Select from Library Button */}
            <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="btn-outline w-full py-2 text-sm flex items-center justify-center gap-2"
            >
                <ImageIcon size={16} /> Select from Library
            </button>
          </div>
        )}
        
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </div>

      {/* Library Modal */}
      {showLibrary && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-white">Select Image ({folder})</h3>
                    <button onClick={() => setShowLibrary(false)} className="text-[var(--color-text-muted)] hover:text-white" aria-label="Close library" title="Close library">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loadingLibrary ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>
                    ) : libraryImages.length === 0 ? (
                        <div className="text-center py-10 text-[var(--color-text-muted)]">No images found in this folder.</div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {libraryImages.map((img) => {
                                const publicUrl = supabase.storage.from(bucket).getPublicUrl(`${folder}/${img.name}`).data.publicUrl;
                                return (
                                    <button
                                        key={img.id}
                                        type="button"
                                        onClick={() => handleSelectFromLibrary(img.name)}
                                        className="group relative aspect-square bg-black/40 rounded-lg border border-white/10 overflow-hidden hover:border-[var(--color-primary)]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={publicUrl} alt={img.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Check className="text-white" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
      )}
    </div>
  );
}
