"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Users,
    Calendar,
    ArrowRight,
    Flame,
    Clock,
    CheckCircle2,
    Sparkles,
    Gamepad2,
    CreditCard,
    MapPin,
    Loader2,
} from "lucide-react";

// Mock tournament data
const mockTournaments = [
    {
        _id: "1",
        title: "6v6 Championship Mùa Hè 2026",
        status: "registration",
        banner: "",
        teamSize: 6,
        format: "group_stage",
        currentTeams: 12,
        maxTeams: 16,
        isOnline: true,
        entryFee: 200000,
        prize: { total: 5000000 },
        schedule: {
            tournamentStart: "2026-06-15",
            tournamentEnd: "2026-07-15",
        },
    },
    {
        _id: "2",
        title: "Saigon 6v6 Open Cup #3",
        status: "ongoing",
        banner: "",
        teamSize: 6,
        format: "single_elimination",
        currentTeams: 8,
        maxTeams: 8,
        isOnline: false,
        location: "TP.HCM",
        entryFee: 500000,
        prize: { total: 10000000 },
        schedule: {
            tournamentStart: "2026-05-01",
            tournamentEnd: "2026-05-30",
        },
    },
    {
        _id: "3",
        title: "Hanoi 6v6 League Season 2",
        status: "completed",
        banner: "",
        teamSize: 6,
        format: "round_robin",
        currentTeams: 10,
        maxTeams: 10,
        isOnline: false,
        location: "Hà Nội",
        entryFee: 300000,
        prize: { total: 8000000 },
        schedule: {
            tournamentStart: "2026-03-01",
            tournamentEnd: "2026-04-30",
        },
    },
];

const statusConfig: Record<string, { label: string; icon: typeof Flame; bgClass: string }> = {
    registration: { label: "Đăng ký", icon: Clock, bgClass: "bg-amber-400 text-amber-900 border-transparent" },
    ongoing: { label: "Đang diễn ra", icon: Flame, bgClass: "bg-red-500 text-white border-transparent" },
    completed: { label: "Đã kết thúc", icon: CheckCircle2, bgClass: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    draft: { label: "Nháp", icon: Clock, bgClass: "bg-gray-200 text-gray-600 border-transparent" },
};

const formatLabels: Record<string, string> = {
    single_elimination: "Loại trực tiếp",
    double_elimination: "Loại kép",
    round_robin: "Vòng tròn",
    swiss: "Swiss System",
    group_stage: "Vòng bảng",
};

export function TournamentsShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/tournaments?limit=3")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTournaments(data.data.tournaments);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    return (
        <section ref={ref} className="py-20 lg:py-28 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80 relative overflow-hidden">
            {/* Decorations */}
            <div className="absolute top-0 right-[10%] w-52 h-52 bg-[#A01B1B]/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-[8%] w-48 h-48 bg-[#D4871A]/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A01B1B]/[0.06] border border-[#A01B1B]/[0.1] text-efb-red text-xs font-semibold tracking-wider uppercase mb-5">
                            <Sparkles className="w-3 h-3" />
                            Nổi bật
                        </span>
                        <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extralight text-efb-dark leading-tight tracking-tight">
                            Giải đấu
                            <br />
                            <span className="text-gradient-warm font-medium">nổi bật</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <Button
                            variant="outline"
                            className="border-gray-200 text-efb-text-secondary hover:text-efb-red hover:border-red-200 font-medium rounded-xl group"
                            asChild
                        >
                            <Link href="/giai-dau">
                                Xem tất cả
                                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Cards */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-efb-red" />
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Chưa có giải đấu nào</h3>
                        <p className="text-sm text-gray-500 mt-1">Các giải đấu mới sẽ sớm được cập nhật.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tournaments.map((t, i) => {
                        const stCfg = statusConfig[t.status] || statusConfig.draft;
                        const StatusIcon = stCfg.icon;
                        const prizeStr = t.prize?.total ? String(t.prize.total) : "Chưa công bố";
                        const imgUrl = t.thumbnail || t.banner;

                        return (
                            <motion.div
                                key={t._id}
                                initial={{ opacity: 0, y: 24 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <Link href={`/giai-dau/${t._id}`} className="block group">
                                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-400">
                                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#A01B1B] via-[#8B1818] to-[#5C1010] group">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Trophy className="w-16 h-16 text-white/10" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            {/* Status Badge */}
                                            <div className="absolute top-3.5 left-3.5">
                                                <Badge className={`${stCfg.bgClass} border font-semibold text-[11px] px-2.5 py-0.5 shadow-sm`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {stCfg.label}
                                                </Badge>
                                            </div>

                                            {/* Teams count overlay */}
                                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm border border-white/10">
                                                <Users className="w-3 h-3 text-white/90" />
                                                <span className="text-[11px] text-white font-semibold">{t.currentSlots || 0}/{t.maxSlots || 0}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="text-[16px] font-semibold text-efb-dark mb-3.5 group-hover:text-efb-red transition-colors duration-200 line-clamp-1">
                                                {t.title}
                                            </h3>

                                            <div className="space-y-2.5">
                                                {[
                                                    { icon: Gamepad2, label: "Thể thức", value: `${t.gameMode || "6v6"} - ${formatLabels[t.format] || t.format || "Chưa rõ"}` },
                                                    { icon: Calendar, label: "Thời gian", value: `${formatDate(t.schedule?.tournamentStart)} - ${formatDate(t.schedule?.tournamentEnd)}` },
                                                    { icon: MapPin, label: "Hình thức", value: t.isOnline ? "Online" : (t.location || "Offline") },
                                                ].map((item) => (
                                                    <div key={item.label} className="flex items-center justify-between text-[13px]">
                                                        <span className="text-efb-text-muted flex items-center gap-1.5">
                                                            <item.icon className="w-3.5 h-3.5" />
                                                            {item.label}
                                                        </span>
                                                        <span className="text-efb-text-secondary font-medium">
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 pt-3.5 border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                                        <span className="text-[11px] text-efb-text-muted font-medium">Giải thưởng</span>
                                                    </div>
                                                    <span className="text-gradient font-semibold text-[15px]">
                                                        {prizeStr}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
                )}
            </div>
        </section>
    );
}
