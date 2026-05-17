const fs = require('fs');

const bxh = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/bxh/page.tsx';
let bxhCode = fs.readFileSync(bxh, 'utf8');
bxhCode = bxhCode.replace(/teamNameName/g, 'teamName');
bxhCode = bxhCode.replace(/p\.points/g, 'p.totalPoints');
bxhCode = bxhCode.replace(/p\.efvId/g, 'p.user?.playerId');
fs.writeFileSync(bxh, bxhCode, 'utf8');

const bxhTeams = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/bxh-teams/page.tsx';
let bxhTeamsCode = fs.readFileSync(bxhTeams, 'utf8');
bxhTeamsCode = bxhTeamsCode.replace(/t\.point/g, 't.totalPoints');
fs.writeFileSync(bxhTeams, bxhTeamsCode, 'utf8');

console.log("Fixed TS errors");
