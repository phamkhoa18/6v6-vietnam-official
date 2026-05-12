import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    categoryRef?: mongoose.Types.ObjectId;
    tags: string[];
    author: mongoose.Types.ObjectId;
    status: "draft" | "published";
    isPinned: boolean;
    isFeatured: boolean;
    views: number;
    readingTime: number;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        title: {
            type: String,
            required: [true, "Vui lòng nhập tiêu đề"],
            trim: true,
            maxlength: [300, "Tiêu đề không được quá 300 ký tự"],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        excerpt: {
            type: String,
            default: "",
            maxlength: [500, "Tóm tắt không được quá 500 ký tự"],
        },
        content: {
            type: String,
            default: "",
        },
        coverImage: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            default: "news",
        },
        categoryRef: {
            type: Schema.Types.ObjectId,
            ref: "Category",
        },
        tags: [{ type: String }],
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        isPinned: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        readingTime: { type: Number, default: 1 },
        publishedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug
PostSchema.pre("save", function () {
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

    // Auto-calculate reading time (~200 words/min)
    if (this.isModified("content") && this.content) {
        const wordCount = this.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
        this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
});

// Indexes
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1 });
PostSchema.index({ isPinned: 1 });
PostSchema.index({ isFeatured: 1 });
PostSchema.index({ tags: 1 });

const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
