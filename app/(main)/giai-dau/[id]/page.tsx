"use client";

import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Loader2, Trophy, Users, Calendar as CalendarIcon, MapPin, Shield, CheckCircle2,
    Clock, Flame, Ban, Globe, Info, FileText, Swords, User, ChevronRight, ChevronLeft,
    Gamepad2, Zap, Target, ArrowRight, Eye, Award, UserPlus, Share2, Camera, X, ImageIcon, UploadCloud, Search, Link2, UserCheck, PlaySquare, Video
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { TOURNAMENT_FORMATS, TOURNAMENT_STATUS } from "@/lib/ranking-points";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";


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
    { key: "schedule", label: "Lịch thi đấu", icon: CalendarIcon },
    { key: "video", label: "Video", icon: PlaySquare },
];

function TournamentDetailContent() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [tournament, setTournament] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [playerSearch, setPlayerSearch] = useState("");
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [myRegistration, setMyRegistration] = useState<any>(null);
    const [regForm, setRegForm] = useState({
        playerName: "",
        phone: "",
        personalPhoto: "",
        dateOfBirth: "",
        address: "",
        teamName: "",
        teamShortName: "",
        teamLogo: ""
    });

    // Teammate linking state (for 2v2/3v3)
    type LinkedTeammate = { _id: string; playerId: number; name: string; nickname?: string; avatar?: string; teamName?: string };
    const [teammates, setTeammates] = useState<(LinkedTeammate | null)[]>([null, null]);
    const [tmSearchQuery, setTmSearchQuery] = useState<string[]>(['', '']);
    const [tmSearchResults, setTmSearchResults] = useState<any[][]>([[], []]);
    const [tmShowDropdown, setTmShowDropdown] = useState<boolean[]>([false, false]);
    const [tmSearching, setTmSearching] = useState<boolean[]>([false, false]);
    const tmDebounceRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    // How many teammates needed based on gameMode
    const teammatesNeeded = tournament?.gameMode === '3v3' ? 2 : tournament?.gameMode === '2v2' ? 1 : 0;

    // Teammate search — debounced API call
    const searchTeammate = useCallback((idx: number, query: string) => {
        setTmSearchQuery(prev => { const n = [...prev]; n[idx] = query; return n; });
        // Clear previous debounce
        if (tmDebounceRef.current[idx]) clearTimeout(tmDebounceRef.current[idx]);
        if (query.trim().length < 1) {
            setTmSearchResults(prev => { const n = [...prev]; n[idx] = []; return n; });
            setTmSearching(prev => { const n = [...prev]; n[idx] = false; return n; });
            return;
        }
        setTmSearching(prev => { const n = [...prev]; n[idx] = true; return n; });
        tmDebounceRef.current[idx] = setTimeout(async () => {
            try {
                const res = await fetch(`/api/users/search-public?q=${encodeURIComponent(query)}`);
                const d = await res.json();
                if (d.success) {
                    const linkedIds = teammates.filter(Boolean).map(t => t!._id);
                    if (user) linkedIds.push((user as any)._id || '');
                    const filtered = (d.data || []).filter((u: any) => !linkedIds.includes(String(u._id)));
                    setTmSearchResults(prev => { const n = [...prev]; n[idx] = filtered; return n; });
                }
            } catch { /* silent */ }
            setTmSearching(prev => { const n = [...prev]; n[idx] = false; return n; });
            setTmShowDropdown(prev => { const n = [...prev]; n[idx] = true; return n; });
        }, 300);
    }, [teammates, user]);

    const selectTeammate = (idx: number, u: any) => {
        setTeammates(prev => { const n = [...prev]; n[idx] = { _id: String(u._id), playerId: u.playerId, name: u.name, nickname: u.nickname, avatar: u.avatar, teamName: u.teamName }; return n; });
        setTmShowDropdown(prev => { const n = [...prev]; n[idx] = false; return n; });
        setTmSearchQuery(prev => { const n = [...prev]; n[idx] = u.name; return n; });
    };

    const unlinkTeammate = (idx: number) => {
        setTeammates(prev => { const n = [...prev]; n[idx] = null; return n; });
        setTmSearchQuery(prev => { const n = [...prev]; n[idx] = ''; return n; });
        setTmSearchResults(prev => { const n = [...prev]; n[idx] = []; return n; });
    };

    useEffect(() => {
        if (showRegisterModal && isAuthenticated && user) {
            setRegForm(prev => ({
                ...prev,
                playerName: user.name || prev.playerName,
                phone: user.phone || prev.phone,
                personalPhoto: user.avatar || prev.personalPhoto,
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : prev.dateOfBirth,
                address: user.province || prev.address,
                teamName: user.teamName || prev.teamName
            }));
        }
    }, [showRegisterModal, isAuthenticated, user]);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regForm.playerName || !regForm.phone || !regForm.personalPhoto) {
            toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }
        // Team info required for 6v6
        if (tournament?.gameMode === '6v6' && (!regForm.teamName || !regForm.teamShortName)) {
            toast.error("Vui lòng nhập tên đội bóng và tên viết tắt!");
            return;
        }
        // Teammate validation for 2v2/3v3
        if (teammatesNeeded > 0) {
            for (let i = 0; i < teammatesNeeded; i++) {
                if (!teammates[i]) {
                    toast.error(`Vui lòng liên kết đồng đội ${i + 2} trước khi đăng ký!`);
                    return;
                }
            }
        }
        setIsRegistering(true);
        try {
            const token = localStorage.getItem("6v6_token");
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const payload: any = {
                playerName: regForm.playerName,
                phone: regForm.phone,
                personalPhoto: regForm.personalPhoto,
                dateOfBirth: regForm.dateOfBirth,
                address: regForm.address,
                teamName: regForm.teamName,
                teamShortName: regForm.teamShortName,
                teamLogo: regForm.teamLogo,
            };
            if (teammates[0]) payload.player2Id = teammates[0]._id;
            if (teammates[1]) payload.player3Id = teammates[1]._id;

            const res = await fetch(`/api/tournaments/${id}/register`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setMyRegistration(data.data);
                setShowRegisterModal(false);
                toast.success("Đăng ký thành công! Vui lòng chờ admin duyệt.");
            } else {
                toast.error(data.message || "Đăng ký thất bại");
            }
        } catch {
            toast.error("Có lỗi xảy ra khi đăng ký");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleUploadRegImage = (e: React.ChangeEvent<HTMLInputElement>, field: 'personalPhoto' | 'teamLogo') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setRegForm(prev => ({ ...prev, [field]: url }));
        }
    };
    
    // Kept old function def for backward compatibility or replace entirely below:
    const handleUploadPersonal = (e: React.ChangeEvent<HTMLInputElement>) => handleUploadRegImage(e, 'personalPhoto');
    const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => handleUploadRegImage(e, 'teamLogo');

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

    // Fetch user's existing registration for this tournament
    useEffect(() => {
        if (!isAuthenticated || !tournament) return;
        const fetchMyReg = async () => {
            try {
                const token = localStorage.getItem("6v6_token");
                const headers: Record<string, string> = {};
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`/api/tournaments/${id}/register`, { headers });
                const data = await res.json();
                if (data.success && data.data) setMyRegistration(data.data);
            } catch { /* silent */ }
        };
        fetchMyReg();
    }, [id, isAuthenticated, tournament]);

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
    const filteredParticipants = activeParticipants.filter(p => {
        if (!playerSearch) return true;
        const s = playerSearch.toLowerCase();
        const isMatch = [p.name, p.user?.name, p.captain?.name, p.user?.playerId, p.captain?.playerId].some(
            val => val && String(val).toLowerCase().includes(s)
        );
        return isMatch;
    });

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
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-red-400" />{formatDate(tournament.schedule?.tournamentStart)} - {formatDate(tournament.schedule?.tournamentEnd)}</span>
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

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                            {tournament.status === "registration" ? (
                                myRegistration ? (
                                    myRegistration.status === "pending" ? (
                                        <>
                                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 h-9 px-3 text-xs font-medium rounded-lg"><Clock className="w-3.5 h-3.5 mr-1.5" /> Đang chờ duyệt</Badge>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Bạn có chắc muốn hủy đăng ký?")) return;
                                                    try {
                                                        const token = localStorage.getItem("6v6_token");
                                                        const headers: Record<string, string> = {};
                                                        if (token) headers.Authorization = `Bearer ${token}`;
                                                        const res = await fetch(`/api/tournaments/${id}/register`, { method: "DELETE", headers });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            setMyRegistration(null);
                                                            toast.success("Đã hủy đăng ký");
                                                        } else {
                                                            toast.error(data.message || "Hủy thất bại");
                                                        }
                                                    } catch { toast.error("Có lỗi xảy ra"); }
                                                }}
                                                className="h-9 px-3 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-1.5"
                                            >
                                                <X className="w-3.5 h-3.5" /> Hủy
                                            </button>
                                        </>
                                    ) : myRegistration.status === "approved" || myRegistration.status === "active" ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 h-9 px-3 text-xs font-medium rounded-lg"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Đã đăng ký</Badge>
                                    ) : myRegistration.status === "rejected" ? (
                                        <Badge className="bg-red-50 text-red-700 border-red-200 h-9 px-3 text-xs font-medium rounded-lg"><Ban className="w-3.5 h-3.5 mr-1.5" /> Bị từ chối</Badge>
                                    ) : null
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                router.push(`/dang-nhap?redirect=/giai-dau/${id}`);
                                            } else {
                                                setShowRegisterModal(true);
                                            }
                                        }}
                                        className="bg-gradient-to-r from-efb-red to-red-600 hover:from-efb-red/90 hover:to-red-600/90 text-white rounded-lg h-9 px-5 text-xs font-semibold shadow-sm shadow-red-500/15 hover:shadow-md transition-all flex items-center"
                                    >
                                        <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Đăng ký tham gia
                                    </button>
                                )
                            ) : tournament.status === "ongoing" ? (
                                <Badge className="bg-red-500 text-white border-0 h-9 px-3 text-xs font-medium rounded-lg"><Flame className="w-3.5 h-3.5 mr-1.5" /> Đang diễn ra</Badge>
                            ) : tournament.status === "completed" ? (
                                <Badge className="bg-red-50 text-red-700 border-red-200 h-9 px-3 text-xs font-medium rounded-lg"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Đã kết thúc</Badge>
                            ) : null}
                            <button
                                className="rounded-lg h-9 text-xs border border-gray-200 hover:bg-gray-50 flex items-center px-4 font-medium transition-colors"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert("Đã sao chép link giải đấu!");
                                }}
                            >
                                <Share2 className="w-3.5 h-3.5 mr-1.5 text-gray-500" /> Chia sẻ
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="pt-4 pb-16 bg-white border-t border-gray-100">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    {/* Mobile Tab Bar */}
                    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 sm:hidden">
                        <div className="grid grid-cols-5 gap-0">
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
                                    
                                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                        <h3 className="font-semibold text-[13px] text-gray-900 flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-emerald-500" />Cơ chế tính điểm</h3>
                                        <div className="space-y-2 text-[13px]">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Thắng (chính thức)</span>
                                                <span className="font-bold text-emerald-600">+{tournament.scoring?.pointsPerWin ?? 3}đ</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Thắng (Penalty)</span>
                                                <span className="font-bold text-emerald-500">+{tournament.scoring?.pointsPerPenaltyWin ?? 2}đ</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Thua (Penalty)</span>
                                                <span className="font-bold text-orange-500">+{tournament.scoring?.pointsPerPenaltyLoss ?? 1}đ</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Thua (chính thức)</span>
                                                <span className="font-bold text-red-500">+{tournament.scoring?.pointsPerLoss ?? 0}đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "participants" && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Danh sách tham gia</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{activeParticipants.length} đội / vận động viên</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm VĐV, đội..."
                                                value={playerSearch}
                                                onChange={(e) => setPlayerSearch(e.target.value)}
                                                className="pl-9 h-9 text-sm rounded-lg border border-gray-200 w-[200px] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm" style={{ minWidth: '600px' }}>
                                            <thead>
                                                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white text-[10px] uppercase tracking-wider">
                                                    <th className="px-3 sm:px-4 py-3 text-center w-10 sm:w-14">#</th>
                                                    <th className="px-3 sm:px-4 py-3 text-left">VĐV / Đội</th>
                                                    {tournament?.gameMode !== "6v6" && tournament?.gameMode !== "1v1" && <th className="px-3 sm:px-4 py-3 text-left">Đồng đội</th>}
                                                    <th className="px-3 sm:px-4 py-3 text-center w-24">Bảng</th>
                                                    <th className="px-3 sm:px-4 py-3 text-center w-20">Seed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredParticipants.map((p, idx) => {
                                                    const is6v6 = tournament?.gameMode === "6v6";
                                                    const is1v1 = tournament?.gameMode === "1v1";
                                                    const primaryUser = is1v1 ? p.user : p.captain;
                                                    const avatarSrc = is6v6 ? p.logo : (primaryUser?.avatar || null);
                                                    const playerName = is6v6 ? p.name : (primaryUser?.name || "Khuyết danh");
                                                    const playerId = primaryUser?.playerId;

                                                    return (
                                                        <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                                            <td className="px-3 sm:px-4 py-3 text-center">
                                                                <span className="text-sm font-bold text-slate-400">{idx + 1}</span>
                                                            </td>
                                                            <td className="px-3 sm:px-4 py-3">
                                                                <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => primaryUser?._id && router.push(`/profile/${primaryUser._id}`)}>
                                                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                                                        {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" alt="" /> : <Users className="w-4 h-4 text-gray-300" />}
                                                                    </div>
                                                                    <div className="min-w-0 flex flex-col gap-[2px]">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <p className="text-[13px] sm:text-[14px] font-semibold text-gray-900 truncate tracking-tight">{playerName}</p>
                                                                            {playerId && (
                                                                                <span className="inline-flex items-center text-[9px] sm:text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md tabular-nums">#{playerId}</span>
                                                                            )}
                                                                        </div>
                                                                        {is6v6 && p.shortName && (
                                                                            <p className="text-[10px] sm:text-[11px] text-gray-400 truncate mt-0.5 font-medium">{p.shortName}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {(!is6v6 && !is1v1) && (
                                                                <td className="px-3 sm:px-4 py-3">
                                                                    {p.members && p.members.filter((m: any) => m.user?._id !== primaryUser?._id).length > 0 ? (
                                                                        <div className="flex flex-col gap-2">
                                                                            {p.members.filter((m: any) => m.user?._id !== primaryUser?._id).map((m: any) => {
                                                                                const mUser = m.user;
                                                                                if (!mUser) return null;
                                                                                return (
                                                                                    <div key={mUser._id} className="flex items-center gap-2 cursor-pointer group/tm" onClick={() => router.push(`/profile/${mUser._id}`)}>
                                                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                                                                            {mUser.avatar ? <img src={mUser.avatar} className="w-full h-full object-cover" alt="" /> : <User className="w-3 h-3 text-gray-300 group-hover/tm:text-efb-red transition-colors" />}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1.5">
                                                                                            <p className="text-[12px] font-medium text-gray-700 truncate tracking-tight group-hover/tm:text-efb-red transition-colors">{mUser.name || "Khuyết danh"}</p>
                                                                                            {mUser.playerId && (
                                                                                                <span className="inline-flex items-center text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-px rounded-md tabular-nums">#{mUser.playerId}</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                                                </td>
                                                            )}
                                                            <td className="px-3 sm:px-4 py-3 text-center">
                                                                {p.group ? <span className="bg-gray-100 text-gray-700 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border border-gray-200">Bảng {p.group}</span> : <span className="text-gray-300">—</span>}
                                                            </td>
                                                            <td className="px-3 sm:px-4 py-3 text-center">
                                                                <span className="text-xs sm:text-sm font-semibold text-gray-600 tabular-nums">
                                                                    {p.seed || '—'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredParticipants.length === 0 && (
                                        <div className="text-center py-16">
                                            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                            <p className="text-sm text-gray-400">{playerSearch.trim() ? 'Không tìm thấy VĐV nào' : 'Chưa có đội nào tham gia giải đấu này'}</p>
                                        </div>
                                    )}
                                </div>
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
                                                                <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                                                    <th className="px-3 py-3 text-left w-8 rounded-tl-lg">#</th>
                                                                    <th className="px-3 py-3 text-left">Đội</th>
                                                                    <th className="px-2 py-3 text-center" title="Trận">Tr</th>
                                                                    <th className="px-2 py-3 text-center text-red-600" title="Thắng">T</th>
                                                                    <th className="px-2 py-3 text-center text-gray-500" title="Hòa">H</th>
                                                                    <th className="px-2 py-3 text-center text-red-500" title="Thua">B</th>
                                                                    <th className="px-2 py-3 text-center text-emerald-500" title="Thắng Penalty">TP</th>
                                                                    <th className="px-2 py-3 text-center text-orange-500" title="Thua Penalty">TB</th>
                                                                    <th className="px-2 py-3 text-center" title="Hệ số">HS</th>
                                                                    <th className="px-3 py-3 text-center font-bold text-efb-red rounded-tr-lg">Đ</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {teams.map((t: any, idx: number) => {
                                                                    const s = t.stats || {};
                                                                    const isAdvancing = idx < (tournament.scoring?.advancePerGroup || 2);
                                                                    return (
                                                                        <tr key={t._id} className={`${isAdvancing ? "bg-red-50/20" : "bg-white"} hover:bg-gray-50 transition-colors`}>
                                                                            <td className="px-3 py-2.5"><span className={`w-5 h-5 inline-flex items-center justify-center rounded text-[10px] font-bold ${isAdvancing ? "bg-efb-red text-white shadow-sm" : "bg-gray-100 text-gray-500"}`}>{idx + 1}</span></td>
                                                                            <td className="px-3 py-2.5 font-bold text-[13px] text-gray-900">{isTeam ? t.name : (t.user?.name || "N/A")}</td>
                                                                            <td className="px-2 py-2.5 text-center text-[12px] text-gray-600">{s.played || 0}</td>
                                                                            <td className="px-2 py-2.5 text-center text-[12px] text-red-600 font-bold">{s.wins || 0}</td>
                                                                            <td className="px-2 py-2.5 text-center text-[12px] text-gray-500">{s.draws || 0}</td>
                                                                            <td className="px-2 py-2.5 text-center text-[12px] text-red-500">{s.losses || 0}</td>
                                                                            <td className="px-2 py-2.5 text-center text-[12px] text-emerald-500 font-bold">{s.penaltyWins || 0}</td>
                                                                            <td className="px-2 py-2.5 text-center text-[12px] text-orange-500 font-bold">{s.penaltyLosses || 0}</td>
                                                                            <td className="px-2 py-2.5 text-center text-[12px] font-medium text-gray-700">{s.goalDifference || 0}</td>
                                                                            <td className="px-3 py-2.5 text-center text-[14px] font-black text-gray-900">{s.points || 0}</td>
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
                                
                                {format === "round_robin" && !hasGroups && activeParticipants.length > 0 && (
                                    <div>
                                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Bảng xếp hạng</h3>
                                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-[10px] font-semibold text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                                                            <th className="px-4 py-3 text-left w-8">#</th>
                                                            <th className="px-4 py-3 text-left">Đội</th>
                                                            <th className="px-3 py-3 text-center" title="Trận">Tr</th>
                                                            <th className="px-3 py-3 text-center text-red-600" title="Thắng">T</th>
                                                            <th className="px-3 py-3 text-center text-gray-500" title="Hòa">H</th>
                                                            <th className="px-3 py-3 text-center text-red-500" title="Thua">B</th>
                                                            <th className="px-3 py-3 text-center text-emerald-500" title="Thắng Penalty">TP</th>
                                                            <th className="px-3 py-3 text-center text-orange-500" title="Thua Penalty">TB</th>
                                                            <th className="px-3 py-3 text-center" title="Hệ số">HS</th>
                                                            <th className="px-4 py-3 text-center font-bold">Đ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {[...activeParticipants].sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0)).map((t: any, idx: number) => {
                                                            const s = t.stats || {};
                                                            return (
                                                                <tr key={t._id} className="bg-white hover:bg-gray-50 transition-colors">
                                                                    <td className="px-4 py-3"><span className="w-5 h-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">{idx + 1}</span></td>
                                                                    <td className="px-4 py-3 font-semibold text-[13px] text-gray-900">{isTeam ? t.name : (t.user?.name || "N/A")}</td>
                                                                    <td className="px-3 py-3 text-center text-[12px] text-gray-600">{s.played || 0}</td>
                                                                    <td className="px-3 py-3 text-center text-[12px] text-red-600 font-medium">{s.wins || 0}</td>
                                                                    <td className="px-3 py-3 text-center text-[12px] text-gray-500">{s.draws || 0}</td>
                                                                    <td className="px-3 py-3 text-center text-[12px] text-red-500">{s.losses || 0}</td>
                                                                    <td className="px-3 py-3 text-center text-[12px] text-emerald-500 font-medium">{s.penaltyWins || 0}</td>
                                                                    <td className="px-3 py-3 text-center text-[12px] text-orange-500 font-medium">{s.penaltyLosses || 0}</td>
                                                                    <td className="px-3 py-3 text-center text-[12px] font-medium text-gray-700">{s.goalDifference || 0}</td>
                                                                    <td className="px-4 py-3 text-center text-[13px] font-black text-gray-900">{s.points || 0}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {format === "single_elimination" && (
                                    <div>
                                        {/* Header */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-[15px] font-bold text-gray-900">Sơ đồ thi đấu</h3>
                                            <div className="relative max-w-xs flex-1 sm:flex-none">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    placeholder="Tìm đối thủ..."
                                                    value={playerSearch}
                                                    onChange={(e) => setPlayerSearch(e.target.value)}
                                                    className="pl-9 h-9 text-sm rounded-lg border border-gray-200 w-full sm:w-[200px] focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[#FDFDFD] rounded-2xl border border-gray-200 p-8 overflow-auto min-h-[500px] relative shadow-inner">
                                            {/* Grid background */}
                                            <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: `radial-gradient(#E2E8F0 1.2px, transparent 1.2px)`, backgroundSize: '32px 32px' }} />
                                            
                                            <div className="inline-flex p-4 min-w-full relative z-10">
                                                {Object.entries(bracketRounds).sort(([a], [b]) => Number(a) - Number(b)).map(([round, roundMatches], rIndex, roundsArr) => {
                                                    const isLastRound = rIndex === roundsArr.length - 1;
                                                    const scale = Math.pow(2, rIndex);
                                                    const UNIT_HEIGHT = 110;
                                                    const GAP = 128;
                                                    const halfGap = GAP / 2;
                                                    const totalRounds = Math.max(...Object.keys(bracketRounds).map(Number));

                                                    return (
                                                        <div key={round} className="flex">
                                                            <div className="flex flex-col w-[200px]">
                                                                <div className="h-10 flex items-center justify-center mb-12">
                                                                    <div className="w-[140px] py-1.5 rounded-sm bg-[#FEEBDB] flex items-center justify-center border border-orange-200/50 shadow-sm">
                                                                        <span className="text-[12px] font-bold text-gray-800">{getRoundName(Number(round), totalRounds)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="relative flex-1">
                                                                    {roundMatches.map((m: any, mIdx: number) => {
                                                                        const topPadding = (scale - 1) * (UNIT_HEIGHT / 2);
                                                                        const yOffset = topPadding + mIdx * UNIT_HEIGHT * scale;
                                                                        const isCompleted = m.status === "completed";
                                                                        
                                                                        const matchesSearch = playerSearch.trim() === "" || [
                                                                            getTeamName(m, "A"), getTeamName(m, "B")
                                                                        ].some(v => v && v.toLowerCase().includes(playerSearch.toLowerCase()));

                                                                        const bY = mIdx;
                                                                        const isTop = bY % 2 === 0;
                                                                        const vLen = (UNIT_HEIGHT * scale) / 2;

                                                                        return (
                                                                            <div
                                                                                key={m._id}
                                                                                className={`absolute left-0 flex items-center transition-opacity ${matchesSearch ? 'opacity-100' : 'opacity-20'}`}
                                                                                style={{
                                                                                    top: `${yOffset}px`,
                                                                                    height: `${UNIT_HEIGHT}px`,
                                                                                    width: '100%'
                                                                                }}
                                                                            >
                                                                                <div className="w-full bg-white rounded-[6px] border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden z-20 group relative cursor-pointer hover:scale-[1.02] transition-transform">
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

                                                                                {/* Connector lines to next round */}
                                                                                {!isLastRound && (
                                                                                    <>
                                                                                        <div
                                                                                            className="absolute bg-[#CBD5E1]"
                                                                                            style={{ right: `-${halfGap}px`, width: `${halfGap}px`, height: '1px', top: '50%' }}
                                                                                        />
                                                                                        <div
                                                                                            className="absolute bg-[#CBD5E1]"
                                                                                            style={{
                                                                                                right: `-${halfGap}px`, width: '1px', height: `${vLen}px`,
                                                                                                ...(isTop ? { top: '50%' } : { bottom: '50%' })
                                                                                            }}
                                                                                        />
                                                                                        {isTop && (
                                                                                            <div
                                                                                                className="absolute bg-[#CBD5E1]"
                                                                                                style={{ right: `-${GAP}px`, width: `${halfGap}px`, height: '1px', top: `calc(50% + ${vLen}px)` }}
                                                                                            />
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            {/* Spacer between rounds */}
                                                            {!isLastRound && <div style={{ width: `${GAP}px` }} />}
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
                                        <CalendarIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
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
                                                        const isOngoing = m.status === "ongoing";
                                                        const headerBg = isCompleted ? "bg-gray-100 text-gray-600" : isOngoing ? "bg-red-500 text-white animate-pulse" : "bg-red-50 text-efb-red";
                                                        const statusLabel = isCompleted ? "Đã kết thúc" : isOngoing ? "Đang diễn ra" : "Sắp tới";
                                                        
                                                        return (
                                                            <div key={m._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group shadow-sm flex flex-col">
                                                                <div className={`px-4 py-1.5 flex items-center justify-between text-[10px] font-bold ${headerBg}`}>
                                                                    <span className="flex items-center gap-1 uppercase tracking-wider">{statusLabel}</span>
                                                                    {m.group && <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px]">Bảng {m.group}</span>}
                                                                    <span className="uppercase">Trận {m.matchNumber}</span>
                                                                </div>
                                                                <div className="p-4 flex items-center justify-between bg-white flex-1">
                                                                    <div className="flex-1 text-center min-w-[30%]">
                                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${isCompleted && m.winner === 'A' ? 'bg-emerald-50' : 'bg-gray-50 border border-gray-100'}`}><Shield className={`w-5 h-5 ${isCompleted && m.winner === 'A' ? 'text-emerald-500' : 'text-gray-400'}`} /></div>
                                                                        <div className="text-xs font-bold text-gray-900 truncate leading-tight px-1">{getTeamName(m, "A")}</div>
                                                                        {isCompleted && <div className={`text-[10px] font-bold mt-1 ${m.winner === 'A' ? 'text-emerald-600' : m.resultType === 'penalty' && m.winner === 'B' ? 'text-orange-500' : 'text-gray-400'}`}>+{m.pointsA ?? (m.winner === 'A' ? (m.resultType === 'penalty' ? 2 : 3) : m.resultType === 'penalty' ? 1 : 0)}đ</div>}
                                                                    </div>
                                                                    <div className="px-4 text-center min-w-[40%]">
                                                                        {isCompleted ? (
                                                                            <div className="flex flex-col items-center justify-center">
                                                                                <div className="text-2xl sm:text-3xl font-black text-gray-900 tabular-nums tracking-tighter">{m.scoreA} - {m.scoreB}</div>
                                                                                {m.resultType === "penalty" && <div className="text-[10px] sm:text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-1">Pen: {m.penaltyA} - {m.penaltyB}</div>}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-xl font-black text-gray-200 uppercase tracking-widest">VS</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 text-center min-w-[30%]">
                                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${isCompleted && m.winner === 'B' ? 'bg-emerald-50' : 'bg-gray-50 border border-gray-100'}`}><Shield className={`w-5 h-5 ${isCompleted && m.winner === 'B' ? 'text-emerald-500' : 'text-gray-400'}`} /></div>
                                                                        <div className="text-xs font-bold text-gray-900 truncate leading-tight px-1">{getTeamName(m, "B")}</div>
                                                                        {isCompleted && <div className={`text-[10px] font-bold mt-1 ${m.winner === 'B' ? 'text-emerald-600' : m.resultType === 'penalty' && m.winner === 'A' ? 'text-orange-500' : 'text-gray-400'}`}>+{m.pointsB ?? (m.winner === 'B' ? (m.resultType === 'penalty' ? 2 : 3) : m.resultType === 'penalty' ? 1 : 0)}đ</div>}
                                                                    </div>
                                                                </div>
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
                        {activeTab === "video" && (
                            <div className="bg-black rounded-xl border border-gray-100 shadow-sm overflow-hidden h-[80vh] min-h-[600px] max-h-[800px] relative">
                                {!tournament.videos || tournament.videos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-white">
                                        <Video className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có video nào</h3>
                                        <p className="text-gray-500 text-sm">Các video highlight của giải đấu sẽ được cập nhật tại đây.</p>
                                    </div>
                                ) : (
                                    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
                                        {tournament.videos.map((vid: any, idx: number) => (
                                            <div key={idx} className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-black">
                                                {vid.url.includes("<iframe") ? (
                                                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: vid.url }} />
                                                ) : (
                                                    <video 
                                                        src={vid.url} 
                                                        className="w-full h-full object-contain" 
                                                        controls 
                                                        loop 
                                                        playsInline
                                                        preload="metadata"
                                                    />
                                                )}
                                                
                                                {/* Overlay Info */}
                                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                                                    <h3 className="text-white font-bold text-lg leading-tight mb-2 max-w-[80%] drop-shadow-md">
                                                        {vid.title}
                                                    </h3>
                                                    <p className="text-white/80 text-xs drop-shadow flex items-center gap-2">
                                                        <Trophy className="w-3.5 h-3.5" />
                                                        {tournament.title}
                                                    </p>
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

            {/* Registration Modal */}
            <AnimatePresence>
                {showRegisterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isRegistering && setShowRegisterModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Đăng ký tham gia</h2>
                                    <p className="text-[13px] text-gray-500 mt-0.5">{tournament?.title}</p>
                                </div>
                                <button
                                    onClick={() => !isRegistering && setShowRegisterModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                                    disabled={isRegistering}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleRegisterSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 custom-scrollbar">
                                {/* Phần 1: Đội trưởng */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">1. Thông tin Đại diện (Đội trưởng)</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.playerName}
                                                    onChange={(e) => setRegForm({...regForm, playerName: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="Nhập họ và tên..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="tel" 
                                                    value={regForm.phone}
                                                    onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="09..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Ngày sinh</label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={`w-full flex items-center justify-start gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${regForm.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(regForm.dateOfBirth) ? "text-gray-900" : "text-gray-400"}`}
                                                        >
                                                            <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            {regForm.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(regForm.dateOfBirth)
                                                                ? new Date(regForm.dateOfBirth).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                                                                : "Chọn ngày sinh"}
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-[110]" align="start" sideOffset={4}>
                                                        <Calendar
                                                            mode="single"
                                                            selected={regForm.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(regForm.dateOfBirth) ? new Date(regForm.dateOfBirth) : undefined}
                                                            onSelect={(date) => {
                                                                if (date) {
                                                                    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                                                    setRegForm({...regForm, dateOfBirth: offsetDate.toISOString().split('T')[0]});
                                                                } else {
                                                                    setRegForm({...regForm, dateOfBirth: ''});
                                                                }
                                                            }}
                                                            locale={vi}
                                                            defaultMonth={regForm.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(regForm.dateOfBirth) ? new Date(regForm.dateOfBirth) : new Date(2000, 0)}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Khu vực/Địa chỉ</label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.address}
                                                    onChange={(e) => setRegForm({...regForm, address: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="VD: TP.HCM"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">Ảnh chân dung (Rõ mặt) <span className="text-red-500">*</span></label>
                                            <div className="flex items-start gap-4">
                                                {regForm.personalPhoto ? (
                                                    <div className="relative">
                                                        <img src={regForm.personalPhoto} alt="Avatar" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setRegForm({...regForm, personalPhoto: ''})} 
                                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer flex-1">
                                                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all bg-red-50/30">
                                                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                                <Camera className="w-4 h-4 text-red-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Tải ảnh lên</p>
                                                            </div>
                                                        </div>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadPersonal} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Phần Đồng đội (2v2/3v3 only) */}
                                {teammatesNeeded > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                                            <Link2 className="w-4 h-4 text-red-500" />
                                            2. Liên kết đồng đội
                                            <span className="text-xs font-normal text-gray-400 ml-1">({teammatesNeeded === 1 ? 'Cần 1 đồng đội' : 'Cần 2 đồng đội'})</span>
                                        </h3>
                                        <div className="space-y-4">
                                            {Array.from({ length: teammatesNeeded }).map((_, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                                        <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                                                        Cầu thủ {idx + 2}
                                                        <span className="text-red-500">*</span>
                                                    </label>

                                                    {teammates[idx] ? (
                                                        /* Linked state */
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {teammates[idx]!.avatar ? (
                                                                    <img src={teammates[idx]!.avatar} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User className="w-5 h-5 text-emerald-600" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-emerald-800 truncate">{teammates[idx]!.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">ID #{teammates[idx]!.playerId}</span>
                                                                    {teammates[idx]!.nickname && <span className="text-[10px] text-emerald-500">"{teammates[idx]!.nickname}"</span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => unlinkTeammate(idx)}
                                                                    className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                                                                    title="Xóa liên kết"
                                                                >
                                                                    <X className="w-3 h-3 text-red-500" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Search state */
                                                        <div className="relative">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Tìm theo Player ID hoặc Tên..."
                                                                    value={tmSearchQuery[idx]}
                                                                    onChange={(e) => searchTeammate(idx, e.target.value)}
                                                                    onFocus={(e) => { if (tmSearchQuery[idx].length > 0) setTmShowDropdown(prev => { const n = [...prev]; n[idx] = true; return n; }); const el = e.target; setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150); }}
                                                                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                                />
                                                                {tmSearching[idx] && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                                                            </div>

                                                            {/* Dropdown results */}
                                                            {tmShowDropdown[idx] && tmSearchResults[idx].length > 0 && (
                                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                                                                    {tmSearchResults[idx].map((u: any) => (
                                                                        <button
                                                                            key={u._id}
                                                                            type="button"
                                                                            onClick={() => selectTeammate(idx, u)}
                                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                                                                        >
                                                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                                {u.avatar ? (
                                                                                    <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <User className="w-4 h-4 text-gray-400" />
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">#{u.playerId}</span>
                                                                                    {u.nickname && <span className="text-[10px] text-gray-400">"{u.nickname}"</span>}
                                                                                    {u.teamName && <span className="text-[10px] text-gray-400">· {u.teamName}</span>}
                                                                                </div>
                                                                            </div>
                                                                            <UserPlus className="w-4 h-4 text-gray-300" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {tmShowDropdown[idx] && tmSearchQuery[idx].length > 0 && tmSearchResults[idx].length === 0 && !tmSearching[idx] && (
                                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-center">
                                                                    <p className="text-sm text-gray-400">Không tìm thấy cầu thủ</p>
                                                                    <p className="text-xs text-gray-300 mt-1">Đồng đội cần có tài khoản trên hệ thống</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Phần Đội bóng (6v6 only) */}
                                {tournament?.gameMode === '6v6' && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{teammatesNeeded > 0 ? '3' : '2'}. Thông tin FC (Đội bóng)</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Tên Đội bóng <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.teamName}
                                                    onChange={(e) => setRegForm({...regForm, teamName: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="VD: FC Anh Em..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Tên viết tắt (Short) <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.teamShortName}
                                                    onChange={(e) => setRegForm({...regForm, teamShortName: e.target.value.toUpperCase().slice(0, 4)})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase"
                                                    placeholder="VD: FCAE"
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">Logo Đội bóng <span className="text-gray-400 font-normal">(Tùy chọn)</span></label>
                                            <div className="flex items-start gap-4">
                                                {regForm.teamLogo ? (
                                                    <div className="relative">
                                                        <img src={regForm.teamLogo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-200 shadow-sm p-1" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setRegForm({...regForm, teamLogo: ''})} 
                                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer flex-1">
                                                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-gray-50/30">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Tải logo lên</p>
                                                            </div>
                                                        </div>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </form>

                            <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowRegisterModal(false)}
                                    className="px-5 h-10 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                    disabled={isRegistering}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    onClick={handleRegisterSubmit}
                                    disabled={isRegistering}
                                    className="px-6 h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-efb-red to-red-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    {isRegistering ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        "Xác nhận đăng ký"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
