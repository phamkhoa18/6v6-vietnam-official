"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Search, ChevronLeft, ChevronRight, Medal,
    TrendingUp, Users, User, Loader2, Crown, Target,
    Swords, Shield, ChevronDown, ArrowUp
} from "lucide-react";
import { GAME_MODE_INFO, type GameMode, GAME_MODES } from "@/lib/ranking-points";

const MODE_TABS: { key: GameMode; label: string; icon: typeof User }[] = [
    { key: "1v1", label: "1 vs 1", icon: User },
    { key: "2v2", label: "2 vs 2", icon: Users },
    { key: "3v3", label: "3 vs 3", icon: Users },
    { key: "6v6", label: "6 vs 6", icon: Shield },
];

export default function BXHPage() {
    const [activeMode, setActiveMode] = useState<GameMode>("1v1");
    const [rankings, setRankings] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const fetchRankings = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                mode: activeMode,
                page: String(page),
                limit: "50",
            });
            if (search) params.set("search", search);

            const res = await fetch(`/api/rankings?${params}`);
            const data = await res.json();
            if (data.success) {
                setRankings(data.data.rankings || []);
                setPagination(data.data.pagination || { page: 1, total: 0, totalPages: 1 });
            }
        } catch (e) {
            console.error("Failed to load rankings:", e);
        } finally {
            setIsLoading(false);
        }
    }, [activeMode, page, search]);

    useEffect(() => { fetchRankings(); }, [fetchRankings]);

    useEffect(() => {
        const timer = setTimeout(() => { setPage(1); }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const top3 = rankings.slice(0, 3);
    const rest = rankings.slice(3);
    const isTeamMode = activeMode === "6v6";
    const modeInfo = GAME_MODE_INFO[activeMode];

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    };

    const getPodiumGradient = (rank: number) => {
        if (rank === 1) return "from-yellow-400 via-amber-500 to-yellow-600";
        if (rank === 2) return "from-gray-300 via-gray-400 to-gray-500";
        return "from-amber-600 via-amber-700 to-amber-800";
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            {/* Hero Section */}
            <section className="relative pt-28 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7A1414] via-[#A01B1B] to-[#0F172A]" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/banner/bg-nen.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)]" />
                </div>
                <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10 text-white">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-efb-gold text-xs font-bold uppercase mb-4 backdrop-blur-sm">
                            <Trophy className="w-3 h-3" />Bảng xếp hạng
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight leading-tight mb-3">
                            Xếp hạng <span className="font-bold text-efb-gold">6v6 Vietnam</span>
                        </h1>
                        <p className="text-white/60 text-lg font-light max-w-lg">
                            Theo dõi thành tích và vị trí của bạn qua các giải đấu
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="pb-20 -mt-6">
                <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
                    {/* Mode Tabs + Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Mode Tabs */}
                            <div className="flex bg-gray-50 rounded-xl p-1 gap-1">
                                {MODE_TABS.map((tab) => {
                                    const TabIcon = tab.icon;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => { setActiveMode(tab.key); setPage(1); setSearch(""); }}
                                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeMode === tab.key
                                                ? "bg-gradient-to-r from-efb-red to-efb-red-light text-white shadow-lg shadow-red-500/20"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-white"
                                                }`}
                                        >
                                            <TabIcon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search */}
                            <div className="relative max-w-xs w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={isTeamMode ? "Tìm kiếm đội..." : "Tìm kiếm cầu thủ..."}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all"
                                />
                            </div>
                        </div>

                        {/* Mode description */}
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                            <Target className="w-3 h-3" />
                            <span>{modeInfo.description} — Xếp hạng theo {isTeamMode ? "đội" : "cá nhân"}</span>
                            <span className="mx-1">•</span>
                            <span>{pagination.total} {isTeamMode ? "đội" : "cầu thủ"}</span>
                        </div>
                    </motion.div>

                    {/* Loading */}
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-efb-red" />
                            <p className="text-sm text-gray-400">Đang tải bảng xếp hạng...</p>
                        </div>
                    ) : rankings.length === 0 ? (
                        /* Empty */
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
                                <Trophy className="w-9 h-9 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1.5">Chưa có dữ liệu</h3>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                {search ? `Không tìm thấy kết quả cho "${search}"` : "Chưa có giải đấu nào kết thúc ở chế độ này"}
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            {/* Top 3 Podium */}
                            {page === 1 && top3.length >= 3 && !search && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="grid grid-cols-3 gap-4 mb-8"
                                >
                                    {/* 2nd place */}
                                    <div className="mt-6">
                                        <PodiumCard entry={top3[1]} rank={2} isTeamMode={isTeamMode} activeMode={activeMode} />
                                    </div>
                                    {/* 1st place */}
                                    <div>
                                        <PodiumCard entry={top3[0]} rank={1} isTeamMode={isTeamMode} activeMode={activeMode} />
                                    </div>
                                    {/* 3rd place */}
                                    <div className="mt-8">
                                        <PodiumCard entry={top3[2]} rank={3} isTeamMode={isTeamMode} activeMode={activeMode} />
                                    </div>
                                </motion.div>
                            )}

                            {/* Rankings Table */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                            >
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50/80 text-[10px] uppercase tracking-wider font-semibold text-gray-400 border-b border-gray-100">
                                    <div className="col-span-1 text-center">#</div>
                                    <div className="col-span-4">{isTeamMode ? "Đội" : "Cầu thủ"}</div>
                                    <div className="col-span-1 text-center">Giải</div>
                                    <div className="col-span-1 text-center">Trận</div>
                                    <div className="col-span-1 text-center">Thắng</div>
                                    <div className="col-span-1 text-center">Thua</div>
                                    <div className="col-span-1 text-center">HS</div>
                                    <div className="col-span-2 text-center font-bold text-efb-red">Điểm</div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-gray-50">
                                    {(page === 1 && !search ? rest : rankings).map((entry, idx) => {
                                        const rank = entry.rank;
                                        return (
                                            <motion.div
                                                key={entry.user?._id || entry.teamName || idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className={`grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-gray-50/50 transition-colors ${rank <= 3 ? "bg-amber-50/20" : ""}`}
                                            >
                                                {/* Rank */}
                                                <div className="col-span-1 text-center">
                                                    {getRankIcon(rank)}
                                                </div>

                                                {/* Name */}
                                                <div className="col-span-4 flex items-center gap-3">
                                                    {isTeamMode ? (
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                            {(entry.teamName || "?").charAt(0)}
                                                        </div>
                                                    ) : (
                                                        entry.user?.avatar ? (
                                                            <img src={entry.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 flex-shrink-0" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                                {(entry.user?.name || "?").charAt(0)}
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {isTeamMode ? entry.teamName : (entry.user?.name || "N/A")}
                                                        </p>
                                                        {!isTeamMode && entry.user?.nickname && (
                                                            <p className="text-[10px] text-gray-400 truncate">{entry.user.nickname}</p>
                                                        )}
                                                        {!isTeamMode && entry.user?.province && (
                                                            <p className="text-[10px] text-gray-400 truncate">{entry.user.province}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="col-span-1 text-center text-xs text-gray-500">{entry.tournamentsPlayed}</div>
                                                <div className="col-span-1 text-center text-xs text-gray-500">{entry.totalMatches}</div>
                                                <div className="col-span-1 text-center text-xs font-medium text-emerald-600">{entry.totalWins + (entry.totalPenaltyWins || 0)}</div>
                                                <div className="col-span-1 text-center text-xs font-medium text-red-500">{entry.totalLosses}</div>
                                                <div className="col-span-1 text-center text-xs text-gray-500">
                                                    <span className={entry.goalDifference > 0 ? "text-emerald-600" : entry.goalDifference < 0 ? "text-red-500" : ""}>
                                                        {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                                                    </span>
                                                </div>

                                                {/* Points */}
                                                <div className="col-span-2 text-center">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-efb-red to-efb-red-light text-white text-sm font-bold rounded-lg shadow-sm">
                                                        {entry.totalPoints}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="flex items-center gap-1 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:text-efb-red hover:border-efb-red hover:bg-red-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Trước
                                    </button>
                                    <span className="text-xs text-gray-400 px-3">
                                        Trang <span className="font-bold text-gray-700">{page}</span> / <span className="font-bold text-gray-700">{pagination.totalPages}</span>
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                        className="flex items-center gap-1 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:text-efb-red hover:border-efb-red hover:bg-red-50 disabled:opacity-30 transition-all"
                                    >
                                        Sau <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Scroll to top */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="fixed bottom-6 right-6 w-11 h-11 bg-efb-red text-white rounded-full shadow-lg flex items-center justify-center hover:bg-efb-red-light transition-colors z-40"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

// Podium Card Component
function PodiumCard({ entry, rank, isTeamMode, activeMode }: { entry: any; rank: number; isTeamMode: boolean; activeMode: GameMode }) {
    const isFirst = rank === 1;
    const gradients = {
        1: "from-yellow-400/20 via-amber-50 to-yellow-100/50",
        2: "from-gray-200/30 via-gray-50 to-gray-100/50",
        3: "from-amber-600/10 via-orange-50 to-amber-100/30",
    };

    const borderColors = {
        1: "border-yellow-300",
        2: "border-gray-300",
        3: "border-amber-500",
    };

    const crownColors = {
        1: "text-yellow-400",
        2: "text-gray-400",
        3: "text-amber-600",
    };

    return (
        <div className={`relative bg-gradient-to-b ${gradients[rank as 1 | 2 | 3]} border-2 ${borderColors[rank as 1 | 2 | 3]} rounded-2xl p-5 text-center ${isFirst ? "shadow-xl shadow-yellow-500/10" : "shadow-sm"}`}>
            {/* Crown */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center ${crownColors[rank as 1 | 2 | 3]}`}>
                    {rank === 1 ? <Crown className="w-4 h-4" /> : <Medal className="w-4 h-4" />}
                </div>
            </div>

            {/* Avatar */}
            <div className="mt-3 mb-3 flex justify-center">
                {isTeamMode ? (
                    <div className={`${isFirst ? "w-16 h-16" : "w-12 h-12"} rounded-xl bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center text-white font-bold ${isFirst ? "text-2xl" : "text-lg"}`}>
                        {(entry.teamName || "?").charAt(0)}
                    </div>
                ) : entry.user?.avatar ? (
                    <img src={entry.user.avatar} alt="" className={`${isFirst ? "w-16 h-16" : "w-12 h-12"} rounded-full object-cover border-2 border-white shadow-md`} />
                ) : (
                    <div className={`${isFirst ? "w-16 h-16" : "w-12 h-12"} rounded-full bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center text-white font-bold ${isFirst ? "text-2xl" : "text-lg"}`}>
                        {(entry.user?.name || "?").charAt(0)}
                    </div>
                )}
            </div>

            {/* Name */}
            <h3 className={`font-bold text-gray-900 truncate ${isFirst ? "text-base" : "text-sm"}`}>
                {isTeamMode ? entry.teamName : (entry.user?.name || "N/A")}
            </h3>
            {!isTeamMode && entry.user?.nickname && (
                <p className="text-[10px] text-gray-400 truncate">{entry.user.nickname}</p>
            )}

            {/* Points */}
            <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-efb-red to-efb-red-light text-white font-bold text-sm rounded-lg shadow-md">
                    <TrendingUp className="w-3 h-3" />
                    {entry.totalPoints} điểm
                </span>
            </div>

            {/* Mini stats */}
            <div className="mt-3 grid grid-cols-3 gap-1 text-[10px]">
                <div>
                    <p className="font-bold text-gray-700">{entry.totalMatches}</p>
                    <p className="text-gray-400">Trận</p>
                </div>
                <div>
                    <p className="font-bold text-emerald-600">{entry.totalWins}</p>
                    <p className="text-gray-400">Thắng</p>
                </div>
                <div>
                    <p className="font-bold text-gray-700">{entry.tournamentsPlayed}</p>
                    <p className="text-gray-400">Giải</p>
                </div>
            </div>
        </div>
    );
}
