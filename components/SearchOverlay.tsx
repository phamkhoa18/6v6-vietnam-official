"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Clock, Eye, Trophy, Newspaper, Loader2,
    ArrowRight, TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [posts, setPosts] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [trending, setTrending] = useState<any[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
            setPosts([]);
            setTournaments([]);
            setHasSearched(false);
            fetch("/api/posts?limit=5")
                .then(r => r.json())
                .then(data => { if (data.success) setTrending(data.data.posts); })
                .catch(() => {});
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setPosts([]); setTournaments([]); setHasSearched(false); return; }
        setIsSearching(true);
        setHasSearched(true);
        try {
            const [postsRes, tournamentsRes] = await Promise.all([
                fetch(`/api/posts?search=${encodeURIComponent(q)}&limit=5`).then(r => r.json()),
                fetch(`/api/tournaments?search=${encodeURIComponent(q)}&limit=5`).then(r => r.json()),
            ]);
            if (postsRes.success) setPosts(postsRes.data.posts || []);
            if (tournamentsRes.success) setTournaments(tournamentsRes.data.tournaments || []);
        } catch { /* silent */ }
        finally { setIsSearching(false); }
    }, []);

    const handleInput = (val: string) => {
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 350);
    };

    const timeAgo = (date: string) => {
        try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi }); } catch { return ""; }
    };

    const totalResults = posts.length + tournaments.length;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[100]"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Dialog */}
                    <div className="relative flex justify-center px-0 sm:px-4 pt-[8vh] sm:pt-[16vh]">
                        <motion.div
                            initial={{ opacity: 0, y: -12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-[560px] bg-white rounded-none sm:rounded-2xl shadow-2xl shadow-black/20 overflow-hidden max-h-[85vh] sm:max-h-auto flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Input */}
                            <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-100">
                                {isSearching ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-efb-red flex-shrink-0" />
                                ) : (
                                    <Search className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                )}
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => handleInput(e.target.value)}
                                    placeholder="Tìm giải đấu, tin tức..."
                                    className="flex-1 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                                />
                                {query && (
                                    <button
                                        onClick={() => { setQuery(""); setPosts([]); setTournaments([]); setHasSearched(false); }}
                                        className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>

                            {/* Body */}
                            <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
                                {!hasSearched ? (
                                    /* Default: trending */
                                    trending.length > 0 && (
                                        <div className="py-3">
                                            <div className="flex items-center gap-2 px-5 pb-2">
                                                <TrendingUp className="w-3.5 h-3.5 text-efb-red" />
                                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Mới nhất</span>
                                            </div>
                                            {trending.map((post) => (
                                                <Link
                                                    key={post._id}
                                                    href={`/tin-tuc/${post.slug}`}
                                                    onClick={onClose}
                                                    className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-red-50/40 transition-colors group"
                                                >
                                                    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                        {post.coverImage ? (
                                                            <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-red-50">
                                                                <Newspaper className="w-4 h-4 text-efb-red/60" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] font-medium text-gray-800 truncate group-hover:text-efb-red transition-colors">{post.title}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {timeAgo(post.publishedAt || post.createdAt)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )
                                ) : isSearching && totalResults === 0 ? (
                                    <div className="flex items-center justify-center py-14">
                                        <Loader2 className="w-5 h-5 animate-spin text-efb-red" />
                                    </div>
                                ) : totalResults === 0 ? (
                                    <div className="text-center py-14">
                                        <Search className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-500">Không tìm thấy kết quả</p>
                                        <p className="text-xs text-gray-400 mt-1">Thử từ khóa khác</p>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {/* Tournaments */}
                                        {tournaments.length > 0 && (
                                            <div className="mb-1">
                                                <div className="flex items-center gap-2 px-5 py-2">
                                                    <Trophy className="w-3.5 h-3.5 text-efb-red" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Giải đấu</span>
                                                </div>
                                                {tournaments.map((t) => (
                                                    <Link
                                                        key={t._id}
                                                        href={`/giai-dau/${t._id}`}
                                                        onClick={onClose}
                                                        className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-red-50/40 transition-colors group"
                                                    >
                                                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center">
                                                            {t.banner ? (
                                                                <img src={t.banner} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Trophy className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-efb-red transition-colors">{t.title}</p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                                {t.status === "upcoming" ? "Sắp diễn ra" : t.status === "ongoing" ? "Đang diễn ra" : "Đã kết thúc"}
                                                                {t.gameMode && <span> · {t.gameMode}</span>}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-efb-red transition-colors flex-shrink-0" />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Divider between sections */}
                                        {tournaments.length > 0 && posts.length > 0 && (
                                            <div className="h-px bg-gray-100 mx-5 my-1" />
                                        )}

                                        {/* Posts */}
                                        {posts.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 px-5 py-2">
                                                    <Newspaper className="w-3.5 h-3.5 text-efb-red" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bài viết</span>
                                                </div>
                                                {posts.map((post) => (
                                                    <Link
                                                        key={post._id}
                                                        href={`/tin-tuc/${post.slug}`}
                                                        onClick={onClose}
                                                        className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-red-50/40 transition-colors group"
                                                    >
                                                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                            {post.coverImage ? (
                                                                <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Newspaper className="w-4 h-4 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-medium text-gray-800 truncate group-hover:text-efb-red transition-colors">{post.title}</p>
                                                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(post.publishedAt || post.createdAt)}</span>
                                                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views || 0}</span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-efb-red transition-colors flex-shrink-0" />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="h-10 px-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                    <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 text-[9px] font-mono shadow-sm leading-none">ESC</kbd>
                                    để đóng
                                </span>
                                <span className="text-[10px] text-gray-300 font-medium tracking-wide">6v6 Vietnam</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
