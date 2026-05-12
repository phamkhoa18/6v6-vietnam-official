"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Newspaper, Search, Clock, Eye, ChevronRight, ChevronLeft,
    Pin, Star, Loader2, Calendar, ArrowRight, TrendingUp, Flame, Zap, Trophy,
    Filter, X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { CategoryIcon } from "@/lib/category-icons";

// Categories are strictly loaded from the API / Database

export default function NewsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [featured, setFeatured] = useState<any[]>([]);
    const [latest, setLatest] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [category, setCategory] = useState("");
    const [dbCategories, setDbCategories] = useState<any[]>([]);

    // Load categories from API
    useEffect(() => {
        fetch("/api/categories")
            .then(r => r.json())
            .then(data => { if (data.success) setDbCategories(data.data.categories || []); })
            .catch(console.error);
    }, []);

    // Helper: get category display info
    const getCategoryInfo = (post: any) => {
        const slug = post.category;
        const refId = post.categoryRef?._id || post.categoryRef;
        const found = dbCategories.find(c => c.slug === slug || c._id === refId);
        if (found) {
            return {
                label: found.name,
                color: `text-[${found.color}]`,
                bg: `bg-[${found.color}]`,
                gradient: found.gradient || "from-efb-red to-efb-red-dark",
                hexColor: found.color,
                iconName: found.icon || "Newspaper",
            };
        }
        return { label: "Tin tức", hexColor: "", iconName: "Newspaper", gradient: "from-gray-500 to-gray-600" };
    };

    useEffect(() => { loadPosts(); }, [page, category]);
    useEffect(() => {
        fetch("/api/posts?featured=true&limit=5")
            .then(r => r.json())
            .then(data => { if (data.success) setFeatured(data.data.posts); });
        fetch("/api/posts?limit=6")
            .then(r => r.json())
            .then(data => { if (data.success) setLatest(data.data.posts); });
    }, []);

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "9");
            if (category) params.set("category", category);
            if (search) params.set("search", search);
            const res = await fetch(`/api/posts?${params}`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.data.posts);
                setTotalPages(data.data.pagination.totalPages);
                setTotalPosts(data.data.pagination.total);
            }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadPosts();
    };

    const timeAgo = (date: string) => {
        try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi }); } catch { return ""; }
    };

    const heroPost = featured[0];
    const sideFeatured = featured.slice(1, 4);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-16 font-sans">
            {/* ===== Top Bar ===== */}
            <div className="bg-white border-b border-gray-100 shadow-sm relative z-20">
                <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-10">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                            <Flame className="w-3.5 h-3.5 text-efb-red flex-shrink-0 animate-pulse" />
                            <span className="text-[11px] font-medium text-efb-red uppercase tracking-normal flex-shrink-0">TIN NÓNG</span>
                            <div className="h-3 w-px bg-gray-200 mx-1.5 flex-shrink-0" />
                            {latest.slice(0, 3).map((p, i) => (
                                <Link key={p._id} href={`/tin-tuc/${p.slug}`} className="text-[11px] font-medium text-gray-500 hover:text-efb-red transition-colors whitespace-nowrap flex-shrink-0">
                                    {p.title.length > 50 ? p.title.substring(0, 50) + "..." : p.title}
                                    {i < 2 && <span className="mx-2 text-gray-200">|</span>}
                                </Link>
                            ))}
                        </div>
                        <button onClick={() => setSearchOpen(!searchOpen)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-efb-red transition-colors flex-shrink-0 group">
                            <Search className="w-4 h-4 text-gray-400 group-hover:text-efb-red" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="bg-white border-b border-gray-200 shadow-md overflow-hidden relative z-10">
                        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-4">
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm bài viết, tin tức, giải đấu..."
                                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all"
                                        autoFocus />
                                </div>
                                <button type="submit" className="h-11 px-6 bg-gradient-to-r from-efb-red to-efb-red-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-efb-red/20 transition-all">Tìm kiếm</button>
                                <button type="button" onClick={() => { setSearchOpen(false); setSearch(""); }} className="h-11 w-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== Hero Section ===== */}
            {heroPost && (
                <section className="bg-white pb-6">
                    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 pt-6">
                        <div className="grid lg:grid-cols-5 gap-5">
                            {/* Main Hero */}
                            <div className="lg:col-span-3">
                                <Link href={`/tin-tuc/${heroPost.slug}`} className="group relative block rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-[16/9] shadow-sm border border-gray-100">
                                    {heroPost.coverImage ? (
                                        <img src={heroPost.coverImage} alt={heroPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#7A1414] to-[#0F172A] flex items-center justify-center">
                                            <Trophy className="w-20 h-20 text-white/10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            {heroPost.isPinned && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-efb-red text-white text-[10px] font-medium rounded uppercase tracking-wide shadow-sm">
                                                    <Zap className="w-3 h-3 fill-white" /> NÓNG
                                                </span>
                                            )}
                                            {(() => {
                                                const hCat = getCategoryInfo(heroPost);
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${hCat.hexColor ? '' : 'bg-gradient-to-r'} ${hCat.gradient} text-white text-[10px] font-medium rounded uppercase tracking-wide shadow-sm`}
                                                        style={hCat.hexColor ? { backgroundColor: hCat.hexColor } : undefined}>
                                                        <CategoryIcon name={hCat.iconName} className="w-3 h-3" />
                                                        {hCat.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <h2 className="text-2xl lg:text-3xl font-semibold text-white leading-tight mb-2.5 group-hover:text-efb-gold transition-colors">{heroPost.title}</h2>
                                        {heroPost.excerpt && <p className="text-sm text-white/80 line-clamp-2 max-w-xl font-light">{heroPost.excerpt}</p>}
                                        <div className="flex items-center gap-4 mt-4 text-xs font-medium text-white/60">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {timeAgo(heroPost.publishedAt || heroPost.createdAt)}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/30" />
                                            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {heroPost.views || 0} lượt xem</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Side Featured */}
                            <div className="lg:col-span-2 flex flex-col gap-4">
                                {sideFeatured.map((post) => {
                                    const cat = getCategoryInfo(post);
                                    return (
                                        <Link key={post._id} href={`/tin-tuc/${post.slug}`} className="group flex gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-efb-red/20 transition-all">
                                            <div className="relative w-32 h-24 lg:w-36 lg:h-28 rounded-xl overflow-hidden flex-shrink-0">
                                                {post.coverImage ? (
                                                    <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                        <Newspaper className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                                {post.isPinned && (
                                                    <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md bg-efb-red flex items-center justify-center shadow-sm">
                                                        <Pin className="w-3 h-3 text-white fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                                                <span
                                                    className="text-[10px] font-medium uppercase tracking-wide mb-1.5 inline-block"
                                                    style={cat.hexColor ? { color: cat.hexColor } : { color: '#7A1414' }}
                                                >
                                                    {cat.label}
                                                </span>
                                                <h3 className="text-[14px] lg:text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors mb-2">{post.title}</h3>
                                                <span className="text-[11px] font-medium text-gray-400 mt-auto flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> {timeAgo(post.publishedAt || post.createdAt)}
                                                    <span className="mx-1 text-gray-200">•</span>
                                                    <Eye className="w-3 h-3" /> {post.views || 0}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== Main Content ===== */}
            <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">

                    {/* Left: Posts Grid */}
                    <div className="lg:col-span-2">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
                            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <button
                                onClick={() => { setCategory(""); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-[12px] font-medium uppercase tracking-normal transition-all whitespace-nowrap ${!category
                                    ? "bg-efb-red text-white shadow-md shadow-efb-red/20"
                                    : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300"}`}
                            >
                                Tất cả
                            </button>
                            {dbCategories.map((cat) => (
                                <button key={cat._id}
                                    onClick={() => { setCategory(cat.slug); setPage(1); }}
                                    className={`px-4 py-2 rounded-xl text-[12px] font-medium uppercase tracking-normal transition-all whitespace-nowrap flex items-center gap-1.5 ${category === cat.slug
                                        ? "text-white shadow-md"
                                        : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300"}`}
                                    style={category === cat.slug ? { backgroundColor: cat.color || "#7A1414", boxShadow: `0 4px 14px 0 ${cat.color}30` } : undefined}
                                >
                                    <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Section Title */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 rounded-full bg-efb-red" />
                                <h2 className="text-lg font-semibold text-gray-900 uppercase">
                                    {(() => {
                                        if (!category) return "Tin tức mới nhất";
                                        const found = dbCategories.find(c => c.slug === category);
                                        return found?.name || "Bài viết";
                                    })()}
                                </h2>
                            </div>
                            {totalPosts > 0 && (
                                <span className="text-[12px] font-medium text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-100">{totalPosts} bài viết</span>
                            )}
                        </div>

                        {/* Posts */}
                        {isLoading ? (
                            <div className="flex justify-center py-24">
                                <Loader2 className="w-8 h-8 animate-spin text-efb-red" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Newspaper className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-base font-medium text-gray-800 mb-1.5">Chưa có bài viết nào</h3>
                                <p className="text-sm text-gray-400">Hãy quay lại sau để xem các cập nhật mới nhất từ 6v6 Vietnam.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* First Post - Large Card */}
                                {posts.length > 0 && (() => {
                                    const first = posts[0];
                                    return (
                                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                                            <Link href={`/tin-tuc/${first.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-efb-red/30 transition-all duration-300">
                                                <div className="grid md:grid-cols-2">
                                                    <div className="relative h-60 md:h-full overflow-hidden">
                                                        {first.coverImage ? (
                                                            <img src={first.coverImage} alt={first.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                                <Trophy className="w-12 h-12 text-gray-300" />
                                                            </div>
                                                        )}
                                                        {(() => {
                                                            const fCat = getCategoryInfo(first);
                                                            return (
                                                                <div
                                                                    className={`absolute top-4 left-4 px-2.5 py-1 ${fCat.hexColor ? '' : 'bg-gradient-to-r'} ${fCat.gradient} text-white text-[10px] font-medium rounded uppercase tracking-wide inline-flex items-center gap-1.5 shadow-sm`}
                                                                    style={fCat.hexColor ? { backgroundColor: fCat.hexColor } : undefined}
                                                                >
                                                                    <CategoryIcon name={fCat.iconName} className="w-3 h-3" />
                                                                    {fCat.label}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="p-6 md:p-8 flex flex-col justify-center">
                                                        <h3 className="text-xl font-semibold text-gray-900 leading-snug mb-3 group-hover:text-efb-red transition-colors">{first.title}</h3>
                                                        {first.excerpt && <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{first.excerpt}</p>}
                                                        <div className="flex items-center gap-4 text-[12px] font-medium text-gray-400 mt-auto">
                                                            {first.author?.name && (
                                                                <div className="flex items-center gap-2">
                                                                    {first.author?.avatar ? (
                                                                        <img src={first.author.avatar} alt="" className="w-5 h-5 rounded-full" />
                                                                    ) : (
                                                                        <div className="w-5 h-5 rounded-full bg-efb-red text-white flex items-center justify-center text-[9px] font-medium">{first.author.name.charAt(0)}</div>
                                                                    )}
                                                                    <span className="text-gray-700 font-semibold">{first.author.name}</span>
                                                                </div>
                                                            )}
                                                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{timeAgo(first.publishedAt || first.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })()}

                                {/* Remaining Posts - Compact List */}
                                <div className="space-y-4">
                                    {posts.slice(1).map((post, i) => {
                                        const pCat = getCategoryInfo(post);
                                        return (
                                            <motion.div key={post._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                                <Link href={`/tin-tuc/${post.slug}`} className="group flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-efb-red/20 transition-all duration-300">
                                                    <div className="relative w-full sm:w-40 h-48 sm:h-28 rounded-xl overflow-hidden flex-shrink-0">
                                                        {post.coverImage ? (
                                                            <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                                <Newspaper className="w-8 h-8 text-gray-300" />
                                                            </div>
                                                        )}
                                                        {post.isPinned && (
                                                            <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-efb-red flex items-center justify-center shadow-sm">
                                                                <Pin className="w-3 h-3 text-white fill-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span
                                                                className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-md text-white inline-flex items-center gap-1 shadow-sm"
                                                                style={pCat.hexColor ? { backgroundColor: pCat.hexColor } : { backgroundColor: '#7A1414' }}
                                                            >
                                                                <CategoryIcon name={pCat.iconName} className="w-2.5 h-2.5" />
                                                                {pCat.label}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors mb-2">{post.title}</h3>
                                                        <div className="flex items-center gap-3 mt-auto text-[11px] font-medium text-gray-400">
                                                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{timeAgo(post.publishedAt || post.createdAt)}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                            <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {post.views || 0}</span>
                                                            {post.readingTime > 0 && <><span className="w-1 h-1 rounded-full bg-gray-200" /><span>{post.readingTime} phút đọc</span></>}
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:flex items-center justify-center w-8">
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-efb-red transition-colors" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-10 pb-6">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-efb-red hover:border-efb-red hover:bg-red-50 disabled:opacity-40 transition-all">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                            .map((p, idx, arr) => (
                                                <span key={p} className="flex items-center">
                                                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1.5 text-gray-300">···</span>}
                                                    <button onClick={() => setPage(p)}
                                                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${p === page
                                                            ? "bg-efb-red text-white shadow-md shadow-efb-red/30"
                                                            : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"}`}>
                                                        {p}
                                                    </button>
                                                </span>
                                            ))}
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-efb-red hover:border-efb-red hover:bg-red-50 disabled:opacity-40 transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Trending */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                <TrendingUp className="w-4.5 h-4.5 text-efb-red" />
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Đọc nhiều nhất</h3>
                            </div>
                            <div className="divide-y divide-gray-50/80">
                                {latest.map((post, i) => (
                                    <Link key={post._id} href={`/tin-tuc/${post.slug}`} className="group flex items-start gap-3.5 px-5 py-4 hover:bg-red-50/30 transition-colors">
                                        <span className={`text-2xl font-medium leading-none mt-0.5 flex-shrink-0 tabular-nums ${i < 3 ? "text-efb-gold" : "text-gray-200"}`}>
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors">{post.title}</h4>
                                            <span className="text-[10px] font-medium text-gray-400 mt-1.5 flex items-center gap-1.5"><Clock className="w-2.5 h-2.5" />{timeAgo(post.publishedAt || post.createdAt)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Categories Widget */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Danh mục</h3>
                            </div>
                            <div className="p-3 space-y-1">
                                {dbCategories.map((cat: any) => (
                                    <button key={cat._id}
                                        onClick={() => { setCategory(category === cat.slug ? "" : cat.slug); setPage(1); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${category === cat.slug ? "bg-red-50 text-efb-red shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient || "from-efb-red to-efb-red-dark"} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                            <CategoryIcon name={cat.icon} className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-[13px] font-medium flex-1">{cat.name}</span>
                                        {cat.postCount > 0 && (
                                            <span className="text-[10px] font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-100">{cat.postCount}</span>
                                        )}
                                        <ChevronRight className={`w-4 h-4 ${category === cat.slug ? "text-efb-red" : "text-gray-300"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags Cloud */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Tags nổi bật</h3>
                            </div>
                            <div className="p-5 flex flex-wrap gap-2">
                                {["6v6", "Bóng đá sân 6", "Giải đấu", "Siêu phủi", "Bóng đá phong trào", "Chiến thuật", "Cầu thủ", "Cập nhật", "Sự kiện", "Đội hình"].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-gray-50 text-[11px] font-medium text-gray-500 uppercase tracking-normal rounded-lg border border-gray-100 hover:bg-red-50 hover:text-efb-red hover:border-efb-red/20 transition-colors cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA Banner */}
                        <div className="bg-gradient-to-br from-efb-red to-efb-red-dark rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-efb-red/20">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-xl -translate-y-10 translate-x-10" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl translate-y-10 -translate-x-10" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                                    <Trophy className="w-6 h-6 text-efb-gold" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Tham gia giải đấu</h3>
                                <p className="text-xs text-white/80 font-light leading-relaxed mb-6">Đăng ký đội bóng của bạn ngay hôm nay để thi đấu và trải nghiệm đẳng cấp sân 6.</p>
                                <Link href="/giai-dau" className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 bg-efb-gold text-gray-900 text-sm font-medium rounded-xl hover:bg-yellow-400 hover:shadow-lg hover:shadow-efb-gold/20 transition-all">
                                    Đăng ký tham gia <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
