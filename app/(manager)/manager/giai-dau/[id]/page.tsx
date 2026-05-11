"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, Gamepad2, Settings, ChevronLeft, MapPin, Loader2, PlayCircle, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function TournamentOverview() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useAuth();
    
    // In reality, fetch from API
    const [isLoading, setIsLoading] = useState(true);
    const [tournament, setTournament] = useState<any>(null);

    useEffect(() => {
        // Mock fetch
        setTimeout(() => {
            setTournament({
                _id: id,
                title: "6v6 Hanoi Open 2026",
                status: "draft",
                format: "group_stage",
                gameMode: "6v6",
                maxSlots: 16,
                currentSlots: 4,
                views: 120,
                isOnline: false,
                location: "Sân bóng Đại học Y, Tôn Thất Tùng, Hà Nội",
                schedule: {
                    tournamentStart: "2026-06-01T00:00:00.000Z",
                    tournamentEnd: "2026-06-30T00:00:00.000Z"
                }
            });
            setIsLoading(false);
        }, 500);
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-efb-red mb-4" />
                <p className="text-sm text-gray-500">Đang tải thông tin giải đấu...</p>
            </div>
        );
    }

    if (!tournament) return <div>Không tìm thấy giải đấu</div>;

    const quickActions = [
        { label: "Đăng ký thi đấu", href: `/manager/giai-dau/${id}/dang-ky`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Lịch thi đấu", href: `/manager/giai-dau/${id}/lich`, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Cài đặt giải đấu", href: `/manager/giai-dau/${id}/cai-dat`, icon: Settings, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Trophy className="w-32 h-32" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/manager/giai-dau">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-efb-dark">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Danh sách
                            </Button>
                        </Link>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${tournament.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                            {tournament.status === 'draft' ? 'NHÁP' : 'MỞ ĐĂNG KÝ'}
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Gamepad2 className="w-4 h-4" /> {tournament.gameMode}</span>
                        {!tournament.isOnline && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {tournament.location || "Chưa cập nhật"}</span>}
                        {tournament.schedule?.tournamentStart && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> 
                                {new Date(tournament.schedule.tournamentStart).toLocaleDateString("vi-VN")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Đội tham gia", value: `${tournament.currentSlots}/${tournament.maxSlots}`, icon: Users, color: "text-blue-600" },
                    { label: "Trận đấu", value: "0", icon: PlayCircle, color: "text-red-600" },
                    { label: "Lượt xem", value: tournament.views, icon: Eye, color: "text-emerald-600" },
                    { label: "Hoàn thành", value: "0%", icon: Trophy, color: "text-amber-600" },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                            <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Truy cập nhanh</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quickActions.map((action, i) => (
                        <Link key={i} href={action.href}>
                            <motion.div whileHover={{ y: -2 }} className={`p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors cursor-pointer`}>
                                <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                                    <action.icon className={`w-5 h-5 ${action.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">{action.label}</h3>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
