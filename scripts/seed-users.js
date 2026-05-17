/**
 * Seed 500 fake users for testing.
 * Run: node scripts/seed-users.js
 */
const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://localhost:27017/6v6vietnam";

// Vietnamese-style name data
const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const dem = ["Văn", "Thị", "Đức", "Minh", "Quốc", "Hữu", "Thanh", "Công", "Hoàng", "Xuân", "Đình", "Trọng", "Quang", "Tiến", "Bảo", ""];
const ten = ["An", "Bình", "Cường", "Dũng", "Em", "Phú", "Giang", "Hải", "Khoa", "Lâm", "Minh", "Nam", "Phong", "Quân", "Sơn", "Tùng", "Uy", "Vinh", "Hùng", "Đạt", "Thắng", "Long", "Huy", "Kiên", "Trung", "Thịnh", "Tú", "Đức", "Tuấn", "Hiếu"];
const nicknames = ["Flash", "Ronaldo", "Messi", "Neymar", "Pele", "Zidane", "CR7", "KDB", "Salah", "Mbappe", "Haaland", "Vini", "Modric", "Kroos", "Gavi", "Pedri", "Saka", "Foden", "Kane", "Son", "Lukaku", "Bale", "Hazard", "Pogba", "Bruno", "Mount", "Rice", "Jude", "Palmer", "Cole"];
const provinces = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Khánh Hòa", "Nghệ An", "Thanh Hóa", "Bắc Ninh", "Quảng Ninh", "Lâm Đồng", "Thừa Thiên Huế", "Bà Rịa-Vũng Tàu", "Long An"];
const teams = ["FC Anh Em", "FC Đại Bàng", "FC Sao Vàng", "FC Phượng Hoàng", "FC Thunder", "FC Rồng Lửa", "FC Sấm Sét", "FC Bão Tố", "FC Hổ Vằn", "FC Chiến Binh", "FC Thần Tốc", "FC Lửa Thiêng", "FC Đồng Tâm", "FC Ngôi Sao", "FC Vô Địch", "FC Tinh Tú"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Counter schema
const CounterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

// User schema (minimal for seeding)
const UserSchema = new mongoose.Schema({
    playerId: { type: Number, unique: true, sparse: true },
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    avatar: String,
    phone: String,
    bio: String,
    jerseyNumber: Number,
    dateOfBirth: String,
    province: String,
    nickname: String,
    teamName: String,
    facebookName: String,
    facebookLink: String,
    stats: {
        tournamentsCreated: { type: Number, default: 0 },
        tournamentsJoined: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        goalsScored: { type: Number, default: 0 },
        goalsConceded: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function getNextPlayerId() {
    const c = await Counter.findByIdAndUpdate("playerId", { $inc: { seq: 1 } }, { new: true, upsert: true });
    return c.seq;
}

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const existingCount = await User.countDocuments();
    console.log(`📊 Existing users: ${existingCount}`);

    const users = [];
    for (let i = 0; i < 500; i++) {
        const h = pick(ho);
        const d = pick(dem);
        const t = pick(ten);
        const fullName = d ? `${h} ${d} ${t}` : `${h} ${t}`;
        const playerId = await getNextPlayerId();
        const nick = `${pick(nicknames)}${rand(1, 99)}`;
        const dob = `${rand(1985, 2005)}-${String(rand(1, 12)).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`;

        users.push({
            playerId,
            name: fullName,
            email: `player${playerId}@6v6test.vn`,
            password: "$2b$10$dummy.hashed.password.placeholder.string", // not real
            role: "user",
            phone: `09${rand(10000000, 99999999)}`,
            nickname: nick,
            province: pick(provinces),
            teamName: pick(teams),
            jerseyNumber: rand(1, 99),
            dateOfBirth: dob,
            facebookName: fullName,
            facebookLink: `https://facebook.com/${nick.toLowerCase()}`,
            bio: `Cầu thủ phong trào đến từ ${pick(provinces)}. Vị trí yêu thích: ${pick(["Thủ môn", "Hậu vệ", "Tiền vệ", "Tiền đạo"])}. ⚽`,
            stats: {
                tournamentsCreated: 0,
                tournamentsJoined: rand(0, 15),
                wins: rand(0, 30),
                losses: rand(0, 20),
                draws: rand(0, 10),
                goalsScored: rand(0, 50),
                goalsConceded: rand(0, 40),
            },
            isActive: true,
            isVerified: true,
        });

        if ((i + 1) % 50 === 0) process.stdout.write(`\r⏳ Preparing ${i + 1}/500...`);
    }

    console.log("\n📤 Inserting 500 users...");
    await User.insertMany(users);
    console.log("🎉 Done! 500 users created.");

    const totalNow = await User.countDocuments();
    console.log(`📊 Total users now: ${totalNow}`);

    await mongoose.disconnect();
}

seed().catch(err => { console.error("❌ Error:", err); process.exit(1); });
