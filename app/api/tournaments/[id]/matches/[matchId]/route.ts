import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/tournaments/[id]/matches/[matchId] — Update match (score, status)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; matchId: string }> }
) {
    try {
        await dbConnect();
        const { id, matchId } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const body = await req.json();
        const match = await Match.findOneAndUpdate(
            { _id: matchId, tournament: id },
            { $set: body },
            { returnDocument: 'after', runValidators: true }
        )
            .populate("teamA", "name shortName logo")
            .populate("teamB", "name shortName logo");

        if (!match) {
            return NextResponse.json({ success: false, message: "Không tìm thấy trận đấu" }, { status: 404 });
        }

        // If match is completed, update team stats
        if (body.status === "completed" && body.scoreA !== undefined && body.scoreB !== undefined) {
            const tournament = await Tournament.findById(id);
            if (tournament) {
                const isTeamMode = tournament.gameMode !== "1v1";
                const fieldA = isTeamMode ? "teamA" : "playerA";
                const fieldB = isTeamMode ? "teamB" : "playerB";
                const idA = match[fieldA as keyof typeof match];
                const idB = match[fieldB as keyof typeof match];

                if (idA && idB) {
                    const scoreA = body.scoreA;
                    const scoreB = body.scoreB;
                    const penaltyA = body.penaltyA;
                    const penaltyB = body.penaltyB;

                    const statsA: any = { $inc: { "stats.played": 1, "stats.goalsFor": scoreA, "stats.goalsAgainst": scoreB }, $push: {} };
                    const statsB: any = { $inc: { "stats.played": 1, "stats.goalsFor": scoreB, "stats.goalsAgainst": scoreA }, $push: {} };

                    if (scoreA > scoreB) {
                        statsA.$inc["stats.wins"] = 1;
                        statsA.$inc["stats.points"] = tournament.scoring.pointsPerWin;
                        statsB.$inc["stats.losses"] = 1;
                        statsB.$inc["stats.points"] = tournament.scoring.pointsPerLoss;
                        statsA.$push["stats.form"] = "W";
                        statsB.$push["stats.form"] = "L";
                    } else if (scoreB > scoreA) {
                        statsB.$inc["stats.wins"] = 1;
                        statsB.$inc["stats.points"] = tournament.scoring.pointsPerWin;
                        statsA.$inc["stats.losses"] = 1;
                        statsA.$inc["stats.points"] = tournament.scoring.pointsPerLoss;
                        statsA.$push["stats.form"] = "L";
                        statsB.$push["stats.form"] = "W";
                    } else {
                        // Draw — check penalty
                        if (penaltyA !== undefined && penaltyB !== undefined) {
                            if (penaltyA > penaltyB) {
                                statsA.$inc["stats.penaltyWins"] = 1;
                                statsA.$inc["stats.points"] = tournament.scoring.pointsPerPenaltyWin || 2;
                                statsB.$inc["stats.penaltyLosses"] = 1;
                                statsB.$inc["stats.points"] = tournament.scoring.pointsPerPenaltyLoss || 1;
                                statsA.$push["stats.form"] = "PW";
                                statsB.$push["stats.form"] = "PL";
                            } else {
                                statsB.$inc["stats.penaltyWins"] = 1;
                                statsB.$inc["stats.points"] = tournament.scoring.pointsPerPenaltyWin || 2;
                                statsA.$inc["stats.penaltyLosses"] = 1;
                                statsA.$inc["stats.points"] = tournament.scoring.pointsPerPenaltyLoss || 1;
                                statsA.$push["stats.form"] = "PL";
                                statsB.$push["stats.form"] = "PW";
                            }
                        } else {
                            // True draw (no penalty) — use pointsPerPenaltyLoss as draw points, or 1
                            const drawPts = tournament.scoring.pointsPerPenaltyLoss || 1;
                            statsA.$inc["stats.draws"] = 1;
                            statsA.$inc["stats.points"] = drawPts;
                            statsB.$inc["stats.draws"] = 1;
                            statsB.$inc["stats.points"] = drawPts;
                            statsA.$push["stats.form"] = "D";
                            statsB.$push["stats.form"] = "D";
                        }
                    }

                    const refA = (idA as any)._id || idA;
                    const refB = (idB as any)._id || idB;

                    if (isTeamMode) {
                        await Team.findByIdAndUpdate(refA, statsA);
                        await Team.findByIdAndUpdate(refB, statsB);
                        // Update goalDifference
                        await Team.findByIdAndUpdate(refA, [{ $set: { "stats.goalDifference": { $subtract: ["$stats.goalsFor", "$stats.goalsAgainst"] } } }]);
                        await Team.findByIdAndUpdate(refB, [{ $set: { "stats.goalDifference": { $subtract: ["$stats.goalsFor", "$stats.goalsAgainst"] } } }]);
                    } else {
                        await Registration.findByIdAndUpdate(refA, statsA);
                        await Registration.findByIdAndUpdate(refB, statsB);
                        await Registration.findByIdAndUpdate(refA, [{ $set: { "stats.goalDifference": { $subtract: ["$stats.goalsFor", "$stats.goalsAgainst"] } } }]);
                        await Registration.findByIdAndUpdate(refB, [{ $set: { "stats.goalDifference": { $subtract: ["$stats.goalsFor", "$stats.goalsAgainst"] } } }]);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, data: { match } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

// DELETE /api/tournaments/[id]/matches/[matchId]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; matchId: string }> }
) {
    try {
        await dbConnect();
        const { id, matchId } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        await Match.findOneAndDelete({ _id: matchId, tournament: id });
        return NextResponse.json({ success: true, message: "Đã xóa trận đấu" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
