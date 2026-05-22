import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistration extends Document {
    _id: mongoose.Types.ObjectId;
    tournament: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    
    // Registration info
    playerName: string;
    phone?: string;
    personalPhoto?: string;
    dateOfBirth?: string;
    address?: string;
    teamName?: string;
    teamShortName?: string;
    teamLogo?: string;
    teamLineupPhoto?: string;
    
    gamerId?: string;
    nickname?: string;
    facebookName?: string;
    facebookLink?: string;
    province?: string;
    notes?: string;

    // Teammates (for 2v2/3v3)
    player2?: mongoose.Types.ObjectId;
    player2Name?: string;
    player2GamerId?: string;
    player2Nickname?: string;
    player2FacebookName?: string;
    player2FacebookLink?: string;

    player3?: mongoose.Types.ObjectId;
    player3Name?: string;
    player3GamerId?: string;
    player3Nickname?: string;
    player3FacebookName?: string;
    player3FacebookLink?: string;

    // Tournament seeding
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
    status: "pending" | "approved" | "rejected" | "active" | "eliminated" | "withdrawn" | "disqualified";
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    registeredAt: Date;

    // Payment details
    paymentStatus: "unpaid" | "pending_verification" | "paid" | "refunded" | "failed";
    paymentProof?: string;
    paymentMethod?: string;
    paymentDate?: Date;
    paymentAmount?: number;
    paymentConfirmedAt?: Date;

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
        // Registration info
        playerName: { type: String, required: true },
        phone: { type: String },
        personalPhoto: { type: String },
        dateOfBirth: { type: String },
        address: { type: String },
        teamName: { type: String },
        teamShortName: { type: String },
        teamLogo: { type: String },
        teamLineupPhoto: { type: String },
        
        gamerId: { type: String },
        nickname: { type: String },
        facebookName: { type: String },
        facebookLink: { type: String },
        province: { type: String },
        notes: { type: String },

        // Teammates
        player2: { type: Schema.Types.ObjectId, ref: "User" },
        player2Name: { type: String },
        player2GamerId: { type: String },
        player2Nickname: { type: String },
        player2FacebookName: { type: String },
        player2FacebookLink: { type: String },

        player3: { type: Schema.Types.ObjectId, ref: "User" },
        player3Name: { type: String },
        player3GamerId: { type: String },
        player3Nickname: { type: String },
        player3FacebookName: { type: String },
        player3FacebookLink: { type: String },

        // Seeding
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
            default: "pending",
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date },
        rejectionReason: { type: String },
        registeredAt: { type: Date, default: Date.now },

        // Payment details
        paymentStatus: { type: String, default: "unpaid" },
        paymentProof: { type: String },
        paymentMethod: { type: String },
        paymentDate: { type: Date },
        paymentAmount: { type: Number },
        paymentConfirmedAt: { type: Date },
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
