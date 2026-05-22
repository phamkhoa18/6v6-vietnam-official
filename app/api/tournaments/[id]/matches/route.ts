import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import { getCurrentUser } from "@/lib/auth";

// POST /api/tournaments/[id]/matches — Create a match
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ success: false, message: "Không tìm thấy giải đấu" }, { status: 404 });
        }

        const body = await req.json();
        const match = await Match.create({
            tournament: id,
            round: body.round || 1,
            matchNumber: body.matchNumber || 1,
            group: body.group || undefined,
            teamA: body.teamA || undefined,
            teamB: body.teamB || undefined,
            playerA: body.playerA || undefined,
            playerB: body.playerB || undefined,
            scheduledAt: body.scheduledAt || undefined,
            notes: body.notes || "",
            status: "scheduled",
        });

        return NextResponse.json({ success: true, data: { match } }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

// GET /api/tournaments/[id]/matches — List matches for a tournament (with pagination & filtering)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
        const status = searchParams.get("status") || "all";
        const search = searchParams.get("search") || "";

        // Build query filter
        const filter: any = { tournament: id };
        if (status && status !== "all") {
            filter.status = status;
        }

        // Count total for pagination
        const total = await Match.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        // Fetch tournament to know the gameMode
        const tournament = await Tournament.findById(id).select("gameMode").lean();
        const gameMode = tournament?.gameMode || "1v1";

        // Fetch paginated matches
        const rawMatches = await Match.find(filter)
            .populate({
                path: "teamA",
                select: "name shortName logo seed captain members",
                populate: [
                    { path: "captain", select: "name avatar nickname playerId" },
                    { path: "members.user", select: "name avatar nickname playerId" }
                ]
            })
            .populate({
                path: "teamB",
                select: "name shortName logo seed captain members",
                populate: [
                    { path: "captain", select: "name avatar nickname playerId" },
                    { path: "members.user", select: "name avatar nickname" }
                ]
            })
            .populate("playerA", "name avatar nickname playerId")
            .populate("playerB", "name avatar nickname playerId")
            .sort("round matchNumber")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Compute total rounds for naming
        const maxRound = rawMatches.length > 0
            ? Math.max(...rawMatches.map((m: any) => m.round || 1))
            : 1;

        // Helper: enrich team object with player1/player2 for MatchCard rendering
        const enrichTeam = (team: any) => {
            if (!team) return null;
            
            if (gameMode === '6v6') {
                return {
                    ...team,
                    player1: team.name || team.captain?.name || "",
                    player2: "",
                };
            } else if (gameMode === '2v2' || gameMode === '3v3') {
                // For 2v2/3v3, we want to show "Player 1 / Player 2 / Player 3"
                const memberNames: string[] = [];
                if (team.members && team.members.length > 0) {
                    team.members.forEach((m: any) => {
                        if (m.user && m.user.name) memberNames.push(m.user.name);
                    });
                } else if (team.captain?.name) {
                    memberNames.push(team.captain.name);
                }
                
                return {
                    ...team,
                    player1: memberNames.join(" / ") || team.name || "",
                    player2: "",
                    shortName: team.captain?.playerId ? `ID: ${team.captain.playerId}` : "",
                };
            }
            
            return {
                ...team,
                player1: team.captain?.name || team.name || "",
                player2: "",
                shortName: team.captain?.playerId ? `ID: ${team.captain.playerId}` : "",
            };
        };

        // Map DB fields (teamA/teamB/scoreA/scoreB) → client fields (homeTeam/awayTeam/homeScore/awayScore)
        const matches = rawMatches.map((m: any) => {
            // Generate round name
            let roundName = m.group ? `Bảng ${m.group}` : `Vòng ${m.round}`;
            if (!m.group && maxRound > 1) {
                const roundsFromEnd = maxRound - m.round;
                if (roundsFromEnd === 0) roundName = "Chung kết";
                else if (roundsFromEnd === 1) roundName = "Bán kết";
                else if (roundsFromEnd === 2) roundName = "Tứ kết";
            }

            return {
                ...m,
                homeTeam: enrichTeam(m.teamA),
                awayTeam: enrichTeam(m.teamB),
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

        // Compute stats
        const [completedCount, liveCount, totalCount] = await Promise.all([
            Match.countDocuments({ tournament: id, status: "completed" }),
            Match.countDocuments({ tournament: id, status: "live" }),
            Match.countDocuments({ tournament: id }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                matches,
                pagination: { page, limit, total, totalPages },
                stats: { completedCount, liveCount, totalCount },
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PUT /api/tournaments/[id]/matches — Update match result
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const { id } = await params;
        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ success: false, message: "Không tìm thấy giải đấu" }, { status: 404 });
        }

        const body = await req.json();
        const { matchId, homeScore, awayScore, status, scheduledAt, sets } = body;

        const match = await Match.findById(matchId)
            .populate("teamA", "name shortName")
            .populate("teamB", "name shortName");
        if (!match) {
            return NextResponse.json({ success: false, message: "Không tìm thấy trận đấu" }, { status: 404 });
        }

        // --- Helper: find which slot this match occupies in its next match ---
        const findSlotInNextMatch = async (currentMatch: any): Promise<"teamA" | "teamB"> => {
            const siblings = await Match.find({
                tournament: id,
                round: currentMatch.round,
            }).sort({ matchNumber: 1 });
            const idx = siblings.findIndex((m: any) => m._id.toString() === currentMatch._id.toString());
            return idx % 2 === 0 ? "teamA" : "teamB";
        };

        // --- Find next match in the bracket ---
        const findNextMatch = async (currentMatch: any) => {
            const nextRound = (currentMatch.round || 1) + 1;
            const nextMatchNumber = Math.ceil((currentMatch.matchNumber || 1) / 2);
            return Match.findOne({
                tournament: id,
                round: nextRound,
                matchNumber: nextMatchNumber,
            });
        };

        // --- Helper: cascade rollback from a match through future rounds ---
        const cascadeRollback = async (fromMatch: any, teamIdToRemove: any) => {
            if (!teamIdToRemove || !fromMatch) return;
            let currentMatch = fromMatch;
            let teamId = teamIdToRemove;

            while (currentMatch && teamId) {
                const teamStr = teamId.toString();
                if (currentMatch.teamA?.toString() === teamStr) {
                    currentMatch.teamA = null;
                } else if (currentMatch.teamB?.toString() === teamStr) {
                    currentMatch.teamB = null;
                } else {
                    break;
                }

                if (currentMatch.status === "completed" && currentMatch.winner) {
                    const oldWinnerId = currentMatch.winner === "A" ? currentMatch.teamA : currentMatch.teamB;
                    currentMatch.scoreA = 0;
                    currentMatch.scoreB = 0;
                    (currentMatch as any).winner = null;
                    currentMatch.status = "scheduled";
                    await currentMatch.save();

                    const nextMatch = await findNextMatch(currentMatch);
                    if (nextMatch && oldWinnerId) {
                        currentMatch = nextMatch;
                        teamId = oldWinnerId;
                    } else {
                        break;
                    }
                } else {
                    await currentMatch.save();
                    break;
                }
            }
        };

        // PHASE 1: ROLLBACK if match was previously completed
        const wasCompleted = match.status === "completed";
        const previousWinner = match.winner;
        const isResetting = status === "scheduled" || status === "live";

        if (wasCompleted && (isResetting || status === "completed")) {
            // Un-eliminate the previous loser
            if (previousWinner && tournament.format === "single_elimination") {
                const previousLoserId = previousWinner === "A" ? match.teamB : match.teamA;
                if (previousLoserId) {
                    const Team = (await import("@/models/Team")).default;
                    await Team.findByIdAndUpdate(previousLoserId, { status: "active" });
                }
            }

            // Cascade rollback: remove previous winner from next match
            if (previousWinner) {
                const previousWinnerId = previousWinner === "A" ? match.teamA : match.teamB;
                const nextMatch = await findNextMatch(match);
                if (nextMatch && previousWinnerId) {
                    await cascadeRollback(nextMatch, previousWinnerId);
                }
            }

            (match as any).winner = null;
            if (isResetting) {
                match.scoreA = 0;
                match.scoreB = 0;
                (match as any).matchVersion = ((match as any).matchVersion || 1) + 1;
            }
        }

        // PHASE 2: APPLY new values
        if (homeScore !== undefined) match.scoreA = homeScore;
        if (awayScore !== undefined) match.scoreB = awayScore;
        if (status) match.status = status;
        if (scheduledAt) match.scheduledAt = scheduledAt;
        if (sets) (match as any).sets = sets;
        (match as any).updatedBy = user._id;

        // PHASE 3: ADVANCE winner if status is completed
        if (status === "completed" && homeScore !== undefined && awayScore !== undefined) {
            (match as any).completedAt = new Date();

            let winnerSide: "A" | "B" | null = null;
            if (homeScore > awayScore) winnerSide = "A";
            else if (awayScore > homeScore) winnerSide = "B";
            // Round Robin / Group Stage: draw is valid (winnerSide stays null)

            match.winner = winnerSide as any;

            // Only eliminate + advance for single_elimination
            if (tournament.format === "single_elimination") {
                // Elimination: mark loser as eliminated
                if (winnerSide) {
                    const loserId = winnerSide === "A" ? match.teamB : match.teamA;
                    if (loserId) {
                        const Team = (await import("@/models/Team")).default;
                        await Team.findByIdAndUpdate(loserId, { status: "eliminated" });
                    }
                }

                // Advance winner to next match
                if (winnerSide) {
                    const winnerId = winnerSide === "A" ? match.teamA : match.teamB;
                    const nextMatch = await findNextMatch(match);
                    if (nextMatch && winnerId) {
                        const slot = await findSlotInNextMatch(match);
                        nextMatch[slot] = winnerId;

                        if (((nextMatch.status as any) === 'walkover' || (nextMatch.status as any) === 'bye') && nextMatch.teamA && nextMatch.teamB) {
                            nextMatch.status = 'scheduled';
                            (nextMatch as any).winner = null;
                            nextMatch.scoreA = 0;
                            nextMatch.scoreB = 0;
                        }
                        await nextMatch.save();
                    }
                }
            }
        }

        await match.save();

        const updatedMatch = await Match.findById(matchId)
            .populate("teamA", "name shortName logo")
            .populate("teamB", "name shortName logo")
            .lean();

        // Map to client-expected field names
        const mapped = {
            ...updatedMatch,
            homeTeam: (updatedMatch as any)?.teamA || null,
            awayTeam: (updatedMatch as any)?.teamB || null,
            homeScore: (updatedMatch as any)?.scoreA ?? 0,
            awayScore: (updatedMatch as any)?.scoreB ?? 0,
        };

        return NextResponse.json({ success: true, data: mapped, message: "Cập nhật trận đấu thành công" });
    } catch (error: any) {
        console.error("Update match error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
