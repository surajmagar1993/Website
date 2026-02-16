"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Edit2, X, Save, CheckCircle, AlertCircle, FileText, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published: boolean;
  category_id: string;
  author_id: string;
  created_at: string;
  blog_categories?: Category;
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    published: false,
    categoryId: "",
  });

  const fetchData = useCallback(async () => {
    const [postsRes, catsRes] = await Promise.all([
      supabase.from("blog_posts").select("*, blog_categories(*)").order("created_at", { ascending: false }),
      supabase.from("blog_categories").select("*").order("name")
    ]);
    
    if (postsRes.data) setPosts(postsRes.data);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const openModal = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        imageUrl: post.image_url || "",
        published: post.published,
        categoryId: post.category_id || "",
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        imageUrl: "",
        published: false,
        categoryId: categories[0]?.id || "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPost(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.categoryId) {
      setNotification({ type: 'error', message: "Title, Slug, and Category are required." });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setNotification({ type: 'error', message: "User not authenticated" });
      return;
    }

    const payload = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      image_url: formData.imageUrl,
      published: formData.published,
      category_id: formData.categoryId,
      author_id: user.id,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingPost) {
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", editingPost.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("blog_posts")
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      setNotification({ type: 'error', message: error.message });
    } else {
      setNotification({ type: 'success', message: "Post saved successfully!" });
      closeModal();
      fetchData();
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", deleteConfirm);
    if (error) {
      setNotification({ type: 'error', message: error.message });
    } else {
      setNotification({ type: 'success', message: "Post deleted successfully" });
      fetchData();
    }
    setDeleteConfirm(null);
    setTimeout(() => setNotification(null), 3000);
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
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Manage Blog</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Write and publish articles for your website</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Plus size={20} /> Create New Post
          </button>
        </div>

        {/* Notification */}
        {notification && (
            <div className={`fixed bottom-8 right-8 flex items-center gap-2 px-6 py-4 rounded-xl shadow-2xl z-50 text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {notification.message}
            </div>
        )}

        {/* Posts List */}
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
            {loading ? (
                <div className="p-12 text-center text-[var(--color-text-muted)]">Loading blog posts...</div>
            ) : posts.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-text-muted)]">
                        <FileText size={32} />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">No blog posts found</p>
                    <p className="text-[var(--color-text-muted)]">Click &quot;Create New Post&quot; to write your first article.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[var(--color-text-muted)] uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Post Details</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 bg-white/5 rounded-lg border border-white/10 overflow-hidden flex-shrink-0">
                                                {post.image_url ? (
                                                    <div className="relative w-full h-full">
                                                        <Image 
                                                            src={post.image_url} 
                                                            alt={post.title} 
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium mb-1 line-clamp-1">{post.title}</div>
                                                <div className="text-[var(--color-text-muted)] text-xs font-mono">/{post.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-[var(--color-text-secondary)]">
                                            {post.blog_categories?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {post.published ? (
                                            <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold uppercase tracking-wider">
                                                <Eye size={14} /> Published
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-orange-400 text-xs font-bold uppercase tracking-wider">
                                                <EyeOff size={14} /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-[var(--color-text-muted)] text-sm">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openModal(post)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit Post"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirm(post.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete Post"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {editingPost ? 'Edit Blog Post' : 'Create New Post'}
                    </h2>
                    <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Close">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Post Content */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    placeholder="Post Title"
                                    value={formData.title}
                                    onChange={e => {
                                        const title = e.target.value;
                                        setFormData({
                                            ...formData, 
                                            title,
                                            slug: editingPost ? formData.slug : generateSlug(title)
                                        });
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Slug (URL)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    placeholder="post-url-slug"
                                    value={formData.slug}
                                    onChange={e => setFormData({...formData, slug: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Excerpt</label>
                                <textarea 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none min-h-[100px]"
                                    placeholder="Short summary of the post..."
                                    value={formData.excerpt}
                                    onChange={e => setFormData({...formData, excerpt: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Content (Markdown)</label>
                                <textarea 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none min-h-[250px]"
                                    placeholder="Write your post content here..."
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Right Column: Settings & Metadata */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Category</label>
                                <select 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none appearance-none"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                    aria-label="Category"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id} className="bg-[var(--color-surface)]">{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold ml-1">Featured Image</label>
                                <ImageUpload 
                                    label="Featured Image" 
                                    value={formData.imageUrl} 
                                    onChange={(url) => setFormData({...formData, imageUrl: url})}
                                    folder="blog"
                                />
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white font-medium">Publish Post</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={formData.published}
                                            onChange={e => setFormData({...formData, published: e.target.checked})}
                                            title="Published"
                                            aria-label="Published"
                                        />
                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)]">When enabled, this post will be visible to all website visitors.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                    <button 
                        onClick={closeModal}
                        className="px-6 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/10"
                    >
                        <Save size={18} /> {editingPost ? 'Update Post' : 'Publish Post'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
                <p className="text-[var(--color-text-muted)] mb-6">Are you sure you want to delete this blog post? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-white hover:bg-white/5 rounded-lg">Cancel</button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
