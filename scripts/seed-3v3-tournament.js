/**
 * Seed 3v3 Tournament Registrations
 * Tournament: 6a0ff0c0296a58199b8c62de (3v3 vòng tròn)
 * 
 * This script:
 * 1. Gets real users from DB (excluding admin who already registered)
 * 2. Groups them into teams of 3 (captain + player2 + player3)
 * 3. Creates registrations following the exact form flow
 * 4. Auto-approves each registration
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const TOURNAMENT_ID = '6a0ff0c0296a58199b8c62de';
const ADMIN_ID = '6a0179a8dd88740edb789374';
const TEAMS_TO_CREATE = 15; // 16 slots total, admin already has 1

const PROVINCES = [
    'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương',
    'Đồng Nai', 'Long An', 'Bà Rịa-Vũng Tàu', 'Khánh Hòa', 'Bắc Ninh',
    'Hải Phòng', 'Nghệ An', 'Thanh Hóa', 'Thừa Thiên Huế', 'Quảng Nam',
];

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Load models
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Registration = mongoose.models.Registration || mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
    const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', new mongoose.Schema({}, { strict: false }));

    const tournament = await Tournament.findById(TOURNAMENT_ID).lean();
    if (!tournament) { console.error('❌ Tournament not found'); process.exit(1); }
    console.log(`📋 Tournament: ${tournament.title} (${tournament.gameMode}, ${tournament.format})`);
    console.log(`   Slots: ${tournament.currentSlots || tournament.currentTeams || 0}/${tournament.maxSlots || tournament.maxTeams}`);

    // Get existing registrations to avoid duplicates
    const existingRegs = await Registration.find({
        tournament: TOURNAMENT_ID,
        status: { $nin: ['rejected', 'withdrawn'] }
    }).lean();
    const usedUserIds = new Set();
    existingRegs.forEach(r => {
        if (r.user) usedUserIds.add(r.user.toString());
        if (r.player2) usedUserIds.add(r.player2.toString());
        if (r.player3) usedUserIds.add(r.player3.toString());
    });
    console.log(`   Existing registrations: ${existingRegs.length}, used users: ${usedUserIds.size}`);

    // Get available users (exclude admin and already-used users)
    const excludeIds = [...usedUserIds].map(id => new mongoose.Types.ObjectId(id));
    excludeIds.push(new mongoose.Types.ObjectId(ADMIN_ID));
    
    const availableUsers = await User.find({
        isActive: true,
        _id: { $nin: excludeIds }
    }).select('name avatar playerId nickname phone facebookName facebookLink province dateOfBirth address').lean();

    const needed = TEAMS_TO_CREATE * 3; // 3 players per team
    if (availableUsers.length < needed) {
        console.error(`❌ Not enough users! Need ${needed}, have ${availableUsers.length}`);
        process.exit(1);
    }
    console.log(`👥 Available users: ${availableUsers.length}, need: ${needed}`);

    // Shuffle users
    for (let i = availableUsers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableUsers[i], availableUsers[j]] = [availableUsers[j], availableUsers[i]];
    }

    // Create registrations
    let created = 0;
    for (let i = 0; i < TEAMS_TO_CREATE; i++) {
        const captain = availableUsers[i * 3];
        const player2 = availableUsers[i * 3 + 1];
        const player3 = availableUsers[i * 3 + 2];

        if (!captain || !player2 || !player3) {
            console.error(`❌ Not enough users for team ${i + 1}`);
            break;
        }

        const province = captain.province || PROVINCES[i % PROVINCES.length];

        const regData = {
            tournament: new mongoose.Types.ObjectId(TOURNAMENT_ID),
            user: captain._id,
            playerName: captain.name,
            phone: captain.phone || `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            dateOfBirth: captain.dateOfBirth || new Date(1995 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            address: captain.address || `${Math.floor(Math.random() * 200) + 1} Đường ${['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Võ Văn Tần', 'Hai Bà Trưng'][i % 5]}, ${province}`,
            province: province,
            personalPhoto: captain.avatar || '',
            facebookName: captain.facebookName || captain.nickname || captain.name,
            facebookLink: captain.facebookLink || `https://facebook.com/${captain.nickname || 'user' + captain.playerId}`,

            // Player 2
            player2: player2._id,
            player2Name: player2.name,
            player2FacebookName: player2.facebookName || player2.nickname || player2.name,
            player2FacebookLink: player2.facebookLink || `https://facebook.com/${player2.nickname || 'user' + player2.playerId}`,

            // Player 3
            player3: player3._id,
            player3Name: player3.name,
            player3FacebookName: player3.facebookName || player3.nickname || player3.name,
            player3FacebookLink: player3.facebookLink || `https://facebook.com/${player3.nickname || 'user' + player3.playerId}`,

            status: 'pending',
            registeredAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // random within last week
        };

        try {
            const reg = await Registration.create(regData);

            // Auto-approve
            reg.status = 'active';
            reg.approvedBy = new mongoose.Types.ObjectId(ADMIN_ID);
            reg.approvedAt = new Date();
            await reg.save();

            // Create Team record so brackets can be drawn
            const Team = mongoose.models.Team || mongoose.model('Team', new mongoose.Schema({}, { strict: false }));
            await Team.create({
                name: reg.playerName || 'Đội',
                shortName: reg.playerName ? reg.playerName.substring(0,4).toUpperCase() : 'TEAM',
                logo: reg.personalPhoto || '',
                tournament: new mongoose.Types.ObjectId(TOURNAMENT_ID),
                captain: captain._id,
                members: [
                    { user: captain._id, role: 'captain', joinedAt: new Date() },
                    { user: player2._id, role: 'player', joinedAt: new Date() },
                    { user: player3._id, role: 'player', joinedAt: new Date() }
                ],
                status: 'active'
            });

            // Increment currentSlots
            await Tournament.findByIdAndUpdate(TOURNAMENT_ID, { $inc: { currentSlots: 1, currentTeams: 1 } });

            created++;
            console.log(`  ✅ ${created}/${TEAMS_TO_CREATE} | ${captain.name} + ${player2.name} + ${player3.name}`);
        } catch (err) {
            console.error(`  ❌ Failed team ${i + 1}:`, err.message);
        }
    }

    // Final state
    const finalT = await Tournament.findById(TOURNAMENT_ID).lean();
    const finalRegs = await Registration.countDocuments({ tournament: TOURNAMENT_ID, status: { $nin: ['rejected', 'withdrawn'] } });
    console.log(`\n🏁 Done! Created ${created} registrations`);
    console.log(`   Total registrations: ${finalRegs}`);
    console.log(`   Tournament slots: ${finalT.currentSlots || finalT.currentTeams}/${finalT.maxSlots || finalT.maxTeams}`);

    process.exit();
}

main().catch(err => { console.error(err); process.exit(1); });
