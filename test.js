const mongoose = require('mongoose');
const dbConnect = require('./lib/mongodb').default;
const Registration = require('./models/Registration').default;
const Team = require('./models/Team').default;
const Tournament = require('./models/Tournament').default;

async function check() {
    await dbConnect();
    const tId = "6a09691a671d2ade9b0cd864";
    const t = await Tournament.findById(tId);
    console.log("Tournament mode:", t.gameMode);
    
    const regs = await Registration.find({ tournament: tId });
    console.log("Registrations:", regs.map(r => ({ id: r._id, status: r.status, user: r.user })));
    
    const teams = await Team.find({ tournament: tId });
    console.log("Teams:", teams.map(t => ({ id: t._id, name: t.name, captain: t.captain, status: t.status })));
    
    process.exit(0);
}
check().catch(console.error);
