/**
 * Seed 6v6 Tournament — Dùng user thật từ DB
 * 
 * Flow chuẩn:
 *   1. Lấy danh sách user thật từ DB
 *   2. Tạo Registration (giống form Đăng ký thi đấu)
 *   3. Approve Registration → Tạo Team (giống admin duyệt)
 * 
 * Chuẩn data như đi qua form thật trên website.
 * 
 * Usage: node scripts/seed-6v6-tournament.js
 */

const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const TOURNAMENT_ID = "6a07524956d1f187322299e5";

// Tên đội 6v6 — chuẩn format giải sân 6
const TEAM_NAMES = [
    { name: "FC Hùng Vương", short: "HVFC" },
    { name: "Sài Gòn United", short: "SGU" },
    { name: "FC Thủ Đức", short: "TDFC" },
    { name: "Bình Thạnh Stars", short: "BTS" },
    { name: "Quận 7 FC", short: "Q7FC" },
    { name: "FC Tân Phú", short: "TPFC" },
    { name: "Gò Vấp Warriors", short: "GVW" },
    { name: "FC Phú Nhuận", short: "PNFC" },
    { name: "Bình Tân Eagles", short: "BTE" },
    { name: "District 9 FC", short: "D9FC" },
    { name: "FC Tân Bình", short: "TBFC" },
    { name: "Thủ Thiêm FC", short: "TTFC" },
    { name: "FC Nhà Bè", short: "NBFC" },
    { name: "Cần Giờ United", short: "CGU" },
    { name: "Long An FC", short: "LAFC" },
];

const PROVINCES = ["TP. Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Long An", "Tây Ninh", "Bà Rịa-Vũng Tàu", "Cần Thơ", "An Giang"];

async function seed() {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!\n");

    // ============ Load models ============
    // User
    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));
    // Registration
    const RegistrationSchema = new mongoose.Schema({
        tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        playerName: String, phone: String, personalPhoto: String,
        dateOfBirth: String, address: String,
        teamName: String, teamShortName: String, teamLogo: String, teamLineupPhoto: String,
        facebookName: String, facebookLink: String, province: String, notes: String,
        player2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        player2Name: String, player2FacebookName: String, player2FacebookLink: String,
        player3: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        player3Name: String, player3FacebookName: String, player3FacebookLink: String,
        seed: Number, group: String,
        stats: {
            played: { type: Number, default: 0 }, wins: { type: Number, default: 0 },
            draws: { type: Number, default: 0 }, losses: { type: Number, default: 0 },
            penaltyWins: { type: Number, default: 0 }, penaltyLosses: { type: Number, default: 0 },
            goalsFor: { type: Number, default: 0 }, goalsAgainst: { type: Number, default: 0 },
            goalDifference: { type: Number, default: 0 }, points: { type: Number, default: 0 },
            form: [String],
        },
        status: { type: String, default: "pending" },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approvedAt: Date,
        registeredAt: { type: Date, default: Date.now },
        paymentStatus: { type: String, default: "unpaid" },
    }, { timestamps: true, strict: false });
    RegistrationSchema.index({ tournament: 1, user: 1 }, { unique: true });
    const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);

    // Team
    const TeamSchema = new mongoose.Schema({
        name: String, shortName: String, logo: String,
        tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
        captain: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        members: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: { type: String, default: "player" },
            jerseyNumber: Number, position: String,
            joinedAt: { type: Date, default: Date.now },
        }],
        seed: Number, group: String,
        stats: {
            played: { type: Number, default: 0 }, wins: { type: Number, default: 0 },
            draws: { type: Number, default: 0 }, losses: { type: Number, default: 0 },
            penaltyWins: { type: Number, default: 0 }, penaltyLosses: { type: Number, default: 0 },
            goalsFor: { type: Number, default: 0 }, goalsAgainst: { type: Number, default: 0 },
            goalDifference: { type: Number, default: 0 }, points: { type: Number, default: 0 },
            form: [String],
        },
        status: { type: String, default: "active" },
        registeredAt: { type: Date, default: Date.now },
    }, { timestamps: true, strict: false });
    TeamSchema.index({ tournament: 1 });
    const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);

    // Tournament
    const Tournament = mongoose.models.Tournament || mongoose.model("Tournament", new mongoose.Schema({}, { strict: false }));

    // ============ 1. Verify tournament ============
    const tournament = await Tournament.findById(TOURNAMENT_ID).lean();
    if (!tournament) { console.error("❌ Giải đấu không tồn tại!"); process.exit(1); }
    console.log(`🏆 Giải đấu: ${tournament.title}`);
    console.log(`   gameMode: ${tournament.gameMode} | format: ${tournament.format} | maxSlots: ${tournament.maxSlots}`);
    console.log(`   Status: ${tournament.status} | Current: ${tournament.currentSlots}/${tournament.maxSlots}\n`);

    // ============ 2. Lấy user thật từ DB ============
    const allUsers = await User.find({ isActive: { $ne: false } }).select("_id name avatar phone facebookName facebookLink province").lean();
    console.log(`👥 Tổng user trong DB: ${allUsers.length}`);

    // Lấy admin
    const admin = await User.findOne({ role: { $in: ["admin", "manager"] } }).lean();
    if (!admin) { console.error("❌ Không tìm thấy admin!"); process.exit(1); }
    console.log(`👤 Admin (duyệt): ${admin.name}\n`);

    // Lấy list user đã đăng ký giải này rồi
    const existingRegs = await Registration.find({
        tournament: TOURNAMENT_ID,
        status: { $nin: ["rejected", "withdrawn"] },
    }).select("user").lean();
    const registeredUserIds = new Set(existingRegs.map(r => r.user.toString()));
    console.log(`📋 Đã có ${registeredUserIds.size} đăng ký\n`);

    // Lọc user chưa đăng ký
    const availableUsers = allUsers.filter(u => !registeredUserIds.has(u._id.toString()));
    console.log(`✅ User khả dụng (chưa đăng ký): ${availableUsers.length}`);

    // Tính số slot còn trống
    const slotsLeft = (tournament.maxSlots || 16) - (tournament.currentSlots || 0);
    const toCreate = Math.min(slotsLeft, availableUsers.length, TEAM_NAMES.length);
    console.log(`🎯 Sẽ tạo ${toCreate} đội (slot trống: ${slotsLeft})\n`);

    if (toCreate === 0) {
        console.log("⏭️  Không cần tạo thêm đội nào.");
        await mongoose.disconnect();
        process.exit(0);
    }

    // ============ 3. Đăng ký từng đội ============
    let created = 0;
    for (let i = 0; i < toCreate; i++) {
        const user = availableUsers[i];
        const teamInfo = TEAM_NAMES[i];
        const province = user.province || PROVINCES[i % PROVINCES.length];
        const registeredAt = new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000);

        console.log(`--- [${i + 1}/${toCreate}] ${teamInfo.name} ---`);
        console.log(`   Captain: ${user.name} (ID: ${user._id})`);

        // BƯỚC 1: Tạo Registration — chuẩn form đăng ký 6v6
        // Form 6v6 gửi: playerName, phone, facebookName, facebookLink, province, teamName, teamShortName
        const regData = {
            tournament: TOURNAMENT_ID,
            user: user._id,
            // === Form fields — giống hệt gửi từ UI ===
            playerName: user.name,
            phone: user.phone || `09${String(Math.floor(10000000 + Math.random() * 90000000))}`,
            facebookName: user.facebookName || user.name,
            facebookLink: user.facebookLink || `https://facebook.com/${user.name.toLowerCase().replace(/\s+/g, '.')}`,
            province: province,
            teamName: teamInfo.name,
            teamShortName: teamInfo.short,
            notes: `Đội bóng sân 6 khu vực ${province}`,
            // === End form fields ===
            status: "pending",
            registeredAt: registeredAt,
            paymentStatus: "unpaid",
        };

        try {
            const reg = await Registration.create(regData);
            console.log(`   📝 Registration: ${reg._id} (pending)`);

            // BƯỚC 2: Approve Registration — giống admin bấm "Duyệt"
            reg.status = "active";
            reg.approvedBy = admin._id;
            reg.approvedAt = new Date();
            await reg.save();
            console.log(`   ✅ Approved!`);

            // BƯỚC 3: Tạo Team — giống hệt logic trong API registrations PATCH
            const existingTeam = await Team.findOne({ tournament: TOURNAMENT_ID, captain: user._id });
            if (!existingTeam) {
                const team = await Team.create({
                    name: reg.teamName || reg.playerName || "Đội",
                    shortName: reg.teamShortName || reg.teamName?.substring(0, 4).toUpperCase() || "TEAM",
                    logo: reg.teamLogo || reg.personalPhoto || "",
                    tournament: TOURNAMENT_ID,
                    captain: user._id,
                    members: [{ user: user._id, role: "captain", joinedAt: new Date() }],
                    status: "active",
                    registeredAt: registeredAt,
                });
                console.log(`   ⚽ Team created: ${team.name} (${team.shortName})`);
            }

            // BƯỚC 4: Increment slot count
            await Tournament.findByIdAndUpdate(TOURNAMENT_ID, { $inc: { currentSlots: 1 } });

            created++;
        } catch (err) {
            if (err.code === 11000) {
                console.log(`   ⏭️  User đã đăng ký rồi, bỏ qua`);
            } else {
                console.error(`   ❌ Lỗi: ${err.message}`);
            }
        }
    }

    // ============ 4. Cập nhật chính xác số slot ============
    const totalTeams = await Team.countDocuments({ tournament: TOURNAMENT_ID });
    await Tournament.findByIdAndUpdate(TOURNAMENT_ID, {
        currentSlots: totalTeams,
        currentTeams: totalTeams,
    });

    console.log(`\n🎉 Hoàn tất! Đã tạo ${created} đội mới.`);
    console.log(`📊 Tổng đội trong giải: ${totalTeams}/${tournament.maxSlots}`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Lỗi:", err);
    process.exit(1);
});
