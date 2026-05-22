/**
 * Seed script: Bơm tất cả user vào giải đấu 6a09691a671d2ade9b0cd864 (2v2)
 * Mỗi cặp 2 user sẽ tạo 1 Registration + 1 Team
 * Usage: npx tsx scripts/seed-tournament-registrations.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const TOURNAMENT_ID = "6a09691a671d2ade9b0cd864";

async function main() {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/6v6vietnam");
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db!;
    const tournamentsCol = db.collection("tournaments");
    const usersCol = db.collection("users");
    const registrationsCol = db.collection("registrations");
    const teamsCol = db.collection("teams");

    const tournamentOid = new mongoose.Types.ObjectId(TOURNAMENT_ID);

    // Get tournament
    const tournament = await tournamentsCol.findOne({ _id: tournamentOid });
    if (!tournament) {
        console.error("❌ Tournament not found");
        process.exit(1);
    }
    console.log(`🏆 Tournament: ${tournament.title} (${tournament.gameMode}, ${tournament.format})`);

    // Get all users
    const allUsers = await usersCol.find({}).project({ _id: 1, name: 1, playerId: 1, avatar: 1 }).toArray();
    console.log(`👥 Total users: ${allUsers.length}`);

    // Get already registered user IDs
    const existingRegs = await registrationsCol.find({ tournament: tournamentOid }).project({ user: 1 }).toArray();
    const registeredUserIds = new Set(existingRegs.map(r => r.user.toString()));
    console.log(`📝 Already registered: ${registeredUserIds.size}`);

    // Filter out already registered users
    const availableUsers = allUsers.filter(u => !registeredUserIds.has(u._id.toString()));
    console.log(`✨ Available users to register: ${availableUsers.length}`);

    if (availableUsers.length < 2) {
        console.log("⚠️ Not enough users to create pairs");
        process.exit(0);
    }

    // Shuffle users randomly
    for (let i = availableUsers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableUsers[i], availableUsers[j]] = [availableUsers[j], availableUsers[i]];
    }

    // Create pairs (2v2: captain + player2)
    const pairs: { captain: any; player2: any }[] = [];
    for (let i = 0; i + 1 < availableUsers.length; i += 2) {
        pairs.push({ captain: availableUsers[i], player2: availableUsers[i + 1] });
    }

    console.log(`🎮 Creating ${pairs.length} registrations (2v2 pairs)...`);

    const teamNames = [
        "Phoenix FC", "Thunder Storm", "Dragon Kings", "Shadow Wolves", "Iron Eagles",
        "Golden Lions", "Dark Knights", "Blazing Stars", "Arctic Foxes", "Steel Titans",
        "Crimson Hawks", "Storm Raiders", "Viper Squad", "Lunar Wolves", "Fire Serpents",
        "Ice Phoenix", "Royal Guards", "Night Owls", "Wave Riders", "Sky Warriors",
        "Cyber Lions", "Ultra Stars", "Neo Tigers", "Apex Legends", "Flash Point",
        "Blue Storm", "Red Devils", "Wild Cats", "Power Rangers", "Elite Force",
        "Saigon FC", "Hà Nội United", "Đà Nẵng Stars", "Huế Warriors", "Cần Thơ FC",
        "Bình Dương Eagles", "Vũng Tàu Sharks", "Nha Trang Waves", "Đà Lạt Pines", "Quảng Ninh Coal",
        "Hải Phòng Port", "Thanh Hóa FC", "Nghệ An Bulls", "Bắc Ninh Stars", "Nam Định FC",
        "Tây Ninh Thunder", "Long An FC", "Tiền Giang Rivers", "Đồng Nai FC", "Lâm Đồng Highlands",
        "FC Arsenal VN", "FC Barcelona VN", "FC Real Madrid VN", "FC Liverpool VN", "FC Man City VN",
        "FC Chelsea VN", "FC PSG VN", "FC Bayern VN", "FC Juventus VN", "FC Inter VN",
        "FC Milan VN", "FC Dortmund VN", "FC Ajax VN", "FC Porto VN", "FC Benfica VN",
        "Wolves Gaming", "Tigers eSport", "Bears United", "Pandas FC", "Sharks Gaming",
        "Falcons eSport", "Cobras FC", "Ravens Gaming", "Hawks United", "Bulls eSport",
        "Stallions FC", "Panthers Gaming", "Cougars eSport", "Leopards FC", "Rhinos United",
        "FC Thủ Đức", "FC Gò Vấp", "FC Tân Bình", "FC Bình Thạnh", "FC Phú Nhuận",
        "FC Quận 1", "FC Quận 7", "FC Quận 9", "FC Thủ Thiêm", "FC Nhà Bè",
        "FC Củ Chi", "FC Hóc Môn", "FC Bình Chánh", "FC Quận 2", "FC Quận 3",
        "Siêu Nhân FC", "Avengers VN", "Justice League VN", "X-Men FC", "Transformers VN",
        "Ninja Turtles FC", "Power Pack", "Super Squad", "Hero Team", "Legend FC",
        "Victory FC", "Champion Stars", "Winner Club", "Trophy Hunters", "Gold Rush FC",
        "Diamond FC", "Platinum Stars", "Silver Arrows", "Bronze Shields", "Crystal FC",
        "Emerald City", "Ruby Stars", "Sapphire FC", "Onyx United", "Pearl Gaming",
        "Meteor FC", "Comet Stars", "Galaxy United", "Nebula FC", "Cosmos Gaming",
        "Orbit FC", "Solar Flare", "Lunar Eclipse", "Star Dust FC", "Supernova Gaming",
        "Quantum FC", "Proton Stars", "Neutron United", "Electron FC", "Photon Gaming",
        "Rocket FC", "Missile Stars", "Bullet Train FC", "Turbo United", "Nitro Gaming",
        "Blaze FC", "Inferno Stars", "Volcano United", "Lava FC", "Magma Gaming",
        "Frost FC", "Glacier Stars", "Iceberg United", "Snow Storm FC", "Blizzard Gaming",
        "Ocean FC", "Tsunami Stars", "Typhoon United", "Hurricane FC", "Cyclone Gaming",
        "Mountain FC", "Summit Stars", "Peak United", "Ridge FC", "Cliff Gaming",
        "Forest FC", "Jungle Stars", "Safari United", "Savanna FC", "Prairie Gaming",
        "Desert FC", "Oasis Stars", "Mirage United", "Dune FC", "Sand Storm Gaming",
        "River FC", "Lake Stars", "Creek United", "Brook FC", "Stream Gaming",
        "Thunder FC", "Lightning Stars", "Spark United", "Bolt FC", "Flash Gaming",
        "Eagle FC", "Hawk Stars", "Falcon United", "Osprey FC", "Kite Gaming",
        "Lion FC", "Tiger Stars", "Panther United", "Jaguar FC", "Cheetah Gaming",
        "Wolf FC", "Fox Stars", "Coyote United", "Jackal FC", "Hyena Gaming",
        "Bear FC", "Grizzly Stars", "Polar United", "Kodiak FC", "Panda Gaming",
        "Shark FC", "Whale Stars", "Dolphin United", "Orca FC", "Marlin Gaming",
        "Snake FC", "Viper Stars", "Cobra United", "Python FC", "Mamba Gaming",
        "Dragon FC", "Wyvern Stars", "Drake United", "Hydra FC", "Basilisk Gaming",
        "Phoenix Alpha", "Phoenix Beta", "Phoenix Gamma", "Phoenix Delta", "Phoenix Omega",
        "Saigon Heat", "Hanoi Flames", "Danang Surf", "HCMC United", "Vietnam Stars",
        "Mekong Delta FC", "Central Highlands", "North Stars VN", "South Wind FC", "East Coast FC",
        "West Side FC", "Midfield Masters", "Goal Getters", "Clean Sheets FC", "Hat Trick Heroes",
        "Free Kick FC", "Penalty Kings", "Corner Kick FC", "Offside Trap", "Counter Attack FC",
        "Tiki Taka VN", "Catenaccio VN", "Gegenpressing VN", "Total Football VN", "Jogo Bonito VN",
    ];

    let created = 0;

    for (let i = 0; i < pairs.length; i++) {
        const { captain, player2 } = pairs[i];
        const teamName = teamNames[i % teamNames.length] + (i >= teamNames.length ? ` ${Math.floor(i / teamNames.length) + 1}` : "");
        const shortName = teamName.replace(/[^A-Z]/gi, "").substring(0, 4).toUpperCase() || "TEAM";

        const now = new Date();

        // Create Registration
        const reg = {
            tournament: tournamentOid,
            user: captain._id,
            playerName: captain.name || `Player ${captain.playerId || i}`,
            teamName,
            teamShortName: shortName,
            player2: player2._id,
            status: "active",
            approvedAt: now,
            registeredAt: now,
            stats: {
                played: 0, wins: 0, draws: 0, losses: 0,
                penaltyWins: 0, penaltyLosses: 0,
                goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
                points: 0, form: [],
            },
            createdAt: now,
            updatedAt: now,
        };

        try {
            await registrationsCol.insertOne(reg);
        } catch (e: any) {
            if (e.code === 11000) {
                // Duplicate - skip
                continue;
            }
            throw e;
        }

        // Create Team
        const team = {
            name: teamName,
            shortName,
            logo: "",
            tournament: tournamentOid,
            captain: captain._id,
            members: [
                { user: captain._id, role: "captain", joinedAt: now },
                { user: player2._id, role: "player", joinedAt: now },
            ],
            stats: {
                played: 0, wins: 0, draws: 0, losses: 0,
                penaltyWins: 0, penaltyLosses: 0,
                goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
                points: 0, form: [],
            },
            status: "active",
            registeredAt: now,
            createdAt: now,
            updatedAt: now,
        };

        await teamsCol.insertOne(team);
        created++;

        if (created % 50 === 0) {
            console.log(`  ... ${created} pairs created`);
        }
    }

    // Update tournament currentSlots
    await tournamentsCol.updateOne(
        { _id: tournamentOid },
        { $set: { currentSlots: created + (tournament.currentSlots || 0), maxSlots: Math.max(tournament.maxSlots || 16, created + (tournament.currentSlots || 0)) } }
    );

    console.log(`\n🎉 Done! Created ${created} registrations + teams.`);
    console.log(`📊 Updated tournament maxSlots to ${Math.max(tournament.maxSlots || 16, created + (tournament.currentSlots || 0))}`);

    process.exit(0);
}

main().catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
});
