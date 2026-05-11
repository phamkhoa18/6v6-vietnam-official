"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Trophy, Users, Gamepad2, CalendarPlus, ArrowRight,
    Eye, Loader2, AlertCircle, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI } from "@/lib/api";

const statusStyles: Record<string, { label: string; bg: string }> = {
    live: { label: "Live", bg: "bg-red-500 text-white border-transparent" },
    ongoing: { label: "Đang diễn ra", bg: "bg-red-500 text-white border-transparent" },
    registration: { label: "Đăng ký", bg: "bg-blue-500 text-white border-transparent" },
    upcoming: { label: "Sắp tới", bg: "bg-amber-400 text-amber-900 border-transparent" },
    draft: { label: "Nháp", bg: "bg-gray-200 text-gray-600 border-transparent" },
    completed: { label: "Hoàn thành", bg: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    cancelled: { label: "Hủy", bg: "bg-red-50 text-red-600 border-red-200" },
};

export default function ManagerDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await dashboardAPI.getStats();
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to load dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-efb-red mx-auto mb-3" />
                    <p className="text-sm text-efb-text-muted">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    const overview = data?.overview || {
        totalTournaments: 0,
        totalTeams: 0,
        totalMatches: 0,
        totalViews: 0,
        pendingRegistrations: 0,
    };

    const statsCards = [
        {
            label: "Giải đấu",
            value: overview.totalTournaments,
            icon: Trophy,
            gradient: "from-efb-red to-red-600",
            bg: "bg-red-50",
            iconColor: "text-red-600",
        },
        {
            label: "Tổng đội tham gia",
            value: overview.totalTeams,
            icon: Users,
            gradient: "from-blue-500 to-indigo-600",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            label: "Trận đấu",
            value: overview.totalMatches,
            icon: Gamepad2,
            gradient: "from-amber-400 to-orange-500",
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            label: "Lượt xem",
            value: overview.totalViews >= 1000
                ? `${(overview.totalViews / 1000).toFixed(1)}K`
                : overview.totalViews,
            icon: Eye,
            gradient: "from-emerald-400 to-teal-500",
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
    ];

    const recentTournaments = data?.recentTournaments || [];
    const statusBreakdown = data?.statusBreakdown || {};

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-light text-efb-dark tracking-tight"
                    >
                        Xin chào, <span className="font-semibold">{user?.name || "Manager"}</span>
                    </motion.h1>
                    <p className="text-sm text-efb-text-muted mt-1">
                        Tổng quan về các giải đấu của bạn
                    </p>
                </div>
                <Link href="/manager/tao-giai-dau">
                    <Button className="bg-efb-red text-white hover:bg-efb-red-light rounded-xl h-10 px-5 shadow-sm group">
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Tạo giải đấu
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm group hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div
                                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                            >
                                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-efb-dark tracking-tight">
                            {stat.value}
                        </div>
                        <div className="text-xs text-efb-text-muted mt-1 flex items-center gap-1">
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pending Registrations Alert */}
            {overview.pendingRegistrations > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="text-sm">
                        <span className="font-semibold text-amber-700">
                            {overview.pendingRegistrations} đơn đăng ký
                        </span>{" "}
                        <span className="text-amber-600">đang chờ duyệt</span>
                    </div>
                </motion.div>
            )}

            {/* Recent Tournaments & Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Tournaments */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-efb-dark">
                            Giải đấu gần đây
                        </h2>
                        <Link
                            href="/manager/giai-dau"
                            className="text-xs text-efb-red hover:text-efb-red-light font-medium flex items-center gap-1 transition-colors"
                        >
                            Xem tất cả
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentTournaments.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-efb-text-muted">
                                Bạn chưa tạo giải đấu nào
                            </p>
                            <Link href="/manager/tao-giai-dau">
                                <Button className="mt-4 bg-efb-red text-white hover:bg-efb-red-light rounded-xl h-9 px-4 text-sm">
                                    Tạo giải đấu đầu tiên
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentTournaments.map((t: any, i: number) => {
                                const sty = statusStyles[t.status] || statusStyles.draft;
                                return (
                                    <motion.div
                                        key={t._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            href={`/manager/giai-dau/${t._id}`}
                                            className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                                <Trophy className="w-5 h-5 text-efb-red" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-efb-dark truncate group-hover:text-efb-red transition-colors">
                                                    {t.title}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sty.bg}`}
                                                    >
                                                        {sty.label}
                                                    </span>
                                                    <span className="text-[11px] text-efb-text-muted">
                                                        {t.currentSlots || 0}/{t.maxSlots} đội
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xs text-efb-text-muted flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {t.views || 0}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-efb-dark mb-5">
                        Phân loại trạng thái
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(statusBreakdown).map(
                            ([key, value]: [string, any]) => {
                                const sty = statusStyles[key] || statusStyles.draft;
                                return (
                                    <div key={key} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={`w-2 h-2 rounded-full ${key === "ongoing"
                                                    ? "bg-red-500"
                                                    : key === "registration"
                                                        ? "bg-blue-500"
                                                        : key === "draft"
                                                            ? "bg-gray-400"
                                                            : key === "completed"
                                                                ? "bg-emerald-500"
                                                                : "bg-red-300"
                                                    }`}
                                            />
                                            <span className="text-sm text-efb-text-secondary">
                                                {sty.label}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-efb-dark">
                                            {value}
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
