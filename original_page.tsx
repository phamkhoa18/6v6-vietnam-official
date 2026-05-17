"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Loader2, Trophy, Users, Calendar, MapPin, Shield, CheckCircle2,
    Clock, Flame, Ban, Globe, Info, FileText, Swords, User, ChevronRight, ChevronLeft,
    Gamepad2, Zap, Target, ArrowRight, Eye, Award
} from "lucide-react";
import Link from "next/link";
import { TOURNAMENT_FORMATS, TOURNAMENT_STATUS } from "@/lib/ranking-points";
import { Badge } from "@/components/ui/badge";

const formColors: Record<string, string> = {
    W: "bg-red-500 text-white",
    D: "bg-gray-400 text-white",
    L: "bg-red-500 text-white",
    PW: "bg-emerald-400 text-white",
    PL: "bg-orange-400 text-white",
};

const formatLabels: Record<string, string> = {
    single_elimination: "Loại trực tiếp",
    double_elimination: "Loại kép",
    round_robin: "Vòng tròn",
    group_stage: "Vòng bảng",
};

const tabs = [
    { key: "overview", label: "Tổng quan", icon: FileText },
    { key: "participants", label: "Tham gia", icon: Users },
    { key: "brackets", label: "Sơ đồ thi đấu", icon: Swords },
    { key: "schedule", label: "Lịch thi đấu", icon: Calendar },
];

function TournamentDetailContent() {
    const { id } = useParams() as { id: string };
    const router = useRouter();

    const [tournament, setTournament] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchTournament = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/tournaments/${id}`);
                const data = await res.json();
                if (data.success) {
                    setTournament(data.data.tournament);
                    setParticipants(data.data.participants || []);
                    setMatches(data.data.matches || []);
                } else {
                    router.push("/giai-dau");
                }
            } catch (error) {
                console.error("Failed to fetch tournament", error);
                router.push("/giai-dau");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTournament();
    }, [id, router]);

    const isTeam = tournament?.gameMode !== "1v1";
    const format = tournament?.format;

    const groups = useMemo(() => {
        const grpMap: Record<string, any[]> = {};
        participants.forEach(p => {
            if (p.status !== "active") return;
            const g = p.group || "—";
            if (!grpMap[g]) grpMap[g] = [];
            grpMap[g].push(p);
        });
        Object.keys(grpMap).forEach(g => {
            grpMap[g].sort((a: any, b: any) => {
                const ptsA = a.stats?.points || 0, ptsB = b.stats?.points || 0;
                if (ptsA !== ptsB) return ptsB - ptsA;
                const gdA = a.stats?.goalDifference || 0, gdB = b.stats?.goalDifference || 0;
                if (gdA !== gdB) return gdB - gdA;
                return (b.stats?.goalsFor || 0) - (a.stats?.goalsFor || 0);
            });
        });
        return grpMap;
    }, [participants]);

    const bracketRounds = useMemo(() => {
        const nonGroupMatches = matches.filter(m => !m.group);
        const roundMap: Record<number, any[]> = {};
        nonGroupMatches.forEach(m => {
            if (!roundMap[m.round]) roundMap[m.round] = [];
            roundMap[m.round].push(m);
        });
        return roundMap;
    }, [matches]);

    const getRoundName = (round: number, totalRounds: number) => {
        const remaining = totalRounds - round;
        if (remaining === 0) return "Chung kết";
        if (remaining === 1) return "Bán kết";
        if (remaining === 2) return "Tứ kết";
        return `Vòng ${round}`;
    };

    const getTeamName = (match: any, side: "A" | "B") => {
        const team = side === "A" ? match.teamA : match.teamB;
        const player = side === "A" ? match.playerA : match.playerB;
        if (team) return team.shortName || team.name || "TBD";
        if (player) return player.nickname || player.name || "TBD";
        return "TBD";
    };

    const matchesByRound = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        matches.forEach(m => {
            const key = m.group ? `Bảng ${m.group}` : `Vòng ${m.round}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m);
        });
        return grouped;
    }, [matches]);

    if (isLoading) {
        return <div className="py-32 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-efb-red" /></div>;
    }

    if (!tournament) return null;

    const hasGroups = Object.keys(groups).length > 0 && Object.keys(groups)[0] !== "—";
    const hasBracket = Object.keys(bracketRounds).length > 0;
    const activeParticipants = participants.filter(p => p.status === "active");

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A";

    const cfg = TOURNAMENT_STATUS[tournament.status as keyof typeof TOURNAMENT_STATUS] || TOURNAMENT_STATUS.draft;
    const bgImage = tournament.banner || tournament.thumbnail || "/images/banner/bg-nen.png";

    const prizes = [];
    if (tournament.prize?.first) prizes.push({ place: "🥇 Vô địch", amount: tournament.prize.first, color: "from-yellow-400 to-amber-500" });
    if (tournament.prize?.second) prizes.push({ place: "🥈 Á quân", amount: tournament.prize.second, color: "from-gray-300 to-gray-400" });
    if (tournament.prize?.third) prizes.push({ place: "🥉 Hạng 3", amount: tournament.prize.third, color: "from-orange-400 to-orange-500" });

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="relative pt-24 pb-14">
                <div className="absolute inset-0 overflow-hidden">
                    <img src="/images/banner/bg-nen.png" alt="" className="object-cover w-full h-full blur-[2px] opacity-60 scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#7A1414]/95 via-[#A01B1B]/80 to-white" />
                </div>

                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-[11px] text-white/50 mb-5">
                        <Link href="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
                        <ChevronRight className="w-3 h-3 text-white/30" />
                        <Link href="/giai-dau" className="hover:text-white/80 transition-colors">Giải đấu</Link>
                        <ChevronRight className="w-3 h-3 text-white/30" />
                        <span className="text-white/80">{tournament.title}</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-2xl p-5 sm:p-6 -mb-8 relative z-20 shadow-xl border border-gray-100/50"
                    >
                        {/* Badges */}
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                            <Badge className={`bg-${cfg.color}-50 border-${cfg.color}-200 text-${cfg.color}-700 border text-[10px] font-semibold px-2.5 py-0.5 gap-1 rounded-full`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-${cfg.color}-500`} />
                                {cfg.label}
                            </Badge>
                            <Badge className="bg-red-50 text-red-600 border-red-100 text-[10px] rounded-full px-2.5 py-0.5">{formatLabels[format] || TOURNAMENT_FORMATS[format as keyof typeof TOURNAMENT_FORMATS] || format}</Badge>
                            <Badge className="bg-gray-50 text-gray-500 border-gray-100 text-[10px] rounded-full px-2.5 py-0.5">{isTeam ? "Đội" : "Cá nhân"} ({tournament.gameMode})</Badge>
                        </div>

                        {/* Title */}
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">{tournament.title}</h1>

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-gray-500 mb-4">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-red-400" />{formatDate(tournament.schedule?.tournamentStart)} - {formatDate(tournament.schedule?.tournamentEnd)}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" />{tournament.isOnline ? "Online" : (tournament.location || "Chưa xác định")}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-medium text-gray-400">Số lượng đăng ký</span>
                                <span className="text-[11px] font-semibold text-efb-red">{tournament.currentSlots}/{tournament.maxSlots}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((tournament.currentSlots / tournament.maxSlots) * 100, 100)}%` }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className={`h-full rounded-full ${(tournament.currentSlots / tournament.maxSlots) >= 0.8 ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`}
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-red-50/60 rounded-xl px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <Users className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-[10px] text-red-500/70 font-medium uppercase tracking-wider">Đội</span>
                                </div>
                                <div className="text-gray-900">
                                    <span className="text-lg font-bold tabular-nums">{tournament.currentSlots}</span>
                                    <span className="text-xs text-gray-400 font-medium">/{tournament.maxSlots}</span>
                                </div>
                            </div>
                            <div className="bg-amber-50/60 rounded-xl px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] text-amber-500/70 font-medium uppercase tracking-wider">Giải thưởng</span>
                                </div>
                                <div className="text-amber-700 text-sm font-bold truncate">
                                    {tournament.prize?.total
                                        ? (typeof tournament.prize.total === 'number'
                                            ? Number(tournament.prize.total).toLocaleString("vi-VN") + ' VNĐ'
                                            : tournament.prize.total)
                                        : "—"}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="pt-4 pb-16 bg-white border-t border-gray-100">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    {/* Mobile Tab Bar */}
                    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 sm:hidden">
                        <div className="grid grid-cols-4 gap-0">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`relative flex flex-col items-center justify-center py-2.5 px-1 transition-all duration-200 ${isActive ? "text-efb-red" : "text-gray-400 active:text-gray-600"}`}
                                    >
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-xl mb-0.5 transition-all duration-200 ${isActive ? "bg-red-50 shadow-sm shadow-red-100" : ""}`}>
                                            <tab.icon className={`w-[18px] h-[18px] transition-all duration-200 ${isActive ? "text-efb-red" : ""}`} />
                                        </div>
                                        <span className={`text-[10px] leading-tight text-center transition-all duration-200 ${isActive ? "font-bold text-efb-red" : "font-medium"}`}>
                                            {tab.label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="mobile-tab-indicator"
                                                className="absolute bottom-0 left-2 right-2 h-[3px] bg-efb-red rounded-t-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Tab Bar */}
                    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 hidden sm:flex gap-1 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative px-4 py-3 text-[13px] font-medium transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${activeTab === tab.key ? "text-efb-red" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                                {activeTab === tab.key && (
                                    <motion.div
                                        layoutId="desktop-tab-indicator"
                                        className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-efb-red rounded-t-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6">
                        {activeTab === "overview" && (
                            <div className="grid lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-2 space-y-4">
                                    {tournament.description && (
                                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                            <h3 className="font-semibold text-[13px] text-gray-900 flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-efb-red" />Giới thiệu</h3>
                                            <div className="text-[13px] text-gray-600 whitespace-pre-line leading-relaxed break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: tournament.description.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all">$1</a>') }} />
                                        </div>
                                    )}

                                    {tournament.rules && (
                                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                            <h3 className="font-semibold text-[13px] text-gray-900 flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-amber-500" />Điều lệ</h3>
                                            <div className="text-[13px] text-gray-600 whitespace-pre-line leading-relaxed break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: tournament.rules.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all">$1</a>') }} />
                                        </div>
                                    )}

                                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                        <h3 className="font-semibold text-[13px] text-gray-900 flex items-center gap-2 mb-3"><Gamepad2 className="w-4 h-4 text-indigo-500" />Thông tin giải đấu</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {[
                                                { label: "Hình thức", value: formatLabels[format] || TOURNAMENT_FORMATS[format as keyof typeof TOURNAMENT_FORMATS] || format, icon: Trophy, color: "text-red-600 bg-red-50" },
                                                { label: "Platform", value: "Tất cả", icon: Gamepad2, color: "text-indigo-600 bg-indigo-50" },
                                                { label: "Game Mode", value: tournament.gameMode, icon: Target, color: "text-rose-600 bg-rose-50" },
                                                { label: "Số lượng", value: `${tournament.maxSlots} ${isTeam ? "Đội" : "Cá nhân"}`, icon: Users, color: "text-red-600 bg-emerald-50" },
                                                { label: "Địa điểm", value: tournament.isOnline ? "Online" : tournament.location, icon: MapPin, color: "text-amber-600 bg-amber-50" },
                                                { label: "Trạng thái", value: cfg.label, icon: Clock, color: "text-gray-600 bg-gray-100" },
                                            ].map((item, idx) => (
                                                <div key={idx} className={`${item.color.split(" ")[1]} rounded-xl p-3.5`}>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <item.icon className={`w-3.5 h-3.5 ${item.color.split(" ")[0]}`} />
                                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{item.label}</span>
                                                    </div>
                                                    <div className={`text-sm font-semibold ${item.color.split(" ")[0]} truncate`}>{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {prizes.length > 0 && (
                                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                            <h3 className="font-semibold text-[13px] text-gray-900 flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-amber-500" />Giải thưởng</h3>
                                            <div className="space-y-2">
                                                {prizes.map(p => (
                                                    <div key={p.place} className={`flex justify-between items-center p-3 rounded-lg bg-gradient-to-r ${p.color}/10 border border-gray-100`}>
                                                        <span className="text-[13px] font-semibold text-gray-800">{p.place}</span>
                                                        <span className="text-[13px] font-bold text-gray-900">{typeof p.amount === 'number' ? `${Number(p.amount).toLocaleString("vi-VN")} ₫` : p.amount}</span>
                                                    </div>
                                                ))}
                                                {tournament.prize?.total && (
                                                    <div className="flex justify-between items-center p-3 mt-2 border-t border-gray-100">
                                                        <span className="text-[13px] font-semibold text-gray-500">Tổng giải</span>
                                                        <span className="text-[13px] font-bold text-amber-600">{tournament.prize.total}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                        <h3 className="font-semibold text-[13px] text-gray-900 flex items-center gap-2 mb-3"><Info className="w-4 h-4 text-blue-500" />Ban tổ chức</h3>
                                        <div className="space-y-2.5 text-[13px]">
                                            {tournament.createdBy?.name && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Tên BTC</span>
                                                    <span className="font-semibold text-gray-900">{tournament.createdBy.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "participants" && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                                <h3 className="text-[15px] font-bold text-gray-900 mb-5">Danh sách tham gia ({activeParticipants.length})</h3>
                                {activeParticipants.length === 0 ? (
                                    <div className="text-center py-10">
                                        <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Chưa có ai tham gia.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {activeParticipants.map(p => (
                                            <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100/50 hover:border-gray-200 transition-all">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-gray-200 shadow-sm">
                                                    {isTeam ? <Shield className="w-5 h-5 text-gray-400" /> : <User className="w-5 h-5 text-gray-400" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{isTeam ? p.name : (p.user?.name || "N/A")}</p>
                                                    {(p.seed || p.group) && (
                                                        <p className="text-[10px] font-medium text-gray-500 mt-0.5 flex gap-1">
                                                            {p.group && <span className="bg-gray-200 px-1.5 py-0.5 rounded">Bảng {p.group}</span>}
                                                            {p.seed && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Seed {p.seed}</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "brackets" && (
                            <div className="space-y-6">
                                {format === "group_stage" && hasGroups && (
                                    <div>
                                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Vòng bảng</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                                            {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, teams]) => (
                                                <div key={groupName} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                                        <h4 className="text-sm font-bold text-gray-900">Bảng {groupName}</h4>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-[10px] font-semibold text-gray-400 uppercase border-b border-gray-100 bg-white">
                                                                    <th className="px-3 py-2.5 text-left w-8">#</th>
                                                                    <th className="px-3 py-2.5 text-left">Tên</th>
                                                                    <th className="px-2 py-2.5 text-center" title="Trận">Tr</th>
                                                                    <th className="px-2 py-2.5 text-center text-red-600" title="Thắng">T</th>
                                                                    <th className="px-2 py-2.5 text-center text-gray-500" title="Hòa">H</th>
                                                                    <th className="px-2 py-2.5 text-center text-red-500" title="Thua">B</th>
                                                                    <th className="px-2 py-2.5 text-center" title="Hệ số">HS</th>
                                                                    <th className="px-3 py-2.5 text-center font-bold">Đ</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {teams.map((t: any, idx: number) => {
                                                                    const s = t.stats || {};
                                                                    const isAdvancing = idx < (tournament.scoring?.advancePerGroup || 2);
                                                                    return (
                                                                        <tr key={t._id} className={isAdvancing ? "bg-red-50/30" : "bg-white"}>
                                                                            <td className="px-3 py-2"><span className={`w-5 h-5 inline-flex items-center justify-center rounded text-[10px] font-bold ${isAdvancing ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"}`}>{idx + 1}</span></td>
                                                                            <td className="px-3 py-2 font-semibold text-[13px] text-gray-900">{isTeam ? t.name : (t.user?.name || "N/A")}</td>
                                                                            <td className="px-2 py-2 text-center text-[12px] text-gray-600">{s.played || 0}</td>
                                                                            <td className="px-2 py-2 text-center text-[12px] text-red-600 font-medium">{s.wins || 0}</td>
                                                                            <td className="px-2 py-2 text-center text-[12px] text-gray-500">{s.draws || 0}</td>
                                                                            <td className="px-2 py-2 text-center text-[12px] text-red-500">{s.losses || 0}</td>
                                                                            <td className="px-2 py-2 text-center text-[12px] font-medium text-gray-700">{s.goalDifference || 0}</td>
                                                                            <td className="px-3 py-2 text-center text-[13px] font-black text-gray-900">{s.points || 0}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(hasBracket || format === "single_elimination") && (
                                    <div>
                                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">{format === "single_elimination" ? "Nhánh đấu trực tiếp" : "Vòng loại trực tiếp"}</h3>
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto shadow-sm">
                                            <div className="flex gap-8 min-w-max">
                                                {Object.entries(bracketRounds).sort(([a], [b]) => Number(a) - Number(b)).map(([round, roundMatches]) => {
                                                    const totalRounds = Math.max(...Object.keys(bracketRounds).map(Number));
                                                    return (
                                                        <div key={round} className="flex flex-col gap-6 min-w-[220px]">
                                                            <div className="text-center mb-2">
                                                                <span className="text-[11px] font-bold text-gray-600 px-3 py-1 bg-gray-100 rounded-full uppercase tracking-wider">{getRoundName(Number(round), totalRounds)}</span>
                                                            </div>
                                                            {roundMatches.map((m: any) => {
                                                                const isCompleted = m.status === "completed";
                                                                return (
                                                                    <div key={m._id} className="w-full bg-white rounded-[6px] border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden z-20 group relative cursor-pointer hover:scale-[1.02] transition-transform">
                                                                        {m.status === 'ongoing' && (
                                                                            <div className="absolute top-0 right-0 left-0 bg-red-500 text-white text-[7px] font-bold text-center py-[1px] uppercase tracking-wider flex items-center justify-center gap-1 z-10">
                                                                                <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> LIVE
                                                                            </div>
                                                                        )}
                                                                        <div className={`p-1.5 flex flex-col ${isCompleted && m.winner === "A" ? "bg-red-50/20" : ""} ${m.status === 'ongoing' ? 'mt-[10px]' : ''}`}>
                                                                            <span className="text-[8px] text-gray-400 font-bold text-center mb-0.5">
                                                                                {getTeamName(m, "A")}
                                                                            </span>
                                                                            <div className="flex justify-between items-center px-1">
                                                                                <div className="flex items-center min-w-0 pr-1 leading-[1.1] gap-0.5">
                                                                                    <span className={`truncate text-[11px] ${isCompleted && m.winner === "A" ? "text-red-700 font-bold" : "text-gray-800 font-bold"}`}>
                                                                                        {getTeamName(m, "A")}
                                                                                    </span>
                                                                                </div>
                                                                                <span className={`text-[12px] tabular-nums ml-1 flex-shrink-0 ${isCompleted && m.winner === "A" ? "text-red-600 font-bold" : "text-gray-400 font-semibold"}`}>{isCompleted ? m.scoreA : "-"}</span>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="h-px bg-[#E2E8F0] w-full" />
                                                                        
                                                                        <div className={`p-1.5 flex flex-col ${isCompleted && m.winner === "B" ? "bg-red-50/20" : ""}`}>
                                                                            <span className="text-[8px] text-gray-400 font-bold text-center mb-0.5">
                                                                                {getTeamName(m, "B")}
                                                                            </span>
                                                                            <div className="flex justify-between items-center px-1">
                                                                                <div className="flex items-center min-w-0 pr-1 leading-[1.1] gap-0.5">
                                                                                    <span className={`truncate text-[11px] ${isCompleted && m.winner === "B" ? "text-red-700 font-bold" : "text-gray-800 font-bold"}`}>
                                                                                        {getTeamName(m, "B")}
                                                                                    </span>
                                                                                </div>
                                                                                <span className={`text-[12px] tabular-nums ml-1 flex-shrink-0 ${isCompleted && m.winner === "B" ? "text-red-600 font-bold" : "text-gray-400 font-semibold"}`}>{isCompleted ? m.scoreB : "-"}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!hasGroups && !hasBracket && <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500 shadow-sm text-sm">Chưa có dữ liệu sơ đồ / bảng đấu.</div>}
                            </div>
                        )}

                        {activeTab === "schedule" && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                                {Object.keys(matchesByRound).length === 0 ? (
                                    <div className="text-center py-10">
                                        <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Chưa có lịch thi đấu.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {Object.entries(matchesByRound).map(([roundName, roundMatches]) => (
                                            <div key={roundName}>
                                                <h3 className="text-[13px] font-bold text-gray-700 mb-4 flex items-center before:w-1 before:h-4 before:bg-efb-red before:rounded-full before:mr-2">
                                                    {roundName}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {roundMatches.map((m: any) => {
                                                        const isCompleted = m.status === "completed";
                                                        return (
                                                            <div key={m._id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center hover:border-gray-300 hover:shadow-md transition-all">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trận {m.matchNumber}</span>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isCompleted ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-600"}`}>
                                                                        {isCompleted ? "Đã xong" : "Sắp tới"}
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className={`flex items-center justify-between ${isCompleted && m.winner === "A" ? "font-bold text-gray-900" : "text-gray-600"}`}>
                                                                        <div className="flex items-center gap-2 truncate">
                                                                            <Shield className="w-4 h-4 text-gray-300" />
                                                                            <span className="truncate text-[13px]">{getTeamName(m, "A")}</span>
                                                                        </div>
                                                                        <span className="font-black text-lg tabular-nums ml-2">{isCompleted ? m.scoreA : "-"}</span>
                                                                    </div>
                                                                    <div className={`flex items-center justify-between ${isCompleted && m.winner === "B" ? "font-bold text-gray-900" : "text-gray-600"}`}>
                                                                        <div className="flex items-center gap-2 truncate">
                                                                            <Shield className="w-4 h-4 text-gray-300" />
                                                                            <span className="truncate text-[13px]">{getTeamName(m, "B")}</span>
                                                                        </div>
                                                                        <span className="font-black text-lg tabular-nums ml-2">{isCompleted ? m.scoreB : "-"}</span>
                                                                    </div>
                                                                </div>
                                                                {isCompleted && m.resultType === "penalty" && (
                                                                    <div className="mt-3 text-center text-[10px] text-gray-500 bg-gray-50 py-1 rounded font-medium">
                                                                        Penalty: {m.penaltyA} - {m.penaltyB}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function TournamentDetailPage() {
    return (
        <Suspense fallback={<div className="py-32 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-efb-red" /></div>}>
            <TournamentDetailContent />
        </Suspense>
    );
}
