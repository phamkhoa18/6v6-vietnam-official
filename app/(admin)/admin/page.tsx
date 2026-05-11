"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, ShieldAlert, Activity, FileText, CheckCircle2, TrendingUp, Gamepad2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await adminAPI.getStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Failed to load admin stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
            </div>
        );
    }

    const cards = [
        { label: "Tổng người dùng", value: stats?.users?.total || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Quản lý / Manager", value: stats?.users?.roles?.manager || 0, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Giải đấu hệ thống", value: stats?.tournaments?.total || 0, icon: Trophy, color: "text-red-600", bg: "bg-red-50" },
        { label: "Đội đã xác thực", value: stats?.teams?.total || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    const tStats = stats?.tournaments?.statusBreakdown || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Tổng quan hệ thống 6v6 Vietnam</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-gray-900 tracking-tight">{card.value}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">{card.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">Trạng thái giải đấu</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-sm text-gray-600">Đang diễn ra</span></div><span className="text-sm font-semibold text-gray-900">{tStats.ongoing || 0}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-sm text-gray-600">Mở đăng ký</span></div><span className="text-sm font-semibold text-gray-900">{tStats.registration || 0}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-gray-400" /><span className="text-sm text-gray-600">Nháp</span></div><span className="text-sm font-semibold text-gray-900">{tStats.draft || 0}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-sm text-gray-600">Đã kết thúc</span></div><span className="text-sm font-semibold text-gray-900">{tStats.completed || 0}</span></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">Hoạt động gần đây</h2>
                    <div className="flex flex-col items-center justify-center py-10">
                        <Activity className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">Hệ thống đang thu thập dữ liệu log</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
