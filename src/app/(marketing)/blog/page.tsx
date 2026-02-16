"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight, Search, Tag, FileText } from "lucide-react";

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
  image_url: string;
  created_at: string;
  blog_categories: Category;
  profiles: {
    full_name: string;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("*, blog_categories(*), profiles(full_name)")
          .eq('published', true)
          .order("created_at", { ascending: false }),
        supabase
          .from("blog_categories")
          .select("*")
          .order("name")
      ]);

      if (postsRes.data) setPosts(postsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? post.blog_categories.id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen pt-32 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-16 overflow-hidden">
        <div className="relative text-center max-w-3xl mx-auto mb-12">
            <div className="orb orb-teal w-[300px] h-[300px] top-[-50%] left-[-20%] opacity-20" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-heading)]">
                Our <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed">
                Insights, news, and expert perspectives on technology, innovation, and digital transformation.
            </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between glass-strong p-4 rounded-2xl border border-white/10 mb-12">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                <input 
                    type="text" 
                    placeholder="Search articles..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${!selectedCategory ? 'bg-[var(--color-primary)] text-black' : 'bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10'}`}
                >
                    All Posts
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-[var(--color-primary)] text-black' : 'bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-6">
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => (
                    <div key={i} className="glass h-[400px] rounded-3xl animate-pulse bg-white/5" />
                ))}
            </div>
        ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-text-muted)]">
                    <Search size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
                <p className="text-[var(--color-text-secondary)]">Try adjusting your search or filters.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group h-full">
                        <article className="glass h-full rounded-3xl overflow-hidden border border-white/5 group-hover:border-[var(--color-primary)]/50 transition-all duration-300 flex flex-col">
                            {/* Image Container */}
                            <div className="relative h-56 overflow-hidden">
                                {post.image_url ? (
                                    <Image 
                                        src={post.image_url} 
                                        alt={post.title} 
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[#0EA5E9]/20 flex items-center justify-center text-[var(--color-primary)]">
                                        <FileText size={48} className="opacity-40" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-black/60 backdrop-blur-md text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <Tag size={10} /> {post.blog_categories.name}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-[var(--color-text-muted)] text-xs mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><User size={12} /> {post.profiles?.full_name}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-[var(--color-primary)] text-sm font-bold group-hover:gap-2 transition-all">
                                    Read Article <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        )}
      </section>
    </main>
  );
}
