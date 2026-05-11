import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RankingLog from "@/models/RankingLog";

// GET /api/rankings — Bảng xếp hạng
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const gameMode = searchParams.get("mode") || "1v1";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;

        if (gameMode === "6v6") {
            // Team ranking — aggregate by teamName
            const pipeline: any[] = [
                { $match: { gameMode: "6v6" } },
                {
                    $group: {
                        _id: "$teamName",
                        totalPoints: { $sum: "$totalPoints" },
                        totalMatches: { $sum: "$matchesPlayed" },
                        totalWins: { $sum: "$wins" },
                        totalPenaltyWins: { $sum: "$penaltyWins" },
                        totalPenaltyLosses: { $sum: "$penaltyLosses" },
                        totalLosses: { $sum: "$losses" },
                        totalGoalsFor: { $sum: "$goalsFor" },
                        totalGoalsAgainst: { $sum: "$goalsAgainst" },
                        tournamentsPlayed: { $sum: 1 },
                    },
                },
                { $sort: { totalPoints: -1, totalWins: -1, totalGoalsFor: -1 } },
            ];

            if (search) {
                pipeline[0].$match.teamName = { $regex: search, $options: "i" };
            }

            const [rankings, countResult] = await Promise.all([
                RankingLog.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
                RankingLog.aggregate([...pipeline, { $count: "total" }]),
            ]);

            const total = countResult[0]?.total || 0;

            return NextResponse.json({
                success: true,
                data: {
                    rankings: rankings.map((r, i) => ({
                        rank: skip + i + 1,
                        teamName: r._id,
                        totalPoints: r.totalPoints,
                        totalMatches: r.totalMatches,
                        totalWins: r.totalWins,
                        totalPenaltyWins: r.totalPenaltyWins,
                        totalLosses: r.totalLosses,
                        totalGoalsFor: r.totalGoalsFor,
                        totalGoalsAgainst: r.totalGoalsAgainst,
                        goalDifference: r.totalGoalsFor - r.totalGoalsAgainst,
                        tournamentsPlayed: r.tournamentsPlayed,
                    })),
                    pagination: {
                        page,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            });
        } else {
            // Individual ranking (1v1, 2v2, 3v3) — aggregate by user
            const pipeline: any[] = [
                { $match: { gameMode } },
                {
                    $group: {
                        _id: "$user",
                        totalPoints: { $sum: "$totalPoints" },
                        totalMatches: { $sum: "$matchesPlayed" },
                        totalWins: { $sum: "$wins" },
                        totalPenaltyWins: { $sum: "$penaltyWins" },
                        totalPenaltyLosses: { $sum: "$penaltyLosses" },
                        totalLosses: { $sum: "$losses" },
                        totalGoalsFor: { $sum: "$goalsFor" },
                        totalGoalsAgainst: { $sum: "$goalsAgainst" },
                        tournamentsPlayed: { $sum: 1 },
                    },
                },
                { $sort: { totalPoints: -1, totalWins: -1, totalGoalsFor: -1 } },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userInfo",
                    },
                },
                { $unwind: "$userInfo" },
            ];

            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { "userInfo.name": { $regex: search, $options: "i" } },
                            { "userInfo.nickname": { $regex: search, $options: "i" } },
                        ],
                    },
                });
            }

            const [rankings, countResult] = await Promise.all([
                RankingLog.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
                RankingLog.aggregate([...pipeline, { $count: "total" }]),
            ]);

            const total = countResult[0]?.total || 0;

            return NextResponse.json({
                success: true,
                data: {
                    rankings: rankings.map((r, i) => ({
                        rank: skip + i + 1,
                        user: {
                            _id: r.userInfo._id,
                            name: r.userInfo.name,
                            nickname: r.userInfo.nickname,
                            avatar: r.userInfo.avatar,
                            playerId: r.userInfo.playerId,
                            province: r.userInfo.province,
                        },
                        totalPoints: r.totalPoints,
                        totalMatches: r.totalMatches,
                        totalWins: r.totalWins,
                        totalPenaltyWins: r.totalPenaltyWins,
                        totalLosses: r.totalLosses,
                        totalGoalsFor: r.totalGoalsFor,
                        totalGoalsAgainst: r.totalGoalsAgainst,
                        goalDifference: r.totalGoalsFor - r.totalGoalsAgainst,
                        tournamentsPlayed: r.tournamentsPlayed,
                    })),
                    pagination: {
                        page,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            });
        }
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
