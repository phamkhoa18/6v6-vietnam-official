import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITournament extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    rules: string;
    banner?: string;
    thumbnail?: string;
    seo?: {
        title?: string;
        description?: string;
    };
    createdBy: mongoose.Types.ObjectId;

    // Core
    gameMode: "1v1" | "2v2" | "3v3" | "6v6";
    format: "single_elimination" | "round_robin" | "group_stage";
    status: "draft" | "registration" | "ongoing" | "completed" | "cancelled";

    // Capacity
    maxSlots: number;
    currentSlots: number;

    // Schedule
    schedule: {
        registrationStart?: Date;
        registrationEnd?: Date;
        tournamentStart?: Date;
        tournamentEnd?: Date;
    };

    // Prize
    prize: {
        total: string;
        first: string;
        second: string;
        third: string;
        description?: string;
    };

    // Scoring per match
    scoring: {
        pointsPerWin: number;           // default: 3
        pointsPerDraw: number;          // default: 1
        pointsPerPenaltyWin: number;    // default: 2
        pointsPerPenaltyLoss: number;   // default: 1
        pointsPerLoss: number;          // default: 0
        // Group stage / round robin
        tiebreakers: string[];
        teamsPerGroup?: number;
        advancePerGroup?: number;
    };

    // Match settings
    settings: {
        matchDuration: number;
        extraTime: boolean;
        penalties: boolean;
    };

    // Contact
    contact: {
        phone?: string;
        facebook?: string;
        zalo?: string;
    };

    location?: string;
    isOnline: boolean;
    tags: string[];
    views: number;
    isPublic: boolean;
    isFeatured: boolean;

    // Bracket / Group
    groups?: {
        name: string;
        slots: mongoose.Types.ObjectId[];
    }[];
    brackets?: {
        round: number;
        matches: mongoose.Types.ObjectId[];
    }[];
    videos?: {
        url: string;
        title: string;
        type: "youtube" | "shorts" | "tiktok" | "other";
        createdAt: Date;
    }[];

    createdAt: Date;
    updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
    {
        title: {
            type: String,
            required: [true, "Vui lòng nhập tên giải đấu"],
            trim: true,
            maxlength: [200, "Tên giải đấu không được quá 200 ký tự"],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            default: "",
            maxlength: [5000, "Mô tả không được quá 5000 ký tự"],
        },
        rules: {
            type: String,
            default: "",
            maxlength: [10000, "Nội quy không được quá 10000 ký tự"],
        },
        banner: { type: String, default: "" },
        thumbnail: { type: String, default: "" },
        seo: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Core
        gameMode: {
            type: String,
            enum: ["1v1", "2v2", "3v3", "6v6"],
            required: [true, "Vui lòng chọn chế độ thi đấu"],
        },
        format: {
            type: String,
            enum: ["single_elimination", "round_robin", "group_stage"],
            default: "single_elimination",
        },
        status: {
            type: String,
            enum: ["draft", "registration", "ongoing", "completed", "cancelled"],
            default: "draft",
        },

        // Capacity
        maxSlots: {
            type: Number,
            required: [true, "Vui lòng nhập số lượng tối đa"],
            min: [2, "Phải có ít nhất 2"],
            max: [256, "Tối đa 256"],
        },
        currentSlots: {
            type: Number,
            default: 0,
        },

        // Schedule
        schedule: {
            registrationStart: { type: Date },
            registrationEnd: { type: Date },
            tournamentStart: { type: Date },
            tournamentEnd: { type: Date },
        },

        // Prize
        prize: {
            total: { type: String, default: "0 VNĐ" },
            first: { type: String, default: "" },
            second: { type: String, default: "" },
            third: { type: String, default: "" },
            description: { type: String, default: "" },
        },

        // Scoring
        scoring: {
            pointsPerWin: { type: Number, default: 3 },
            pointsPerDraw: { type: Number, default: 1 },
            pointsPerPenaltyWin: { type: Number, default: 2 },
            pointsPerPenaltyLoss: { type: Number, default: 1 },
            pointsPerLoss: { type: Number, default: 0 },
            tiebreakers: [{ type: String }],
            teamsPerGroup: { type: Number },
            advancePerGroup: { type: Number },
        },

        // Settings
        settings: {
            matchDuration: { type: Number, default: 25 },
            extraTime: { type: Boolean, default: false },
            penalties: { type: Boolean, default: true },
        },

        // Contact
        contact: {
            phone: { type: String, default: "" },
            facebook: { type: String, default: "" },
            zalo: { type: String, default: "" },
        },

        location: { type: String, default: "" },
        isOnline: { type: Boolean, default: false },
        tags: [{ type: String }],
        views: { type: Number, default: 0 },
        isPublic: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },

        // Bracket / Group
        groups: [
            {
                name: String,
                slots: [{ type: Schema.Types.ObjectId }],
            },
        ],
        brackets: [
            {
                round: Number,
                matches: [{ type: Schema.Types.ObjectId, ref: "Match" }],
            },
        ],
        
        // Video Highlights
        videos: [
            {
                url: String,
                title: String,
                type: { type: String, enum: ["youtube", "shorts", "tiktok", "other"], default: "youtube" },
                createdAt: { type: Date, default: Date.now },
            }
        ]
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from title
TournamentSchema.pre("save", async function (this: ITournament) {
    if (this.isModified("title") || !this.slug) {
        this.slug =
            this.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") +
            "-" +
            Date.now().toString(36);
    }

    // Auto-set tiebreakers for group/round-robin if not set
    if (
        this.isModified("format") &&
        ["round_robin", "group_stage"].includes(this.format) &&
        (!this.scoring?.tiebreakers || this.scoring.tiebreakers.length === 0)
    ) {
        this.scoring.tiebreakers = ["points", "goalDifference", "goalsFor", "headToHead"];
        if (this.format === "group_stage") {
            this.scoring.teamsPerGroup = this.scoring.teamsPerGroup || 4;
            this.scoring.advancePerGroup = this.scoring.advancePerGroup || 2;
        }
    }
});

// Indexes
TournamentSchema.index({ createdBy: 1 });
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ gameMode: 1 });
TournamentSchema.index({ isFeatured: 1 });
TournamentSchema.index({ "schedule.tournamentStart": 1 });

const Tournament: Model<ITournament> =
    mongoose.models.Tournament ||
    mongoose.model<ITournament>("Tournament", TournamentSchema);

export default Tournament;
