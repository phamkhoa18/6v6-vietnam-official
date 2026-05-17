const fs = require('fs');
const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/giai-dau/[id]/page.tsx';
const efootcupPath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/giai-dau/[id]/TournamentDetailClient_efootcup.tsx';

const pageCode = fs.readFileSync(pagePath, 'utf8');
const efootcupCode = fs.readFileSync(efootcupPath, 'utf8');

// For now, let's just make sure we can run a script to replace the hero section
console.log("Files read successfully");
