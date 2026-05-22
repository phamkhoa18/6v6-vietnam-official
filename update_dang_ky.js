const fs = require('fs');
const path = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(manager)/manager/giai-dau/[id]/dang-ky/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update manualRows definition
content = content.replace(
    /const \[manualRows, setManualRows\] = useState\(\[\s*\{ efvId: "", teamName: "", teamShortName: "", playerName: "", gamerId: "", phone: "", email: "", nickname: "", dateOfBirth: "", province: "", facebookName: "", facebookLink: "", player2EfvId: "", player2Name: "", player2GamerId: "", player2Nickname: "", player2FacebookName: "", player2FacebookLink: "" \}\s*\]\);/g,
    `const [manualRows, setManualRows] = useState([
        { teamName: "", teamShortName: "", playerName: "", phone: "", email: "", dateOfBirth: "", address: "", player2Name: "", player3Name: "" }
    ]);`
);

content = content.replace(
    /const newRows = Array\(count\)\.fill\(null\)\.map\(\(\) => \(\{ efvId: "", teamName: "", teamShortName: "", playerName: "", gamerId: "", phone: "", email: "", nickname: "", dateOfBirth: "", province: "", facebookName: "", facebookLink: "", player2EfvId: "", player2Name: "", player2GamerId: "", player2Nickname: "", player2FacebookName: "", player2FacebookLink: "" \}\)\);/g,
    `const newRows = Array(count).fill(null).map(() => ({ teamName: "", teamShortName: "", playerName: "", phone: "", email: "", dateOfBirth: "", address: "", player2Name: "", player3Name: "" }));`
);

content = content.replace(
    /setManualRows\(\[\{ efvId: "", teamName: "", teamShortName: "", playerName: "", gamerId: "", phone: "", email: "", nickname: "", dateOfBirth: "", province: "", facebookName: "", facebookLink: "", player2EfvId: "", player2Name: "", player2GamerId: "", player2Nickname: "", player2FacebookName: "", player2FacebookLink: "" \}\]\);/g,
    `setManualRows([{ teamName: "", teamShortName: "", playerName: "", phone: "", email: "", dateOfBirth: "", address: "", player2Name: "", player3Name: "" }]);`
);

fs.writeFileSync(path, content);
console.log('Updated manualRows state');
