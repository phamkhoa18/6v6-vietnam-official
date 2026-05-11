import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Registration — Dùng cho giải 1v1 (đăng ký cá nhân).
 * Với 2v2/3v3/6v6, dùng Team model thay thế.
 */
export interface IRegistration extends Document {
    _id: mongoose.Types.ObjectId;
    tournament: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
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

const RegistrationSchema = new Schema<IRegistration>(
    {
        tournament: {
            type: Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
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
RegistrationSchema.index({ tournament: 1 });
RegistrationSchema.index({ user: 1 });
RegistrationSchema.index({ tournament: 1, user: 1 }, { unique: true });

const Registration: Model<IRegistration> =
    mongoose.models.Registration ||
    mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
