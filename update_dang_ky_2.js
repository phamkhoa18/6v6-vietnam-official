const fs = require('fs');
const path = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(manager)/manager/giai-dau/[id]/dang-ky/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace table headers for main list
content = content.replace(
    /<th className="text-left px-4 py-4 text-\[10px\] font-bold text-amber-500 uppercase tracking-widest">EFV ID<\/th>\s*<th className="text-left px-4 py-4 text-\[10px\] font-bold text-gray-400 uppercase tracking-widest">Nhân sự \/ CLB<\/th>\s*<th className="text-left px-4 py-4 text-\[10px\] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">In-game ID<\/th>/g,
    '<th className="text-left px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tên Đội / VĐV</th>\n                                    <th className="text-left px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Liên hệ</th>'
);

// Replace row content for main list (approximate matching)
content = content.replace(
    /<td className="px-4 py-3 align-top whitespace-nowrap">\s*<div className="font-mono text-xs font-bold text-amber-600">\s*\{r\.user\?\.efvId \?\? "N\/A"\}\s*<\/div>\s*<\/td>/g,
    '' // Removed EFV column
);

content = content.replace(
    /<td className="px-4 py-3 align-top">\s*<div className="flex items-center gap-3">[\s\S]*?<\/td>\s*<td className="px-4 py-3 align-top hidden md:table-cell">[\s\S]*?<\/td>/g,
    `<td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-1">
            <span className="font-bold text-sm text-gray-900">{r.teamName || r.playerName}</span>
            {r.teamShortName && <span className="text-xs text-gray-500">Viết tắt: {r.teamShortName}</span>}
        </div>
    </td>
    <td className="px-4 py-3 align-top hidden md:table-cell">
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700">{r.phone || r.user?.phone || 'N/A'}</span>
            <span className="text-xs text-gray-500">{r.email || r.user?.email || ''}</span>
        </div>
    </td>`
);


// Replace manual rows headers
content = content.replace(
    /<th className="px-2 py-2 text-left font-bold text-amber-500 w-16">EFV-ID<\/th>[\s\S]*?<th className="px-2 py-2 text-left font-bold text-gray-500 min-w-\[80px\]">SĐT<\/th>[\s\S]*?<th className="px-2 py-2 text-left font-bold text-gray-500 min-w-\[60px\]">Nickname<\/th>/g,
    `<th className="px-2 py-2 text-left font-bold text-blue-600 min-w-[120px]">Tên đội / VĐV</th>
     <th className="px-2 py-2 text-left font-bold text-gray-500 min-w-[80px]">Tên viết tắt</th>
     <th className="px-2 py-2 text-left font-bold text-gray-500 min-w-[80px]">SĐT</th>
     <th className="px-2 py-2 text-left font-bold text-gray-500 min-w-[80px]">Email</th>`
);

// We should also replace the manual rows inputs...
fs.writeFileSync(path, content);
console.log('Done script 2');
