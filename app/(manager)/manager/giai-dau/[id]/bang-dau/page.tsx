"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Trophy, Shield, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tournamentAPI } from "@/lib/api";
import { toast } from "sonner";

const formColors: Record<string, string> = {
    W: "bg-emerald-500 text-white",
    D: "bg-gray-400 text-white",
    L: "bg-red-500 text-white",
    PW: "bg-emerald-400 text-white",
    PL: "bg-orange-400 text-white",
};

export default function TournamentBrackets() {
    const { id } = useParams() as { id: string };
    const [tournament, setTournament] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"groups" | "bracket">("groups");

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

    const isTeam = tournament?.gameMode !== "1v1";

    // Group standings
    const groups = useMemo(() => {
        const grpMap: Record<string, any[]> = {};
        participants.forEach(p => {
            const g = p.group || "—";
            if (!grpMap[g]) grpMap[g] = [];
            grpMap[g].push(p);
        });
        // Sort each group by points, then goal diff, then goals for
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

    // Bracket rounds
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

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>;
    if (!tournament) return <div className="text-center py-20 text-gray-500">Không tìm thấy giải đấu</div>;

    const hasGroups = Object.keys(groups).length > 0 && Object.keys(groups)[0] !== "—";
    const hasBracket = Object.keys(bracketRounds).length > 0;
    const format = tournament.format;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Bảng đấu</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {format === "single_elimination" ? "Thể thức loại trực tiếp" : format === "round_robin" ? "Thể thức vòng tròn" : "Vòng bảng + Loại trực tiếp"}
                    </p>
                </div>
                <Button variant="outline" onClick={load} className="h-9 rounded-xl"><RefreshCw className="w-4 h-4 mr-1.5" />Làm mới</Button>
            </div>

            {/* Tab switch for group_stage */}
            {format === "group_stage" && (
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                    <button onClick={() => setActiveTab("groups")} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "groups" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Vòng bảng</button>
                    <button onClick={() => setActiveTab("bracket")} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "bracket" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Vòng loại trực tiếp</button>
                </div>
            )}

            {/* No data */}
            {!hasGroups && !hasBracket && participants.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bảng đấu</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto">Hãy đến trang "Bóc thăm" để tạo bảng đấu và chia bảng cho các đội.</p>
                </div>
            )}

            {/* GROUP STANDINGS */}
            {(format === "round_robin" || (format === "group_stage" && activeTab === "groups")) && hasGroups && (
                <div className="space-y-6">
                    {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, teams]) => (
                        <div key={groupName} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-efb-red/10 flex items-center justify-center"><span className="text-xs font-black text-efb-red">{groupName}</span></div>
                                <h3 className="text-sm font-bold text-gray-900">Bảng {groupName}</h3>
                                <span className="text-xs text-gray-400 ml-auto">{teams.length} đội</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-[10px] font-semibold text-gray-400 uppercase border-b border-gray-50">
                                            <th className="px-4 py-2.5 text-left w-8">#</th>
                                            <th className="px-4 py-2.5 text-left">Đội</th>
                                            <th className="px-4 py-2.5 text-center">Tr</th>
                                            <th className="px-4 py-2.5 text-center">T</th>
                                            <th className="px-4 py-2.5 text-center">H</th>
                                            <th className="px-4 py-2.5 text-center">B</th>
                                            <th className="px-4 py-2.5 text-center text-emerald-500" title="Thắng Penalty">TP</th>
                                            <th className="px-4 py-2.5 text-center text-orange-500" title="Thua Penalty">TB</th>
                                            <th className="px-4 py-2.5 text-center">BT</th>
                                            <th className="px-4 py-2.5 text-center">BB</th>
                                            <th className="px-4 py-2.5 text-center">HS</th>
                                            <th className="px-4 py-2.5 text-center font-bold">Đ</th>
                                            <th className="px-4 py-2.5 text-center">Form</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {teams.map((t: any, idx: number) => {
                                            const s = t.stats || {};
                                            const advanceCount = tournament.scoring?.advancePerGroup || 2;
                                            const isAdvancing = idx < advanceCount;
                                            return (
                                                <tr key={t._id} className={`transition-colors ${isAdvancing ? "bg-emerald-50/30" : ""}`}>
                                                    <td className="px-4 py-2.5">
                                                        <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${isAdvancing ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>{idx + 1}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                                            <span className="font-semibold text-gray-900">{isTeam ? t.name : (t.user?.name || "N/A")}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center text-gray-600">{s.played || 0}</td>
                                                    <td className="px-4 py-2.5 text-center text-emerald-600 font-medium">{s.wins || 0}</td>
                                                    <td className="px-4 py-2.5 text-center text-gray-500">{s.draws || 0}</td>
                                                    <td className="px-4 py-2.5 text-center text-red-500">{s.losses || 0}</td>
                                                    <td className="px-4 py-2.5 text-center text-emerald-500 font-medium">{s.penaltyWins || 0}</td>
                                                    <td className="px-4 py-2.5 text-center text-orange-500 font-medium">{s.penaltyLosses || 0}</td>
                                                    <td className="px-4 py-2.5 text-center text-gray-600">{s.goalsFor || 0}</td>
                                                    <td className="px-4 py-2.5 text-center text-gray-600">{s.goalsAgainst || 0}</td>
                                                    <td className="px-4 py-2.5 text-center font-medium text-gray-700">{s.goalDifference || 0}</td>
                                                    <td className="px-4 py-2.5 text-center font-black text-gray-900">{s.points || 0}</td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center justify-center gap-0.5">
                                                            {(s.form || []).slice(-5).map((f: string, fi: number) => (
                                                                <span key={fi} className={`w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center ${formColors[f] || "bg-gray-200"}`}>{f}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ROUND ROBIN — show all as one group if no actual groups */}
            {format === "round_robin" && !hasGroups && participants.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900">Bảng xếp hạng</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-semibold text-gray-400 uppercase border-b border-gray-50">
                                    <th className="px-4 py-2.5 text-left w-8">#</th>
                                    <th className="px-4 py-2.5 text-left">Đội</th>
                                    <th className="px-4 py-2.5 text-center">Tr</th>
                                    <th className="px-4 py-2.5 text-center">T</th>
                                    <th className="px-4 py-2.5 text-center">H</th>
                                    <th className="px-4 py-2.5 text-center">B</th>
                                    <th className="px-4 py-2.5 text-center text-emerald-500" title="Thắng Penalty">TP</th>
                                    <th className="px-4 py-2.5 text-center text-orange-500" title="Thua Penalty">TB</th>
                                    <th className="px-4 py-2.5 text-center">HS</th>
                                    <th className="px-4 py-2.5 text-center font-bold">Đ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[...participants].sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0)).map((t: any, idx: number) => (
                                    <tr key={t._id}>
                                        <td className="px-4 py-2.5"><span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-500">{idx + 1}</span></td>
                                        <td className="px-4 py-2.5 font-semibold text-gray-900">{isTeam ? t.name : (t.user?.name || "N/A")}</td>
                                        <td className="px-4 py-2.5 text-center">{t.stats?.played || 0}</td>
                                        <td className="px-4 py-2.5 text-center text-emerald-600">{t.stats?.wins || 0}</td>
                                        <td className="px-4 py-2.5 text-center">{t.stats?.draws || 0}</td>
                                        <td className="px-4 py-2.5 text-center text-red-500">{t.stats?.losses || 0}</td>
                                        <td className="px-4 py-2.5 text-center text-emerald-500 font-medium">{t.stats?.penaltyWins || 0}</td>
                                        <td className="px-4 py-2.5 text-center text-orange-500 font-medium">{t.stats?.penaltyLosses || 0}</td>
                                        <td className="px-4 py-2.5 text-center">{t.stats?.goalDifference || 0}</td>
                                        <td className="px-4 py-2.5 text-center font-black">{t.stats?.points || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* BRACKET VIEW */}
            {(format === "single_elimination" || (format === "group_stage" && activeTab === "bracket")) && hasBracket && (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-max">
                        {Object.entries(bracketRounds).sort(([a], [b]) => Number(a) - Number(b)).map(([round, roundMatches]) => {
                            const totalRounds = Math.max(...Object.keys(bracketRounds).map(Number));
                            return (
                                <div key={round} className="flex flex-col gap-4 min-w-[220px]">
                                    <div className="text-center mb-2">
                                        <span className="text-xs font-bold text-gray-900 px-3 py-1.5 bg-gray-100 rounded-full">{getRoundName(Number(round), totalRounds)}</span>
                                    </div>
                                    {roundMatches.map((m: any) => {
                                        const isCompleted = m.status === "completed";
                                        const winnerA = m.winner === "A";
                                        const winnerB = m.winner === "B";
                                        return (
                                            <div key={m._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                <div className={`flex items-center justify-between px-3 py-2.5 border-b border-gray-50 ${isCompleted && winnerA ? "bg-emerald-50" : ""}`}>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <Shield className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                                        <span className={`text-xs truncate ${isCompleted && winnerA ? "font-bold text-emerald-700" : "font-medium text-gray-700"}`}>{getTeamName(m, "A")}</span>
                                                    </div>
                                                    <span className={`text-sm font-black ml-2 ${isCompleted && winnerA ? "text-emerald-600" : "text-gray-400"}`}>{isCompleted ? m.scoreA : ""}</span>
                                                </div>
                                                <div className={`flex items-center justify-between px-3 py-2.5 ${isCompleted && winnerB ? "bg-emerald-50" : ""}`}>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <Shield className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                                        <span className={`text-xs truncate ${isCompleted && winnerB ? "font-bold text-emerald-700" : "font-medium text-gray-700"}`}>{getTeamName(m, "B")}</span>
                                                    </div>
                                                    <span className={`text-sm font-black ml-2 ${isCompleted && winnerB ? "text-emerald-600" : "text-gray-400"}`}>{isCompleted ? m.scoreB : ""}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Single elimination — no bracket data yet */}
            {format === "single_elimination" && !hasBracket && participants.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có cây đấu</h3>
                    <p className="text-sm text-gray-400">Hãy vào trang "Bóc thăm" để tạo cây đấu loại trực tiếp.</p>
                </div>
            )}
        </div>
    );
}
