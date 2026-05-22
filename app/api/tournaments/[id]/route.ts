import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Registration from "@/models/Registration";
import Match from "@/models/Match";
import { getCurrentUser } from "@/lib/auth";

// GET /api/tournaments/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const tournament = await Tournament.findById(id)
            .populate("createdBy", "name avatar")
            .lean();

        if (!tournament) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy giải đấu" },
                { status: 404 }
            );
        }

        // Increment views
        await Tournament.findByIdAndUpdate(id, { $inc: { views: 1 } });

        // Get participants based on gameMode
        let participants: any[] = [];
        if (tournament.gameMode === "1v1") {
            participants = await Registration.find({ tournament: id })
                .populate("user", "name avatar nickname playerId province")
                .sort("seed registeredAt")
                .lean();
        } else {
            participants = await Team.find({ tournament: id })
                .populate("captain", "name avatar nickname playerId")
                .populate("members.user", "name avatar nickname playerId")
                .sort("seed registeredAt")
                .lean();
        }

        // Get matches
        const rawMatches = await Match.find({ tournament: id })
            .populate("teamA", "name shortName logo seed captain members")
            .populate("teamB", "name shortName logo seed captain members")
            .populate("playerA", "name avatar nickname playerId")
            .populate("playerB", "name avatar nickname playerId")
            .sort("round matchNumber")
            .lean();

        // Compute max round for naming
        const maxRound = rawMatches.length > 0
            ? Math.max(...rawMatches.map((m: any) => m.round || 1))
            : 1;

        // Map DB fields → client-expected fields
        const matches = rawMatches.map((m: any) => {
            let roundName = m.group ? `Bảng ${m.group}` : `Vòng ${m.round}`;
            if (!m.group && maxRound > 1) {
                const roundsFromEnd = maxRound - m.round;
                if (roundsFromEnd === 0) roundName = "Chung kết";
                else if (roundsFromEnd === 1) roundName = "Bán kết";
                else if (roundsFromEnd === 2) roundName = "Tứ kết";
            }

            return {
                ...m,
                homeTeam: m.teamA || null,
                awayTeam: m.teamB || null,
                homeScore: m.scoreA ?? 0,
                awayScore: m.scoreB ?? 0,
                p1: m.playerA || null,
                p2: m.playerB || null,
                roundName,
                winner: m.winner === "A" ? (m.teamA?._id || m.playerA?._id || null)
                      : m.winner === "B" ? (m.teamB?._id || m.playerB?._id || null)
                      : null,
            };
        });

        // Add client-expected aliases to tournament object
        const tournamentData = {
            ...tournament,
            maxTeams: (tournament as any).maxSlots ?? (tournament as any).maxTeams ?? 0,
            currentTeams: (tournament as any).currentSlots ?? (tournament as any).currentTeams ?? participants.length,
        };

        // Dynamic Standings Recalculation & shortName replacement
        if (tournament.gameMode !== "6v6") {
            participants = participants.map(p => {
                if (p.captain?.playerId) {
                    return { ...p, shortName: `ID: ${p.captain.playerId}` };
                }
                if (p.user?.playerId) {
                    return { ...p, shortName: `ID: ${p.user.playerId}` };
                }
                return p;
            });
        }

        if (tournament.format === 'round_robin' || tournament.format === 'group_stage') {
            const scoring = {
                pointsPerWin: tournament.scoring?.pointsPerWin ?? 3,
                pointsPerDraw: tournament.scoring?.pointsPerDraw ?? 1,
                pointsPerPenaltyWin: tournament.scoring?.pointsPerPenaltyWin ?? 2,
                pointsPerPenaltyLoss: tournament.scoring?.pointsPerPenaltyLoss ?? 1,
                pointsPerLoss: tournament.scoring?.pointsPerLoss ?? 0,
            };

            const statsMap: Record<string, any> = {};
            participants.forEach(p => {
                statsMap[p._id.toString()] = {
                    played: 0, wins: 0, draws: 0, losses: 0,
                    penaltyWins: 0, penaltyLosses: 0,
                    goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
                    points: 0, form: []
                };
            });

            const completedMatches = matches.filter(m => m.status === 'completed' && m.homeScore !== undefined && m.awayScore !== undefined);
            completedMatches.sort((a, b) => new Date(a.playedAt || a.updatedAt || 0).getTime() - new Date(b.playedAt || b.updatedAt || 0).getTime());

            completedMatches.forEach(m => {
                const idA = m.homeTeam?._id?.toString() || m.p1?._id?.toString();
                const idB = m.awayTeam?._id?.toString() || m.p2?._id?.toString();
                
                if (idA && statsMap[idA]) {
                    statsMap[idA].played++;
                    statsMap[idA].goalsFor += m.homeScore;
                    statsMap[idA].goalsAgainst += m.awayScore;
                    statsMap[idA].goalDifference = statsMap[idA].goalsFor - statsMap[idA].goalsAgainst;
                }
                
                if (idB && statsMap[idB]) {
                    statsMap[idB].played++;
                    statsMap[idB].goalsFor += m.awayScore;
                    statsMap[idB].goalsAgainst += m.homeScore;
                    statsMap[idB].goalDifference = statsMap[idB].goalsFor - statsMap[idB].goalsAgainst;
                }

                if (m.homeScore > m.awayScore) {
                    if (idA && statsMap[idA]) { statsMap[idA].wins++; statsMap[idA].points += scoring.pointsPerWin; statsMap[idA].form.push('W'); }
                    if (idB && statsMap[idB]) { statsMap[idB].losses++; statsMap[idB].points += scoring.pointsPerLoss; statsMap[idB].form.push('L'); }
                } else if (m.awayScore > m.homeScore) {
                    if (idB && statsMap[idB]) { statsMap[idB].wins++; statsMap[idB].points += scoring.pointsPerWin; statsMap[idB].form.push('W'); }
                    if (idA && statsMap[idA]) { statsMap[idA].losses++; statsMap[idA].points += scoring.pointsPerLoss; statsMap[idA].form.push('L'); }
                } else {
                    const pA = m.penaltyA ?? 0;
                    const pB = m.penaltyB ?? 0;
                    if (m.penaltyA !== undefined && m.penaltyB !== undefined && pA !== pB) {
                        if (pA > pB) {
                            if (idA && statsMap[idA]) { statsMap[idA].penaltyWins++; statsMap[idA].points += scoring.pointsPerPenaltyWin; statsMap[idA].form.push('PW'); }
                            if (idB && statsMap[idB]) { statsMap[idB].penaltyLosses++; statsMap[idB].points += scoring.pointsPerPenaltyLoss; statsMap[idB].form.push('PL'); }
                        } else {
                            if (idB && statsMap[idB]) { statsMap[idB].penaltyWins++; statsMap[idB].points += scoring.pointsPerPenaltyWin; statsMap[idB].form.push('PW'); }
                            if (idA && statsMap[idA]) { statsMap[idA].penaltyLosses++; statsMap[idA].points += scoring.pointsPerPenaltyLoss; statsMap[idA].form.push('PL'); }
                        }
                    } else {
                        if (idA && statsMap[idA]) { statsMap[idA].draws++; statsMap[idA].points += scoring.pointsPerDraw; statsMap[idA].form.push('D'); }
                        if (idB && statsMap[idB]) { statsMap[idB].draws++; statsMap[idB].points += scoring.pointsPerDraw; statsMap[idB].form.push('D'); }
                    }
                }
            });

            participants = participants.map(p => ({
                ...p,
                stats: statsMap[p._id.toString()] || p.stats
            }));
        }

        return NextResponse.json({
            success: true,
            data: { tournament: tournamentData, participants, teams: participants, matches },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/tournaments/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json(
                { success: false, message: "Không có quyền cập nhật" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const tournament = await Tournament.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!tournament) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy giải đấu" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { tournament },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
}

// DELETE /api/tournaments/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json(
                { success: false, message: "Không có quyền xóa" },
                { status: 403 }
            );
        }

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy giải đấu" },
                { status: 404 }
            );
        }

        // Only creator or admin can delete
        if (user.role !== "admin" && tournament.createdBy.toString() !== user._id.toString()) {
            return NextResponse.json(
                { success: false, message: "Không có quyền xóa giải đấu này" },
                { status: 403 }
            );
        }

        await Tournament.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: "Đã xóa giải đấu",
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
