"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Plus, Loader2, Clock, CheckCircle2, PlayCircle, Ban,
    Shield, Swords, X, Save, RefreshCw, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const matchStatusCfg: Record<string, { label: string; bg: string; icon: typeof Clock }> = {
    scheduled: { label: "Chưa đấu", bg: "bg-gray-100 text-gray-600", icon: Clock },
    live: { label: "Đang đấu", bg: "bg-red-100 text-red-600", icon: PlayCircle },
    completed: { label: "Đã xong", bg: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    cancelled: { label: "Đã hủy", bg: "bg-gray-100 text-gray-400", icon: Ban },
};

export default function TournamentSchedule() {
    const { id } = useParams() as { id: string };
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roundFilter, setRoundFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editingMatch, setEditingMatch] = useState<any>(null);
    const [scoreA, setScoreA] = useState("0");
    const [scoreB, setScoreB] = useState("0");
    const [penA, setPenA] = useState("");
    const [penB, setPenB] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/matches`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }).then(r => r.json());
            if (res.success) setMatches(res.data.matches);
        } catch { toast.error("Không thể tải"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const rounds = useMemo(() => {
        const r = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
        return r;
    }, [matches]);

    const groups = useMemo(() => {
        const g = [...new Set(matches.filter(m => m.group).map(m => m.group))].sort();
        return g;
    }, [matches]);

    const filtered = useMemo(() => {
        let r = [...matches];
        if (roundFilter !== "all") r = r.filter(m => m.round === parseInt(roundFilter));
        if (statusFilter !== "all") r = r.filter(m => m.status === statusFilter);
        return r;
    }, [matches, roundFilter, statusFilter]);

    const groupedByRound = useMemo(() => {
        const map: Record<number, any[]> = {};
        filtered.forEach(m => {
            if (!map[m.round]) map[m.round] = [];
            map[m.round].push(m);
        });
        return map;
    }, [filtered]);

    const openScoreEdit = (match: any) => {
        setEditingMatch(match);
        setScoreA(String(match.scoreA || 0));
        setScoreB(String(match.scoreB || 0));
        setPenA(match.penaltyA !== undefined ? String(match.penaltyA) : "");
        setPenB(match.penaltyB !== undefined ? String(match.penaltyB) : "");
    };

    const saveScore = async () => {
        if (!editingMatch) return;
        setIsSaving(true);
        try {
            const sA = parseInt(scoreA) || 0;
            const sB = parseInt(scoreB) || 0;
            const body: any = {
                scoreA: sA, scoreB: sB, status: "completed",
                winner: sA > sB ? "A" : sB > sA ? "B" : undefined,
                resultType: "regular",
            };
            if (penA && penB) {
                body.penaltyA = parseInt(penA) || 0;
                body.penaltyB = parseInt(penB) || 0;
                body.winner = body.penaltyA > body.penaltyB ? "A" : "B";
                body.resultType = "penalty";
            }
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/matches/${editingMatch._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(body),
            }).then(r => r.json());
            if (res.success) {
                // Calculate points for display
                let ptsA = 0, ptsB = 0;
                const nameA = getTeamName(editingMatch, "A");
                const nameB = getTeamName(editingMatch, "B");
                if (sA > sB) { ptsA = 3; ptsB = 0; }
                else if (sB > sA) { ptsA = 0; ptsB = 3; }
                else if (body.resultType === "penalty") {
                    ptsA = body.winner === "A" ? 2 : 1;
                    ptsB = body.winner === "B" ? 2 : 1;
                }
                
                setMatches(prev => prev.map(m => m._id === editingMatch._id ? { ...m, ...body, pointsA: ptsA, pointsB: ptsB } : m));
                setEditingMatch(null);
                toast.success(`Đã lưu kết quả · ${nameA} +${ptsA}đ, ${nameB} +${ptsB}đ`);
            } else toast.error(res.message);
        } catch { toast.error("Lỗi"); }
        finally { setIsSaving(false); }
    };

    const getTeamName = (match: any, side: "A" | "B") => {
        const team = side === "A" ? match.teamA : match.teamB;
        const player = side === "A" ? match.playerA : match.playerB;
        if (team) return team.shortName || team.name || "TBD";
        if (player) return player.nickname || player.name || "TBD";
        return "TBD";
    };

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Lịch thi đấu</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{matches.length} trận đấu • {matches.filter(m => m.status === "completed").length} đã hoàn thành</p>
                </div>
                <Button variant="outline" onClick={load} className="h-9 rounded-xl"><RefreshCw className="w-4 h-4 mr-1.5" />Làm mới</Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                    <button onClick={() => setRoundFilter("all")} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${roundFilter === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Tất cả vòng</button>
                    {rounds.map(r => (
                        <button key={r} onClick={() => setRoundFilter(String(r))} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${roundFilter === String(r) ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Vòng {r}</button>
                    ))}
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                    {[{ k: "all", l: "Tất cả" }, { k: "scheduled", l: "Chưa đấu" }, { k: "completed", l: "Đã xong" }].map(f => (
                        <button key={f.k} onClick={() => setStatusFilter(f.k)} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${statusFilter === f.k ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>{f.l}</button>
                    ))}
                </div>
            </div>

            {/* Matches by round */}
            {matches.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có trận đấu</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">Hãy vào trang "Bóc thăm" để tạo các cặp đấu cho giải.</p>
                </div>
            ) : (
                Object.entries(groupedByRound).map(([round, roundMatches]) => (
                    <div key={round}>
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-efb-red/10 flex items-center justify-center"><span className="text-[10px] font-black text-efb-red">{round}</span></div>
                            Vòng {round}
                            <span className="text-gray-400 font-normal">({roundMatches.length} trận)</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {roundMatches.map((m: any) => {
                                const cfg = matchStatusCfg[m.status] || matchStatusCfg.scheduled;
                                const StatusIcon = cfg.icon;
                                return (
                                    <motion.div key={m._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                                        onClick={() => m.status !== "cancelled" && openScoreEdit(m)}
                                    >
                                        <div className={`px-4 py-1.5 flex items-center justify-between text-[10px] font-bold ${cfg.bg}`}>
                                            <span className="flex items-center gap-1"><StatusIcon className="w-3 h-3" />{cfg.label}</span>
                                            {m.group && <span className="bg-white/60 px-1.5 py-0.5 rounded text-[9px]">Bảng {m.group}</span>}
                                            <span>Trận {m.matchNumber}</span>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex-1 text-center">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1.5 ${m.status === 'completed' && m.winner === 'A' ? 'bg-emerald-50' : 'bg-gray-50'}`}><Shield className={`w-5 h-5 ${m.status === 'completed' && m.winner === 'A' ? 'text-emerald-500' : 'text-gray-300'}`} /></div>
                                                <div className="text-xs font-bold text-gray-900 truncate">{getTeamName(m, "A")}</div>
                                                {m.status === 'completed' && <div className={`text-[10px] font-bold mt-0.5 ${m.winner === 'A' ? 'text-emerald-600' : m.resultType === 'penalty' && m.winner === 'B' ? 'text-orange-500' : 'text-gray-400'}`}>+{m.pointsA ?? (m.winner === 'A' ? (m.resultType === 'penalty' ? 2 : 3) : m.resultType === 'penalty' ? 1 : 0)}đ</div>}
                                            </div>
                                            <div className="px-4 text-center">
                                                {m.status === "completed" ? (
                                                    <div>
                                                        <div className="text-2xl font-black text-gray-900 tabular-nums">{m.scoreA} - {m.scoreB}</div>
                                                        {m.penaltyA !== undefined && <div className="text-[10px] text-gray-400">Pen: {m.penaltyA} - {m.penaltyB}</div>}
                                                    </div>
                                                ) : (
                                                    <div className="text-lg font-bold text-gray-300">VS</div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1.5 ${m.status === 'completed' && m.winner === 'B' ? 'bg-emerald-50' : 'bg-gray-50'}`}><Shield className={`w-5 h-5 ${m.status === 'completed' && m.winner === 'B' ? 'text-emerald-500' : 'text-gray-300'}`} /></div>
                                                <div className="text-xs font-bold text-gray-900 truncate">{getTeamName(m, "B")}</div>
                                                {m.status === 'completed' && <div className={`text-[10px] font-bold mt-0.5 ${m.winner === 'B' ? 'text-emerald-600' : m.resultType === 'penalty' && m.winner === 'A' ? 'text-orange-500' : 'text-gray-400'}`}>+{m.pointsB ?? (m.winner === 'B' ? (m.resultType === 'penalty' ? 2 : 3) : m.resultType === 'penalty' ? 1 : 0)}đ</div>}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* Score Edit Modal */}
            <AnimatePresence>
                {editingMatch && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditingMatch(null)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-900">Nhập kết quả</h3>
                                <button onClick={() => setEditingMatch(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-5 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 text-center">
                                        <div className="text-sm font-bold text-gray-900 mb-2">{getTeamName(editingMatch, "A")}</div>
                                        <Input value={scoreA} onChange={e => setScoreA(e.target.value.replace(/\D/g, ""))} className="h-14 text-center text-3xl font-black" inputMode="numeric" />
                                    </div>
                                    <div className="text-lg font-bold text-gray-300 pt-6">-</div>
                                    <div className="flex-1 text-center">
                                        <div className="text-sm font-bold text-gray-900 mb-2">{getTeamName(editingMatch, "B")}</div>
                                        <Input value={scoreB} onChange={e => setScoreB(e.target.value.replace(/\D/g, ""))} className="h-14 text-center text-3xl font-black" inputMode="numeric" />
                                    </div>
                                </div>
                                {scoreA === scoreB && (
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                        <Label className="text-xs font-semibold text-amber-700 mb-2 block">Penalty (nếu hòa)</Label>
                                        <div className="flex items-center gap-4">
                                            <Input value={penA} onChange={e => setPenA(e.target.value.replace(/\D/g, ""))} placeholder="0" className="h-10 text-center text-lg font-bold" inputMode="numeric" />
                                            <span className="text-gray-400 font-bold">-</span>
                                            <Input value={penB} onChange={e => setPenB(e.target.value.replace(/\D/g, ""))} placeholder="0" className="h-10 text-center text-lg font-bold" inputMode="numeric" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 border-t border-gray-100 flex gap-3">
                                <Button variant="outline" onClick={() => setEditingMatch(null)} className="flex-1 rounded-xl h-11">Hủy</Button>
                                <Button onClick={saveScore} disabled={isSaving} className="flex-1 rounded-xl h-11 bg-efb-red text-white hover:bg-red-700">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Lưu kết quả
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
