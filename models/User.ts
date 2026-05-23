import mongoose, { Schema, Document, Model } from "mongoose";
import Counter from "./Counter";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    playerId: number; // Auto-incrementing unique permanent ID (1, 2, 3, ...)
    name: string;
    email: string;
    password: string;
    role: "admin" | "manager" | "user";
    avatar?: string;
    phone?: string;
    bio?: string;
    jerseyNumber?: number; // Số áo
    dateOfBirth?: string;
    country?: string;
    province?: string;
    nickname?: string;
    gamerId?: string;
    teamName?: string;
    facebookName?: string;
    facebookLink?: string;
    stats: {
        tournamentsCreated: number;
        tournamentsJoined: number;
        wins: number;
        losses: number;
        draws: number;
        goalsScored: number;
        goalsConceded: number;
    };
    isActive: boolean;
    isVerified: boolean;
    verificationCode?: string;
    verificationCodeExpires?: Date;
    resetPasswordCode?: string;
    resetPasswordCodeExpires?: Date;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        playerId: {
            type: Number,
        },
        name: {
            type: String,
            required: [true, "Vui lòng nhập họ và tên"],
            trim: true,
            maxlength: [100, "Tên không được quá 100 ký tự"],
        },
        email: {
            type: String,
            required: [true, "Vui lòng nhập email"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
        },
        password: {
            type: String,
            required: [true, "Vui lòng nhập mật khẩu"],
            minlength: [8, "Mật khẩu phải có ít nhất 8 ký tự"],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ["admin", "manager", "user"],
            default: "user",
        },
        avatar: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
            maxlength: [500, "Bio không được quá 500 ký tự"],
        },
        jerseyNumber: {
            type: Number,
        },
        dateOfBirth: {
            type: String,
            default: "",
        },
        country: {
            type: String,
            default: "Việt Nam",
        },
        province: {
            type: String,
            default: "",
        },
        nickname: {
            type: String,
            default: "",
        },
        gamerId: {
            type: String,
            default: "",
        },
        teamName: {
            type: String,
            default: "",
            maxlength: [100, "Tên team không được quá 100 ký tự"],
        },
        facebookName: {
            type: String,
            default: "",
        },
        facebookLink: {
            type: String,
            default: "",
        },
        stats: {
            tournamentsCreated: { type: Number, default: 0 },
            tournamentsJoined: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            draws: { type: Number, default: 0 },
            goalsScored: { type: Number, default: 0 },
            goalsConceded: { type: Number, default: 0 },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationCode: {
            type: String,
            select: false,
        },
        verificationCodeExpires: {
            type: Date,
            select: false,
        },
        resetPasswordCode: {
            type: String,
            select: false,
        },
        resetPasswordCodeExpires: {
            type: Date,
            select: false,
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
UserSchema.index({ playerId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

// Pre-save hook: auto-generate Player ID for new users
UserSchema.pre("save", async function () {
    if (this.isNew && !this.playerId) {
        try {
            const seq = await Counter.getNextSequence("playerId");
            this.playerId = seq;
        } catch (err) {
            console.error("Failed to generate Player ID:", err);
        }
    }
});

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
