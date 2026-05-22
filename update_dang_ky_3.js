const fs = require('fs');
const path = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(manager)/manager/giai-dau/[id]/dang-ky/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace validation logic that uses efvId etc.
content = content.replace(
    /const invalidEfv = manualRows.some\(\(r, i\) => \{[\s\S]*?\}\);/g,
    'const invalidEfv = false;'
);

content = content.replace(
    /const validRows = manualRows.filter\(\(r, i\) => \{[\s\S]*?\}\);/g,
    `const validRows = manualRows.filter(r => r.playerName.trim());`
);

content = content.replace(
    /const res = await tournamentAPI\.createRegistration\(\{[\s\S]*?\}\);/g,
    `const res = await fetch(\`/api/tournaments/\${id}/register\`, {
        method: "POST",
        body: JSON.stringify({
            playerName: r.playerName,
            phone: r.phone,
            teamName: r.teamName,
            teamShortName: r.teamShortName,
            address: r.address,
            dateOfBirth: r.dateOfBirth,
        })
    });`
);

// We need to replace the entire rendering of `manualRows.map` inside the table
// Let's replace the whole table block.

fs.writeFileSync(path, content);
console.log('Done script 3');
