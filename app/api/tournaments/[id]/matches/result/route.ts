import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Registration from "@/models/Registration";
import RankingLog from "@/models/RankingLog";
import { getCurrentUser } from "@/lib/auth";
import { calculateMatchPoints } from "@/lib/ranking-points";

// POST /api/tournaments/[id]/matches/result — Submit match result
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id: tournamentId } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json(
                { success: false, message: "Không có quyền nhập kết quả" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { matchId, scoreA, scoreB, penaltyA, penaltyB } = body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy giải đấu" },
                { status: 404 }
            );
        }

        const match = await Match.findById(matchId);
        if (!match || match.tournament.toString() !== tournamentId) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy trận đấu" },
                { status: 404 }
            );
        }

        // Calculate points
        const scoring = {
            pointsPerWin: tournament.scoring?.pointsPerWin ?? 3,
            pointsPerPenaltyWin: tournament.scoring?.pointsPerPenaltyWin ?? 2,
            pointsPerPenaltyLoss: tournament.scoring?.pointsPerPenaltyLoss ?? 1,
            pointsPerLoss: tournament.scoring?.pointsPerLoss ?? 0,
        };

        const result = calculateMatchPoints(
            scoreA,
            scoreB,
            penaltyA,
            penaltyB,
            scoring
        );

        // Update match
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        match.penaltyA = penaltyA;
        match.penaltyB = penaltyB;
        match.pointsA = result.pointsA;
        match.pointsB = result.pointsB;
        match.winner = result.winner;
        match.resultType = result.resultType;
        match.status = "completed";
        match.playedAt = new Date();
        await match.save();

        // Update participant stats
        const isTeamMode = tournament.gameMode !== "1v1";

        if (isTeamMode) {
            // Update Team stats
            const updateStats = async (
                teamId: any,
                goalsFor: number,
                goalsAgainst: number,
                points: number,
                resultType: string,
                isWinner: boolean
            ) => {
                const update: any = {
                    $inc: {
                        "stats.played": 1,
                        "stats.goalsFor": goalsFor,
                        "stats.goalsAgainst": goalsAgainst,
                        "stats.points": points,
                    },
                };
                update.$inc["stats.goalDifference"] = goalsFor - goalsAgainst;

                if (isWinner && resultType === "regular") {
                    update.$inc["stats.wins"] = 1;
                    update.$push = { "stats.form": "W" };
                } else if (isWinner && resultType === "penalty") {
                    update.$inc["stats.penaltyWins"] = 1;
                    update.$push = { "stats.form": "PW" };
                } else if (!isWinner && resultType === "penalty") {
                    update.$inc["stats.penaltyLosses"] = 1;
                    update.$push = { "stats.form": "PL" };
                } else {
                    update.$inc["stats.losses"] = 1;
                    update.$push = { "stats.form": "L" };
                }

                await Team.findByIdAndUpdate(teamId, update);
            };

            if (match.teamA) await updateStats(match.teamA, scoreA, scoreB, result.pointsA, result.resultType, result.winner === "A");
            if (match.teamB) await updateStats(match.teamB, scoreB, scoreA, result.pointsB, result.resultType, result.winner === "B");
        } else {
            // Update Registration stats (1v1)
            const updatePlayerStats = async (
                playerId: any,
                goalsFor: number,
                goalsAgainst: number,
                points: number,
                resultType: string,
                isWinner: boolean
            ) => {
                const update: any = {
                    $inc: {
                        "stats.played": 1,
                        "stats.goalsFor": goalsFor,
                        "stats.goalsAgainst": goalsAgainst,
                        "stats.points": points,
                    },
                };
                update.$inc["stats.goalDifference"] = goalsFor - goalsAgainst;

                if (isWinner && resultType === "regular") {
                    update.$inc["stats.wins"] = 1;
                    update.$push = { "stats.form": "W" };
                } else if (isWinner && resultType === "penalty") {
                    update.$inc["stats.penaltyWins"] = 1;
                    update.$push = { "stats.form": "PW" };
                } else if (!isWinner && resultType === "penalty") {
                    update.$inc["stats.penaltyLosses"] = 1;
                    update.$push = { "stats.form": "PL" };
                } else {
                    update.$inc["stats.losses"] = 1;
                    update.$push = { "stats.form": "L" };
                }

                await Registration.findOneAndUpdate(
                    { tournament: tournamentId, user: playerId },
                    update
                );
            };

            if (match.playerA) await updatePlayerStats(match.playerA, scoreA, scoreB, result.pointsA, result.resultType, result.winner === "A");
            if (match.playerB) await updatePlayerStats(match.playerB, scoreB, scoreA, result.pointsB, result.resultType, result.winner === "B");
        }

        return NextResponse.json({
            success: true,
            data: { match, result },
            message: `Đã nhập kết quả: ${scoreA}-${scoreB}${penaltyA !== undefined ? ` (PEN: ${penaltyA}-${penaltyB})` : ""}`,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
