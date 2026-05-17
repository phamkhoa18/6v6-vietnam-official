"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Trophy, Users, Calendar, Search, Flame, Clock,
    CheckCircle2, ChevronLeft, ChevronRight, ArrowUpDown,
    Loader2, Ban, MapPin, User, Shield, Swords, Globe
} from "lucide-react";
import { GAME_MODE_INFO, TOURNAMENT_FORMATS, type GameMode } from "@/lib/ranking-points";

const statusConfig: Record<string, { label: string; icon: typeof Flame; bgClass: string }> = {
    registration: { label: "Đang mở ĐK", icon: Clock, bgClass: "bg-amber-400 text-amber-900" },
    ongoing: { label: "Đang diễn ra", icon: Flame, bgClass: "bg-red-500 text-white" },
    completed: { label: "Đã kết thúc", icon: CheckCircle2, bgClass: "bg-emerald-50 text-emerald-600" },
    draft: { label: "Nháp", icon: Clock, bgClass: "bg-gray-100 text-gray-500" },
    cancelled: { label: "Đã hủy", icon: Ban, bgClass: "bg-red-50 text-red-500" },
};

const gameModeIcons: Record<string, typeof User> = {
    "1v1": User,
    "2v2": Users,
    "3v3": Users,
    "6v6": Shield,
};

const filterTabs = [
    { key: "all", label: "Tất cả" },
    { key: "ongoing", label: "Đang diễn ra" },
    { key: "registration", label: "Đang mở ĐK" },
    { key: "completed", label: "Đã kết thúc" },
];

const modeFilters = [
    { key: "all", label: "Tất cả" },
    { key: "1v1", label: "1v1" },
    { key: "2v2", label: "2v2" },
    { key: "3v3", label: "3v3" },
    { key: "6v6", label: "6v6" },
];

const sortOptions = [
    { key: "-createdAt", label: "Mới nhất" },
    { key: "createdAt", label: "Cũ nhất" },
    { key: "-views", label: "Nhiều lượt xem" },
    { key: "-currentSlots", label: "Nhiều đội nhất" },
];

const ITEMS_PER_PAGE = 9;

function TournamentListContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const urlPage = parseInt(searchParams.get("page") || "1");
    const urlStatus = searchParams.get("status") || "all";
    const urlMode = searchParams.get("mode") || "all";
    const urlSearch = searchParams.get("q") || "";
    const urlSort = searchParams.get("sort") || "-createdAt";

    const [tournaments, setTournaments] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(urlSearch);
    const [showSort, setShowSort] = useState(false);

    const updateURL = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== "all" && value !== "" && value !== "1" && key !== "page") {
                params.set(key, value);
            } else if (key === "page" && value !== "1") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        if (!("page" in updates)) params.delete("page");
        router.push(`/giai-dau?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const apiParams = new URLSearchParams({
                    page: String(urlPage),
                    limit: String(ITEMS_PER_PAGE),
                    sort: urlSort,
                });
                if (urlStatus !== "all") apiParams.set("status", urlStatus);
                if (urlMode !== "all") apiParams.set("gameMode", urlMode);
                if (urlSearch) apiParams.set("search", urlSearch);

                const res = await fetch(`/api/tournaments?${apiParams}`);
                const data = await res.json();
                if (data.success) {
                    setTournaments(data.data.tournaments || []);
                    setPagination(data.data.pagination || { page: 1, total: 0, totalPages: 1 });
                }
            } catch (error) {
                console.error("Failed to load tournaments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [urlPage, urlStatus, urlMode, urlSearch, urlSort]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== urlSearch) updateURL({ q: searchInput });
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const goToPage = (p: number) => {
        updateURL({ page: String(p) });
        window.scrollTo({ top: 280, behavior: "smooth" });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
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
                            <Trophy className="w-3 h-3" />Giải đấu
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight leading-tight mb-3">
                            Danh sách <span className="font-bold text-efb-gold">giải đấu</span>
                        </h1>
                        <p className="text-white/60 text-lg font-light max-w-lg">
                            Khám phá và tham gia các giải đấu bóng đá sân 6 trên toàn quốc
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="pb-20 bg-white">
                <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
                    {/* Filters */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 mb-8 -mt-6 relative z-10">
                        {/* Search Bar — full width on all screens */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm giải đấu..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all shadow-sm"
                            />
                        </div>

                        {/* Status Tabs — horizontal scroll on mobile, no scrollbar */}
                        <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
                            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                            <div className="inline-flex bg-gray-100 rounded-xl p-1 min-w-max scrollbar-hide">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => updateURL({ status: tab.key })}
                                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${urlStatus === tab.key
                                            ? "bg-white text-efb-red shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mode filter — horizontal scroll on mobile */}
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">Chế độ:</span>
                            <div className="overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                <div className="flex gap-1.5 min-w-max">
                                    {modeFilters.map((m) => (
                                        <button
                                            key={m.key}
                                            onClick={() => updateURL({ mode: m.key })}
                                            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${urlMode === m.key
                                                ? "bg-efb-red text-white shadow-sm"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sort + count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-gray-400">{isLoading ? "Đang tải..." : `Hiển thị ${tournaments.length} / ${pagination.total} giải đấu`}</p>
                        <div className="relative">
                            <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-efb-red transition-colors">
                                <ArrowUpDown className="w-3.5 h-3.5" /> {sortOptions.find(s => s.key === urlSort)?.label || "Mới nhất"}
                            </button>
                            {showSort && (
                                <div className="absolute right-0 top-full mt-2 w-44 bg-white border rounded-xl shadow-lg z-20 p-1">
                                    {sortOptions.map(opt => (
                                        <button key={opt.key} onClick={() => { updateURL({ sort: opt.key }); setShowSort(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${urlSort === opt.key ? "bg-red-50 text-efb-red font-bold" : "hover:bg-gray-50"}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tournaments.map((t, i) => {
                                const cfg = statusConfig[t.status] || statusConfig.draft;
                                const StatusIcon = cfg.icon;
                                const ModeIcon = gameModeIcons[t.gameMode] || Users;
                                const modeLabel = t.gameMode?.toUpperCase() || "";
                                return (
                                    <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <Link href={`/giai-dau/${t._id}`} className="block group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                                            <div className="relative h-44 overflow-hidden">
                                                <div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: `url(${t.banner || t.thumbnail || "/images/banner/bg-nen.png"})` }} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg ${cfg.bgClass}`}>
                                                        <StatusIcon className="w-3 h-3" />{cfg.label}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
                                                        <ModeIcon className="w-3 h-3" />{modeLabel}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold mb-1 group-hover:text-efb-red transition-colors line-clamp-2">{t.title}</h3>
                                                {t.createdBy?.name && (
                                                    <p className="text-[11px] text-gray-400 mb-3">BTC: {t.createdBy.name}</p>
                                                )}
                                                <div className="space-y-1.5 text-sm text-gray-500">
                                                    <div className="flex justify-between">
                                                        <span>Thể thức</span>
                                                        <span className="font-medium text-gray-700">{TOURNAMENT_FORMATS[t.format as keyof typeof TOURNAMENT_FORMATS] || t.format}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>{t.gameMode === "1v1" ? "Cầu thủ" : "Đội"}</span>
                                                        <span className="font-medium text-gray-700">{t.currentSlots || 0}/{t.maxSlots}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Giải thưởng</span>
                                                        <span className="font-bold text-efb-gold">{t.prize?.total || "Đang cập nhật"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 pt-2.5 mt-2.5 border-t border-dashed border-gray-100 text-xs text-gray-400">
                                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                                    <span>{t.schedule?.tournamentStart ? formatDate(t.schedule.tournamentStart) : formatDate(t.createdAt)}</span>
                                                    {t.location ? (
                                                        <><span className="mx-0.5">•</span><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{t.location}</span></>
                                                    ) : t.isOnline ? (
                                                        <><span className="mx-0.5">•</span><Globe className="w-3 h-3 flex-shrink-0" /><span>Online</span></>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && tournaments.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
                                <Trophy className="w-9 h-9 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1.5">Không tìm thấy giải đấu</h3>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                {urlSearch ? `Không có kết quả cho "${urlSearch}"` : "Hiện chưa có giải đấu nào"}
                            </p>
                        </motion.div>
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
                                <span className="mx-2 text-gray-200">•</span>
                                <span>{pagination.total} giải đấu</span>
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

export default function GiaiDauPage() {
    return (
        <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>}>
            <TournamentListContent />
        </Suspense>
    );
}
