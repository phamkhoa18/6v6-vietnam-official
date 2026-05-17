import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import RankingLog from "@/models/RankingLog";
import mongoose from "mongoose";

// GET /api/users/[id]/profile — Public profile
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        // Find user by playerId (number) or _id (ObjectId)
        let user;
        const numId = parseInt(id, 10);
        if (!isNaN(numId)) {
            user = await User.findOne({ playerId: numId }).lean();
        }
        if (!user && mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id).lean();
        }
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy người dùng" },
                { status: 404 }
            );
        }

        // Get ranking logs for this user (all modes)
        const rankingLogs = await RankingLog.find({ user: user._id })
            .sort({ awardedAt: -1 })
            .limit(30)
            .lean();

        // Calculate per-mode ranking summary
        const modeSummary: Record<string, { totalPoints: number; matches: number; wins: number; losses: number }> = {};
        for (const log of rankingLogs) {
            const mode = log.gameMode;
            if (!modeSummary[mode]) {
                modeSummary[mode] = { totalPoints: 0, matches: 0, wins: 0, losses: 0 };
            }
            modeSummary[mode].totalPoints += log.totalPoints || 0;
            modeSummary[mode].matches += log.matchesPlayed || 0;
            modeSummary[mode].wins += log.wins || 0;
            modeSummary[mode].losses += log.losses || 0;
        }

        // Build recent tournament logs
        const recentLogs = rankingLogs.map((log) => ({
            _id: String(log._id),
            tournamentTitle: log.tournamentTitle,
            gameMode: log.gameMode,
            matchesPlayed: log.matchesPlayed,
            wins: log.wins,
            losses: log.losses,
            totalPoints: log.totalPoints,
            goalsFor: log.goalsFor || 0,
            goalsAgainst: log.goalsAgainst || 0,
            awardedAt: log.awardedAt,
        }));

        const data = {
            playerId: user.playerId,
            name: user.name,
            avatar: user.avatar || "",
            nickname: user.nickname || "",
            teamName: user.teamName || "",
            phone: user.phone || "",
            email: user.email || "",
            facebookName: user.facebookName || "",
            facebookLink: user.facebookLink || "",
            bio: user.bio || "",
            province: user.province || "",
            country: user.country || "",
            dateOfBirth: user.dateOfBirth || "",
            jerseyNumber: (user as any).jerseyNumber || null,
            role: user.role,
            stats: user.stats || {
                tournamentsCreated: 0,
                tournamentsJoined: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                goalsScored: 0,
                goalsConceded: 0,
            },
            modeSummary,
            recentLogs,
            createdAt: user.createdAt,
        };

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Profile API error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}
