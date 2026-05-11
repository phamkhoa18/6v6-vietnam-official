import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    shortName: string;
    logo?: string;
    tournament: mongoose.Types.ObjectId;
    captain: mongoose.Types.ObjectId;
    members: {
        user: mongoose.Types.ObjectId;
        role: "captain" | "player" | "substitute";
        jerseyNumber?: number;
        position?: string;
        joinedAt: Date;
    }[];
    seed?: number;
    group?: string;
    stats: {
        played: number;
        wins: number;
        draws: number;
        losses: number;
        penaltyWins: number;
        penaltyLosses: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
        points: number;
        form: string[];
    };
    status: "active" | "eliminated" | "withdrawn" | "disqualified";
    registeredAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
    {
        name: {
            type: String,
            required: [true, "Vui lòng nhập tên đội"],
            trim: true,
            maxlength: [100, "Tên đội không được quá 100 ký tự"],
        },
        shortName: {
            type: String,
            default: "",
            trim: true,
            maxlength: [4, "Tên viết tắt tối đa 4 ký tự"],
            uppercase: true,
        },
        logo: { type: String, default: "" },
        tournament: {
            type: Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },
        captain: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        members: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                role: {
                    type: String,
                    enum: ["captain", "player", "substitute"],
                    default: "player",
                },
                jerseyNumber: Number,
                position: String,
                joinedAt: { type: Date, default: Date.now },
            },
        ],
        seed: { type: Number },
        group: { type: String },
        stats: {
            played: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            draws: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            penaltyWins: { type: Number, default: 0 },
            penaltyLosses: { type: Number, default: 0 },
            goalsFor: { type: Number, default: 0 },
            goalsAgainst: { type: Number, default: 0 },
            goalDifference: { type: Number, default: 0 },
            points: { type: Number, default: 0 },
            form: [{ type: String, enum: ["W", "D", "L", "PW", "PL"] }],
        },
        status: {
            type: String,
            enum: ["active", "eliminated", "withdrawn", "disqualified"],
            default: "active",
        },
        registeredAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Indexes
TeamSchema.index({ tournament: 1 });
TeamSchema.index({ captain: 1 });
TeamSchema.index({ "members.user": 1 });
TeamSchema.index({ tournament: 1, group: 1 });

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
