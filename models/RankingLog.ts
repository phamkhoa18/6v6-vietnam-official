import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * RankingLog — Lưu điểm ranking tích lũy sau mỗi giải đấu.
 * 
 * - 1v1: ghi cho user (cá nhân)
 * - 2v2/3v3: ghi cho từng user trong team (cá nhân)
 * - 6v6: ghi cho team
 * 
 * BXH = SUM(totalPoints) qua tất cả giải cùng gameMode.
 */
export interface IRankingLog extends Document {
    _id: mongoose.Types.ObjectId;

    // Ai được tính điểm
    user?: mongoose.Types.ObjectId;     // 1v1, 2v2, 3v3 → cá nhân
    teamName?: string;                  // 6v6 → tên team (lưu snapshot)
    teamId?: string;                    // 6v6 → team ref tạm

    gameMode: "1v1" | "2v2" | "3v3" | "6v6";
    tournament: mongoose.Types.ObjectId;
    tournamentTitle: string;            // Snapshot tên giải

    // Stats tổng kết sau giải
    matchesPlayed: number;
    wins: number;
    penaltyWins: number;
    penaltyLosses: number;
    losses: number;
    totalPoints: number;                // Tổng điểm match (3+3+2+1+... = N)
    goalsFor: number;
    goalsAgainst: number;

    awardedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RankingLogSchema = new Schema<IRankingLog>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        teamName: { type: String },
        teamId: { type: String },

        gameMode: {
            type: String,
            enum: ["1v1", "2v2", "3v3", "6v6"],
            required: true,
        },
        tournament: {
            type: Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },
        tournamentTitle: {
            type: String,
            required: true,
        },

        matchesPlayed: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        penaltyWins: { type: Number, default: 0 },
        penaltyLosses: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        goalsFor: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 },

        awardedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Indexes for ranking queries
RankingLogSchema.index({ gameMode: 1, user: 1 });
RankingLogSchema.index({ gameMode: 1, teamName: 1 });
RankingLogSchema.index({ tournament: 1 });
RankingLogSchema.index({ user: 1, gameMode: 1 });

const RankingLog: Model<IRankingLog> =
    mongoose.models.RankingLog ||
    mongoose.model<IRankingLog>("RankingLog", RankingLogSchema);

export default RankingLog;
