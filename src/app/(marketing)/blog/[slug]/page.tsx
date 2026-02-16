"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Tag, Facebook, Twitter, Linkedin } from "lucide-react";

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
  created_at: string;
  blog_categories: Category;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(*), profiles(full_name, avatar_url)")
        .eq("slug", resolvedParams.slug)
        .eq("published", true)
        .single();

      if (data) setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center">
        <div className="w-full max-w-4xl px-6 space-y-8 animate-pulse">
            <div className="h-10 bg-white/5 rounded-xl w-3/4" />
            <div className="h-64 bg-white/5 rounded-3xl" />
            <div className="space-y-4">
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
            </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-40 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Post Not Found</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">The article you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.</p>
        <Link href="/blog" className="btn-primary">Back to Blog</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="orb orb-teal w-[600px] h-[600px] top-[-10%] right-[-10%] opacity-10" />
      <div className="orb orb-blue w-[400px] h-[400px] bottom-[10%] left-[-10%] opacity-10" />

      <article className="container mx-auto max-w-4xl px-6 relative z-10">
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-12">
            <ArrowLeft size={16} /> Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-[var(--color-primary)] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Tag size={10} /> {post.blog_categories.name}
                </span>
                <span className="text-[var(--color-text-muted)] text-sm">•</span>
                <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 font-[family-name:var(--font-heading)] leading-tight">
                {post.title}
            </h1>
            
            {/* Author */}
            <div className="flex items-center justify-between py-6 border-y border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[#0EA5E9] flex items-center justify-center text-white font-bold ring-2 ring-white/10">
                        {post.profiles.full_name?.charAt(0) || <User size={20} />}
                    </div>
                    <div>
                        <div className="text-white font-bold">{post.profiles.full_name}</div>
                        <div className="text-[var(--color-text-muted)] text-xs">Expert Writer @ Genesoft</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all" title="Share on Facebook">
                        <Facebook size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all" title="Share on X">
                        <Twitter size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all" title="Share on LinkedIn">
                        <Linkedin size={18} />
                    </button>
                </div>
            </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
            <div className="relative mb-16 rounded-[40px] overflow-hidden shadow-2xl border border-white/10 aspect-video">
                <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-20 text-[var(--color-text-secondary)] leading-relaxed space-y-6">
            {post.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </div>

        {/* CTA Section */}
        <div className="glass-strong p-8 md:p-12 rounded-[2rem] text-center border border-white/10 relative overflow-hidden">
            <div className="orb orb-teal w-[200px] h-[200px] top-[-50%] left-[-20%] opacity-20" />
            <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Want more insights like this?</h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-xl mx-auto relative z-10">Subscribe to our newsletter and stay updated with the latest trends in technology and digital solutions.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button className="btn-primary whitespace-nowrap">Subscribe Now</button>
            </div>
        </div>
      </article>
    </main>
  );
}
