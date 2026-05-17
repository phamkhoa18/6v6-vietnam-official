// Seed navbar menu items into MongoDB
// Run: npx tsx scripts/seed-menu.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/6v6vietnam";

const MenuItemSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        href: { type: String, required: true },
        icon: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
        openInNewTab: { type: Boolean, default: false },
        children: [
            {
                label: { type: String, required: true },
                href: { type: String, required: true },
                icon: { type: String, default: "" },
                order: { type: Number, default: 0 },
                isVisible: { type: Boolean, default: true },
                openInNewTab: { type: Boolean, default: false },
            },
        ],
    },
    { _id: true }
);

const SiteMenuSchema = new mongoose.Schema(
    {
        location: { type: String, enum: ["navbar", "footer", "sidebar"], required: true, unique: true },
        items: [MenuItemSchema],
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const SiteMenu = mongoose.models.SiteMenu || mongoose.model("SiteMenu", SiteMenuSchema);

async function seed() {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!\n");

    const navbarItems = [
        { label: "Giải đấu", href: "/giai-dau", icon: "Trophy", order: 1, isVisible: true, openInNewTab: false },
        { label: "Tin tức", href: "/tin-tuc", icon: "Newspaper", order: 2, isVisible: true, openInNewTab: false },
        { label: "BXH Small-sided games", href: "/bxh", icon: "Users", order: 3, isVisible: true, openInNewTab: false },
        { label: "BXH 6v6", href: "/bxh-6v6", icon: "Users", order: 4, isVisible: true, openInNewTab: false },
        { label: "Video", href: "/video", icon: "Gamepad2", order: 5, isVisible: true, openInNewTab: false },
    ];

    // Upsert: replace existing navbar menu or create new
    const result = await SiteMenu.findOneAndUpdate(
        { location: "navbar" },
        { location: "navbar", items: navbarItems },
        { upsert: true, new: true }
    );

    console.log("✅ Navbar menu seeded successfully!");
    console.log(`   Location: ${result.location}`);
    console.log(`   Items: ${result.items.length}`);
    result.items.forEach((item: any, i: number) => {
        console.log(`     ${i + 1}. ${item.label} → ${item.href}`);
    });

    await mongoose.disconnect();
    console.log("\n🔌 Disconnected. Done!");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
