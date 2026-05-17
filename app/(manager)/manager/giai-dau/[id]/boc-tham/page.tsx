"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Shuffle, Shield, Trophy, CheckCircle2, AlertTriangle, Swords, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tournamentAPI } from "@/lib/api";
import { toast } from "sonner";

export default function TournamentDraw() {
    const { id } = useParams() as { id: string };
    const [tournament, setTournament] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawResult, setDrawResult] = useState<any>(null);
    const [animatingDraw, setAnimatingDraw] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await tournamentAPI.getById(id);
            if (res.success) {
                setTournament(res.data.tournament);
                setParticipants(res.data.participants || []);
                setMatches(res.data.matches || []);
            }
        } catch { toast.error("Lỗi tải dữ liệu"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const executeDraw = async () => {
        const activeParticipants = participants.filter(p => p.status === "active");
        if (activeParticipants.length < 2) {
            toast.error("Cần ít nhất 2 đội/cầu thủ đã duyệt để bóc thăm");
            return;
        }
        if (matches.length > 0) {
            if (!confirm("Đã có lịch thi đấu. Bóc thăm lại sẽ xóa toàn bộ trận đấu cũ. Tiếp tục?")) return;
        }

        setAnimatingDraw(true);
        // Animation delay
        await new Promise(r => setTimeout(r, 2000));
        setAnimatingDraw(false);
        setIsDrawing(true);

        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/draw`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ mode: "auto" }),
            }).then(r => r.json());

            if (res.success) {
                setDrawResult(res.data);
                toast.success(res.message || "Bóc thăm thành công!");
                load(); // Reload to get updated data
            } else {
                toast.error(res.message || "Bóc thăm thất bại");
            }
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setIsDrawing(false);
        }
    };

    const isTeam = tournament?.gameMode !== "1v1";
    const activeCount = participants.filter(p => p.status === "active").length;
    const hasExistingDraw = matches.length > 0;

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>;
    if (!tournament) return null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Bóc thăm chia bảng</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    {tournament.format === "single_elimination" ? "Bóc thăm vị trí trong cây đấu loại trực tiếp" :
                     tournament.format === "round_robin" ? "Bóc thăm thứ tự thi đấu vòng tròn" :
                     "Bóc thăm chia bảng và tạo lịch thi đấu"}
                </p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-1">Thể thức</div>
                    <div className="text-sm font-bold text-gray-900">
                        {tournament.format === "single_elimination" ? "Loại trực tiếp" :
                         tournament.format === "round_robin" ? "Vòng tròn" : "Vòng bảng + Loại"}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-1">{isTeam ? "Đội đã duyệt" : "Cầu thủ đã duyệt"}</div>
                    <div className="text-sm font-bold text-gray-900">{activeCount} / {tournament.maxSlots}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-1">Trạng thái</div>
                    <div className="text-sm font-bold">
                        {hasExistingDraw ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Đã bóc thăm</span> : <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" />Chưa bóc thăm</span>}
                    </div>
                </div>
            </div>

            {/* Current participants */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-3">
                    {isTeam ? "Danh sách đội" : "Danh sách cầu thủ"} ({activeCount})
                </h2>
                {activeCount === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Chưa có {isTeam ? "đội" : "cầu thủ"} nào được duyệt.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {participants.filter(p => p.status === "active").map((p, i) => (
                            <motion.div
                                key={p._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                                    p.group ? "bg-blue-50/50 border-blue-100" : "bg-gray-50 border-gray-100"
                                }`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center flex-shrink-0">
                                    {isTeam ? <Shield className="w-4 h-4 text-gray-400" /> : <User className="w-4 h-4 text-gray-400" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-gray-900 truncate">{isTeam ? p.name : (p.user?.name || "N/A")}</div>
                                    <div className="text-[10px] text-gray-400">
                                        {p.seed ? `Seed ${p.seed}` : ""}
                                        {p.group ? ` • Bảng ${p.group}` : ""}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Draw button */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                {/* Animation overlay */}
                <AnimatePresence>
                    {animatingDraw && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                className="w-32 h-32 rounded-3xl bg-gradient-to-br from-efb-red to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/40"
                            >
                                <Shuffle className="w-16 h-16 text-white" />
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute bottom-1/3 text-white text-lg font-bold"
                            >
                                Đang bóc thăm...
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-efb-red to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
                    <Swords className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {hasExistingDraw ? "Bóc thăm lại" : "Bóc thăm ngẫu nhiên"}
                </h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                    {hasExistingDraw
                        ? "Giải đấu đã được bóc thăm. Bóc thăm lại sẽ xóa toàn bộ trận đấu và kết quả cũ."
                        : "Hệ thống sẽ tự động chia bảng và tạo lịch thi đấu dựa trên thể thức giải đấu."
                    }
                </p>

                <Button
                    onClick={executeDraw}
                    disabled={isDrawing || animatingDraw || activeCount < 2}
                    className="h-12 px-8 rounded-xl text-sm font-bold bg-gradient-to-r from-efb-red to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/20 disabled:opacity-50"
                >
                    {isDrawing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Shuffle className="w-5 h-5 mr-2" />}
                    {hasExistingDraw ? "Bóc thăm lại" : "Bóc thăm ngẫu nhiên"}
                </Button>

                {activeCount < 2 && (
                    <p className="text-xs text-red-500 mt-3">Cần ít nhất 2 {isTeam ? "đội" : "cầu thủ"} đã duyệt để bóc thăm.</p>
                )}
            </div>

            {/* Draw result summary */}
            {drawResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-sm font-bold text-emerald-800">Bóc thăm thành công!</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {drawResult.groups?.length > 0 && (
                            <div className="text-sm text-emerald-700"><strong>{drawResult.groups.length}</strong> bảng đấu</div>
                        )}
                        <div className="text-sm text-emerald-700"><strong>{drawResult.totalMatches}</strong> trận đấu đã tạo</div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
