const fs = require('fs');
const content = fs.readFileSync('/Users/khoait/Documents/SourceCompany/efootcup/app/(main)/giai-dau/[id]/TournamentDetailClient.tsx', 'utf8');

// We'll write the file to the scratch dir
const outPath = '/Users/khoait/.gemini/antigravity/brain/fb0d8cc0-b0c2-41ec-a822-d07bf2e651e3/scratch/TournamentDetailClient.txt';
fs.writeFileSync(outPath, content);
console.log('Saved to', outPath);
