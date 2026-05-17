const mongoose = require('mongoose');
const dbConnect = require('./lib/mongodb').default;
const Registration = require('./models/Registration').default;
const Team = require('./models/Team').default;
const Tournament = require('./models/Tournament').default;

async function syncTeams() {
    await dbConnect();
    const regs = await Registration.find({ status: { $in: ["approved", "active"] } });
    console.log(`Found ${regs.length} approved/active registrations.`);
    for (const reg of regs) {
        const t = await Tournament.findById(reg.tournament);
        if (t && t.gameMode !== "1v1") {
            const existing = await Team.findOne({ tournament: reg.tournament, captain: reg.user });
            if (!existing) {
                console.log(`Creating team for registration ${reg._id}`);
                const members = [{ user: reg.user, role: "captain", joinedAt: new Date() }];
                if (reg.player2) members.push({ user: reg.player2, role: "player", joinedAt: new Date() });
                if (reg.player3) members.push({ user: reg.player3, role: "player", joinedAt: new Date() });
                
                await Team.create({
                    name: reg.teamName || reg.playerName || "Đội",
                    shortName: reg.teamShortName || (reg.teamName ? reg.teamName.substring(0,4).toUpperCase() : "TEAM"),
                    logo: reg.teamLogo || reg.personalPhoto,
                    tournament: reg.tournament,
                    captain: reg.user,
                    members,
                    status: "active"
                });
            }
        }
        reg.status = "active";
        await reg.save();
    }
    console.log("Done");
    process.exit(0);
}
syncTeams().catch(console.error);
