"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trophy, Plus, Search, Eye, EyeOff, Users, Flame, Clock, CheckCircle2,
    Loader2, Trash2, Edit, ExternalLink, CalendarPlus, ArrowRight,
    FileX, ChevronLeft, ChevronRight, MapPin, CreditCard,
    Calendar, RefreshCw, Wifi, ArrowUpDown, KeyRound, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tournamentAPI } from "@/lib/api";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 12;

const statusConfig: Record<string, { label: string; bg: string; dot: string; icon: typeof Flame }> = {
    draft: { label: "Nháp", bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400", icon: Clock },
    registration: { label: "Mở đăng ký", bg: "bg-blue-100 text-blue-700", dot: "bg-blue-500", icon: Users },
    ongoing: { label: "Đang diễn ra", bg: "bg-red-100 text-red-700", dot: "bg-red-500", icon: Flame },
    completed: { label: "Đã kết thúc", bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle2 },
    cancelled: { label: "Đã hủy", bg: "bg-gray-100 text-gray-500", dot: "bg-gray-400", icon: FileX },
};

const formatLabels: Record<string, string> = {
    single_elimination: "Loại trực tiếp",
    round_robin: "Vòng tròn",
    group_stage: "Vòng bảng",
};

export default function ManagerGiaiDauPage() {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<string>("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        if (user) loadTournaments();
    }, [user]);

    const loadTournaments = async () => {
        setIsLoading(true);
        try {
            // Use dashboardAPI stats as a workaround for now, assuming it returns recentTournaments
            const res = await fetch("/api/manager/dashboard").then(r => r.json());
            if (res.success && res.data.recentTournaments) {
                // In reality, you'd want a separate API like /api/manager/tournaments?limit=100
                setTournaments(res.data.recentTournaments || []);
            }
        } catch (error) {
            console.error("Failed to load tournaments:", error);
            toast.error("Không thể tải danh sách giải đấu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Bạn có chắc muốn xóa "${title}"?`)) return;
        try {
            // const res = await tournamentAPI.delete(id);
            // if (res.success) {
            //     setTournaments((prev) => prev.filter((t) => t._id !== id));
            //     toast.success("Đã xóa giải đấu");
            // }
            toast.error("Chức năng đang phát triển");
        } catch (error) {
            toast.error("Không thể xóa giải đấu");
        }
    };

    // Filtering, sorting, pagination
    const processed = useMemo(() => {
        let result = [...tournaments];

        if (statusFilter !== "all") {
            result = result.filter(t => t.status === statusFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(t =>
                t.title?.toLowerCase().includes(q) ||
                t.gameMode?.toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            let valA: any, valB: any;
            if (sortField === "createdAt") {
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            } else if (sortField === "title") {
                valA = (a.title || "").toLowerCase();
                valB = (b.title || "").toLowerCase();
            } else if (sortField === "currentSlots") {
                valA = a.currentSlots || 0;
                valB = b.currentSlots || 0;
            } else {
                valA = a[sortField];
                valB = b[sortField];
            }
            if (valA < valB) return sortDir === "asc" ? -1 : 1;
            if (valA > valB) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [tournaments, statusFilter, search, sortField, sortDir]);

    const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE);
    const paginated = processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

    const stats = useMemo(() => ({
        total: tournaments.length,
        draft: tournaments.filter(t => t.status === "draft").length,
        registration: tournaments.filter(t => t.status === "registration").length,
        ongoing: tournaments.filter(t => t.status === "ongoing").length,
        completed: tournaments.filter(t => t.status === "completed").length,
    }), [tournaments]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDir(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDir("desc");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-efb-red to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Đang tải giải đấu...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-efb-red to-red-600 rounded-full" />
                        Giải đấu của tôi
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 ml-4">{stats.total} giải đấu</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={loadTournaments} className="h-9 w-9 p-0 rounded-xl border-gray-200 text-gray-500 hover:text-efb-red">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Link href="/manager/tao-giai-dau">
                        <Button className="bg-gradient-to-r from-efb-red to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl h-10 px-5 shadow-md shadow-red-500/20 font-medium group">
                            <Plus className="w-4 h-4 mr-1.5" />
                            Tạo giải đấu
                            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Tổng", value: stats.total, icon: Trophy, gradient: "from-efb-red to-red-600", text: "text-red-600" },
                    { label: "Mở đăng ký", value: stats.registration, icon: Users, gradient: "from-blue-400 to-blue-500", text: "text-blue-600" },
                    { label: "Đang diễn ra", value: stats.ongoing, icon: Flame, gradient: "from-amber-500 to-orange-600", text: "text-amber-500" },
                    { label: "Đã kết thúc", value: stats.completed, icon: CheckCircle2, gradient: "from-emerald-500 to-emerald-600", text: "text-emerald-600" },
                ].map((s) => (
                    <Card key={s.label} className="py-0 border-gray-100/80 hover:shadow-md transition-all duration-300 group cursor-default overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                    <s.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className={`text-2xl font-extrabold ${s.text} tracking-tight tabular-nums`}>{s.value}</div>
                            </div>
                            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm giải đấu..." className="pl-9 h-10 rounded-xl border-gray-200 focus-visible:ring-efb-red/30 focus-visible:border-efb-red" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-hide">
                        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-max">
                            <TabsList className="h-10 rounded-xl bg-gray-100/80 p-1 gap-0.5">
                                <TabsTrigger value="all" className="rounded-lg text-xs font-semibold px-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Tất cả</TabsTrigger>
                                <TabsTrigger value="draft" className="rounded-lg text-xs font-semibold px-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Nháp</TabsTrigger>
                                <TabsTrigger value="registration" className="rounded-lg text-xs font-semibold px-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Đăng ký</TabsTrigger>
                                <TabsTrigger value="ongoing" className="rounded-lg text-xs font-semibold px-2.5 data-[state=active]:bg-white data-[state=active]:text-red-500 data-[state=active]:shadow-sm">Đang diễn ra</TabsTrigger>
                                <TabsTrigger value="completed" className="rounded-lg text-xs font-semibold px-2.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Kết thúc</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <button onClick={() => handleSort("createdAt")} className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg border transition-colors whitespace-nowrap flex-shrink-0 ${sortField === "createdAt" ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                            <Calendar className="w-3 h-3" />Ngày tạo<ArrowUpDown className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleSort("title")} className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg border transition-colors whitespace-nowrap flex-shrink-0 ${sortField === "title" ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                            Tên<ArrowUpDown className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleSort("currentSlots")} className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg border transition-colors whitespace-nowrap flex-shrink-0 ${sortField === "currentSlots" ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                            <Users className="w-3 h-3" />Đội<ArrowUpDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tournament List */}
            {processed.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4"><Trophy className="w-7 h-7 text-gray-300" /></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{search ? "Không tìm thấy giải đấu" : "Chưa có giải đấu nào"}</h3>
                    {!search && (
                        <Link href="/manager/tao-giai-dau">
                            <Button className="bg-gradient-to-r from-efb-red to-red-600 text-white rounded-xl h-10 px-6 font-medium mt-4 group shadow-md shadow-red-500/20">
                                <CalendarPlus className="w-4 h-4 mr-2" /> Tạo giải đấu
                            </Button>
                        </Link>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginated.map((t, i) => {
                        const sty = statusConfig[t.status] || statusConfig.draft;
                        const startDate = t.schedule?.tournamentStart ? new Date(t.schedule.tournamentStart).toLocaleDateString("vi-VN") : null;
                        const progress = t.maxSlots ? Math.min(100, ((t.currentSlots || 0) / t.maxSlots) * 100) : 0;

                        return (
                            <motion.div key={t._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group flex flex-col">
                                <div className={`px-4 py-2 flex items-center justify-between ${sty.bg}`}>
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold">
                                        <span className={`w-1.5 h-1.5 rounded-full ${sty.dot} ${t.status === "ongoing" ? "animate-pulse" : ""}`} />
                                        {sty.label}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {t.isPublic === false && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded"><EyeOff className="w-2.5 h-2.5" /> Đã ẩn</span>
                                        )}
                                        <Link href={`/manager/giai-dau/${t._id}`}><button className="w-6 h-6 rounded-md bg-white/60 hover:bg-white flex items-center justify-center text-gray-600 hover:text-efb-red transition-colors"><Edit className="w-3 h-3" /></button></Link>
                                        <Link href={`/giai-dau/${t._id}`} target="_blank"><button className="w-6 h-6 rounded-md bg-white/60 hover:bg-white flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"><ExternalLink className="w-3 h-3" /></button></Link>
                                        <button onClick={() => handleDelete(t._id, t.title)} className="w-6 h-6 rounded-md bg-white/60 hover:bg-white flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <Link href={`/manager/giai-dau/${t._id}`} className="text-sm font-bold text-gray-900 hover:text-efb-red transition-colors line-clamp-2 leading-snug">{t.title}</Link>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                        <Badge variant="outline" className="text-[9px] font-medium bg-slate-50 text-gray-500 border-gray-200 rounded px-1.5 py-0">{formatLabels[t.format] || t.format}</Badge>
                                        <Badge variant="outline" className="text-[9px] font-medium bg-red-50 text-red-600 border-red-100 rounded px-1.5 py-0">{t.gameMode}</Badge>
                                        {t.prize?.total && t.prize.total !== "0 VNĐ" && (
                                            <Badge variant="outline" className="text-[9px] font-bold bg-amber-50 text-amber-600 border-amber-100 rounded px-1.5 py-0">🏆 {t.prize.total}</Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50">
                                        <div className="text-center">
                                            <div className="text-lg font-extrabold text-gray-900 tabular-nums">{t.currentSlots || 0}</div>
                                            <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">/ {t.maxSlots || 0} đội</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-extrabold text-gray-900 tabular-nums">{t.views || 0}</div>
                                            <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">views</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-extrabold text-gray-900 tabular-nums">{t.isOnline ? "On" : "Off"}</div>
                                            <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Hình thức</div>
                                        </div>
                                    </div>
                                    {t.maxSlots > 0 && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] text-gray-400">Đăng ký</span>
                                                <span className="text-[10px] font-bold text-gray-600">{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-efb-red rounded-full" style={{ width: `${progress}%` }} /></div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
