import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch extends Document {
    _id: mongoose.Types.ObjectId;
    tournament: mongoose.Types.ObjectId;
    round: number;
    matchNumber: number;
    group?: string;

    // Participants — use teamA/teamB for 2v2, 3v3, 6v6; playerA/playerB for 1v1
    teamA?: mongoose.Types.ObjectId;
    teamB?: mongoose.Types.ObjectId;
    playerA?: mongoose.Types.ObjectId;
    playerB?: mongoose.Types.ObjectId;

    // Score
    scoreA: number;
    scoreB: number;
    penaltyA?: number;
    penaltyB?: number;

    // Result
    winner?: "A" | "B";
    resultType: "regular" | "penalty" | "walkover";

    // Points awarded based on 3/2/1/0 system
    pointsA: number;
    pointsB: number;

    status: "scheduled" | "live" | "completed" | "cancelled";
    scheduledAt?: Date;
    playedAt?: Date;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
    {
        tournament: {
            type: Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },
        round: {
            type: Number,
            required: true,
            min: 1,
        },
        matchNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        group: { type: String },

        // Participants
        teamA: { type: Schema.Types.ObjectId, ref: "Team" },
        teamB: { type: Schema.Types.ObjectId, ref: "Team" },
        playerA: { type: Schema.Types.ObjectId, ref: "User" },
        playerB: { type: Schema.Types.ObjectId, ref: "User" },

        // Score
        scoreA: { type: Number, default: 0 },
        scoreB: { type: Number, default: 0 },
        penaltyA: { type: Number },
        penaltyB: { type: Number },

        // Result
        winner: {
            type: String,
            enum: ["A", "B"],
        },
        resultType: {
            type: String,
            enum: ["regular", "penalty", "walkover"],
            default: "regular",
        },

        // Points
        pointsA: { type: Number, default: 0 },
        pointsB: { type: Number, default: 0 },

        status: {
            type: String,
            enum: ["scheduled", "live", "completed", "cancelled"],
            default: "scheduled",
        },
        scheduledAt: { type: Date },
        playedAt: { type: Date },
        notes: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

// Indexes
MatchSchema.index({ tournament: 1 });
MatchSchema.index({ tournament: 1, round: 1 });
MatchSchema.index({ tournament: 1, group: 1 });
MatchSchema.index({ teamA: 1 });
MatchSchema.index({ teamB: 1 });
MatchSchema.index({ playerA: 1 });
MatchSchema.index({ playerB: 1 });

const Match: Model<IMatch> =
    mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

export default Match;
