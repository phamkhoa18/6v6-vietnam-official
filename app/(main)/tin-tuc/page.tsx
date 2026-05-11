"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Newspaper, Search, Clock, Eye, Star, Pin, ChevronRight,
    ChevronLeft, Loader2, Tag, TrendingUp, Flame, ArrowUp,
    Calendar, BookOpen
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const CATEGORIES = [
    { key: "", label: "Tất cả", icon: BookOpen },
    { key: "news", label: "Tin tức", icon: Newspaper },
    { key: "announcement", label: "Thông báo", icon: TrendingUp },
    { key: "guide", label: "Hướng dẫn", icon: BookOpen },
    { key: "tournament", label: "Giải đấu", icon: Star },
];

function TinTucContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const urlPage = parseInt(searchParams.get("page") || "1");
    const urlCategory = searchParams.get("category") || "";
    const urlSearch = searchParams.get("q") || "";

    const [posts, setPosts] = useState<any[]>([]);
    const [pinned, setPinned] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(urlSearch);

    const updateURL = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== "1" && key !== "page") {
                params.set(key, value);
            } else if (key === "page" && value !== "1") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        if (!("page" in updates)) params.delete("page");
        router.push(`/tin-tuc?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const apiParams = new URLSearchParams({
                    page: String(urlPage),
                    limit: "12",
                });
                if (urlCategory) apiParams.set("category", urlCategory);
                if (urlSearch) apiParams.set("search", urlSearch);

                const res = await fetch(`/api/posts?${apiParams}`);
                const data = await res.json();
                if (data.success) {
                    setPosts(data.data.posts || []);
                    setPinned(data.data.pinned || []);
                    setPagination(data.data.pagination || { page: 1, total: 0, totalPages: 1 });
                }
            } catch (e) {
                console.error("Failed to load posts:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [urlPage, urlCategory, urlSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== urlSearch) updateURL({ q: searchInput });
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const timeAgo = (date: string) => {
        try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi }); } catch { return ""; }
    };

    const goToPage = (p: number) => {
        updateURL({ page: String(p) });
        window.scrollTo({ top: 300, behavior: "smooth" });
    };

    return (
        <>
            {/* Hero */}
            <section className="relative pt-28 pb-14 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7A1414] via-[#A01B1B] to-[#0F172A]" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/banner/bg-nen.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)]" />
                </div>
                <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10 text-white">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-efb-gold text-xs font-bold uppercase mb-4 backdrop-blur-sm">
                            <Newspaper className="w-3 h-3" />Tin tức
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight leading-tight mb-3">
                            Tin tức <span className="font-bold text-efb-gold">6v6 Vietnam</span>
                        </h1>
                        <p className="text-white/60 text-lg font-light max-w-lg">
                            Cập nhật mọi thông tin mới nhất về bóng đá sân 6 tại Việt Nam
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="pb-20 bg-white">
                <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
                    {/* Filters */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 -mt-6 relative z-10">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all"
                            />
                        </div>
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.key}
                                    onClick={() => updateURL({ category: cat.key })}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${urlCategory === cat.key ? "bg-white text-efb-red shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Featured / Pinned */}
                    {urlPage === 1 && pinned.length > 0 && !urlSearch && !urlCategory && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-1 h-5 rounded-full bg-efb-red" />
                                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Flame className="w-3.5 h-3.5 text-efb-red" />
                                    Tin nổi bật
                                </h2>
                            </div>
                            <div className="grid lg:grid-cols-2 gap-5">
                                {/* Main featured */}
                                <Link href={`/tin-tuc/${pinned[0].slug}`} className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        {pinned[0].coverImage ? (
                                            <img src={pinned[0].coverImage} alt={pinned[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center">
                                                <Newspaper className="w-12 h-12 text-white/30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-5 left-5 right-5 text-white">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-efb-red/90 text-white text-[10px] font-bold rounded-lg uppercase mb-2.5 backdrop-blur-sm">
                                                <Pin className="w-2.5 h-2.5" /> Ghim
                                            </span>
                                            <h3 className="text-xl lg:text-2xl font-bold leading-tight line-clamp-2 group-hover:text-efb-gold transition-colors">{pinned[0].title}</h3>
                                            {pinned[0].excerpt && (
                                                <p className="text-sm text-white/70 mt-2 line-clamp-2">{pinned[0].excerpt}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-3 text-xs text-white/50">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(pinned[0].publishedAt || pinned[0].createdAt)}</span>
                                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{pinned[0].views || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                {/* Side featured */}
                                {pinned.length > 1 && (
                                    <div className="space-y-4">
                                        {pinned.slice(1, 4).map((p: any) => (
                                            <Link key={p._id} href={`/tin-tuc/${p.slug}`} className="group flex gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-lg hover:border-transparent transition-all">
                                                <div className="w-28 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                    {p.coverImage ? (
                                                        <img src={p.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <Newspaper className="w-6 h-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-efb-red/10 text-efb-red text-[9px] font-bold rounded uppercase mb-1">
                                                        <Pin className="w-2 h-2" /> Ghim
                                                    </span>
                                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors">{p.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                                                        <span>{timeAgo(p.publishedAt || p.createdAt)}</span>
                                                        <span>•</span>
                                                        <span>{p.views || 0} lượt xem</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Posts Grid */}
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-1 h-5 rounded-full bg-efb-red" />
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            {urlCategory ? CATEGORIES.find(c => c.key === urlCategory)?.label || "Bài viết" : "Tất cả bài viết"}
                        </h2>
                        <span className="text-xs text-gray-400 ml-auto">{pagination.total} bài viết</span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
                                <Newspaper className="w-9 h-9 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1.5">Chưa có bài viết</h3>
                            <p className="text-sm text-gray-400">
                                {urlSearch ? `Không tìm thấy kết quả cho "${urlSearch}"` : "Chưa có bài viết nào"}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, i) => (
                                <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Link href={`/tin-tuc/${post.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300">
                                        <div className="relative aspect-[16/10] overflow-hidden">
                                            {post.coverImage ? (
                                                <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <Newspaper className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                            {post.isPinned && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-efb-red text-white text-[9px] font-bold rounded-lg uppercase">
                                                        <Flame className="w-2.5 h-2.5" /> Nóng
                                                    </span>
                                                </div>
                                            )}
                                            {post.isFeatured && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-efb-gold text-gray-900 text-[9px] font-bold rounded-lg uppercase">
                                                        <Star className="w-2.5 h-2.5 fill-current" /> Nổi bật
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-efb-red transition-colors">{post.title}</h3>
                                            {post.excerpt && (
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                                            )}
                                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(post.publishedAt || post.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{post.views || 0}</span>
                                                    {post.readingTime > 0 && (
                                                        <span>{post.readingTime} phút đọc</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-14 flex items-center justify-center gap-2">
                            <button
                                onClick={() => goToPage(urlPage - 1)}
                                disabled={urlPage === 1}
                                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:text-efb-red hover:border-efb-red hover:bg-red-50 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" /> Trước
                            </button>
                            <span className="text-xs text-gray-400 px-3">
                                Trang <span className="font-bold text-gray-700">{urlPage}</span> / <span className="font-bold text-gray-700">{pagination.totalPages}</span>
                            </span>
                            <button
                                onClick={() => goToPage(urlPage + 1)}
                                disabled={urlPage === pagination.totalPages}
                                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:text-efb-red hover:border-efb-red hover:bg-red-50 disabled:opacity-30 transition-all"
                            >
                                Sau <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default function TinTucPage() {
    return (
        <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>}>
            <TinTucContent />
        </Suspense>
    );
}
