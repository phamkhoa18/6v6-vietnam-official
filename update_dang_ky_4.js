const fs = require('fs');
const path = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(manager)/manager/giai-dau/[id]/dang-ky/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `
                                                            {/* EFV ID smart-verify */}
                                                            {(() => {
                                                                const key = String(index) + '_p1';
                                                                const st = efvStatuses[key] || 'idle';
                                                                const colorCls = st === 'verified' ? 'border-emerald-400 bg-emerald-50/40 text-emerald-700' : st === 'not_found' ? 'border-red-400 bg-red-50/40 text-red-600' : 'border-amber-200 bg-amber-50/30 text-amber-700';
                                                                return (
                                                                    <div className="relative">
                                                                        <Input
                                                                            value={row.efvId}
                                                                            placeholder="#ID"
                                                                            onChange={(e) => { const newRows = [...manualRows]; newRows[index].efvId = e.target.value.replace(/[^0-9]/g, ''); setManualRows(newRows); setEfvStatuses(prev => ({ ...prev, [key]: 'idle' })); }}
                                                                            onBlur={() => handleEfvBlur(index, row.efvId, false)}
                                                                            className={\`h-9 rounded-lg text-xs \${colorCls} focus-visible:ring-amber-500/30 transition-all placeholder:text-amber-300 text-center font-mono font-bold pr-6\`}
                                                                        />
                                                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                            {st === 'loading' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
                                                                            {st === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                                                            {st === 'not_found' && <AlertCircle className="w-3 h-3 text-red-500" />}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                            <Input
                                                                value={row.teamName}
                                                                placeholder="Tên đội"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].teamName = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.teamShortName}
                                                                placeholder="VT"
                                                                maxLength={4}
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].teamShortName = e.target.value.toUpperCase(); setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all text-center uppercase placeholder:text-gray-300"
                                                            />
                                                            <div className="relative">
                                                                <Input
                                                                    value={row.playerName}
                                                                    placeholder={efvStatuses[index + '_p1'] === 'verified' ? "Tự động từ EFV" : "Họ tên VĐV *"}
                                                                    readOnly={efvStatuses[index + '_p1'] === 'verified'}
                                                                    onChange={(e) => { if (efvStatuses[index + '_p1'] !== 'verified') { const newRows = [...manualRows]; newRows[index].playerName = e.target.value; setManualRows(newRows); } }}
                                                                    className={\`h-9 rounded-lg text-xs font-medium transition-all \${efvStatuses[index + '_p1'] === 'verified' ? 'border-emerald-300 bg-emerald-50/50 text-emerald-800 cursor-default focus-visible:ring-emerald-500/30 pr-7' : 'border-blue-200 bg-blue-50/30 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 placeholder:text-blue-300'}\`}
                                                                />
                                                                {efvStatuses[index + '_p1'] === 'verified' && (
                                                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Input
                                                                value={row.gamerId}
                                                                placeholder="ID Game"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].gamerId = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.phone}
                                                                placeholder="0912..."
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].phone = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.email}
                                                                placeholder="email@..."
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].email = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.nickname}
                                                                placeholder="Nickname"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].nickname = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.facebookName}
                                                                placeholder="Tên FB"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].facebookName = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.province}
                                                                placeholder="Tỉnh/TP"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].province = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    if (manualRows.length > 1) {
                                                                        setManualRows(manualRows.filter((_, i) => i !== index));
                                                                    }
                                                                }}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/row:opacity-100"
                                                                title="Xóa dòng"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>

                                                            {/* Player 2 sub-row for 2v2+ */}
                                                            {teamSize >= 2 && (
                                                                <div className="col-span-full grid grid-cols-[36px_70px_minmax(90px,1fr)_50px_minmax(110px,1.2fr)_minmax(80px,0.9fr)_minmax(80px,0.8fr)_minmax(100px,1fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_36px] gap-1.5 items-center pl-1 border-l-2 border-emerald-300 ml-4 mb-1">
                                                                    <div className="text-[10px] font-bold text-emerald-400 text-center">P2</div>
                                                                    <Input
                                                                        value={row.player2EfvId}
                                                                        placeholder="#ID2"
                                                                        onChange={(e) => { const newRows = [...manualRows]; newRows[index].player2EfvId = e.target.value.replace(/[^0-9]/g, ''); setManualRows(newRows); }}
                                                                        onBlur={() => handleEfvBlur(index, row.player2EfvId, true)}
                                                                        className="h-8 rounded-lg text-xs border-emerald-200 bg-emerald-50/30 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 transition-all placeholder:text-emerald-300 text-center font-mono font-bold text-emerald-700"
                                                                    />
                                                                    <div className="col-span-2" />
                                                                    <div className="relative">
                                                                        <Input
                                                                            value={row.player2Name}
                                                                            placeholder={efvStatuses[index + '_p2'] === 'verified' ? "Tự động từ EFV" : "Tên VĐV 2 *"}
                                                                            readOnly={efvStatuses[index + '_p2'] === 'verified'}
                                                                            onChange={(e) => { if (efvStatuses[index + '_p2'] !== 'verified') { const newRows = [...manualRows]; newRows[index].player2Name = e.target.value; setManualRows(newRows); } }}
                                                                            className={\`h-8 rounded-lg text-xs font-medium transition-all \${efvStatuses[index + '_p2'] === 'verified' ? 'border-emerald-300 bg-emerald-50/50 text-emerald-800 cursor-default focus-visible:ring-emerald-500/30 pr-7' : 'border-emerald-200 bg-emerald-50/30 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 placeholder:text-emerald-300'}\`}
                                                                        />
                                                                        {efvStatuses[index + '_p2'] === 'verified' && (
                                                                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <Input
                                                                        value={row.player2GamerId}
                                                                        placeholder="ID Game 2"
                                                                        onChange={(e) => { const newRows = [...manualRows]; newRows[index].player2GamerId = e.target.value; setManualRows(newRows); }}
                                                                        className="h-8 rounded-lg text-xs border-gray-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 transition-all placeholder:text-gray-300"
                                                                    />
                                                                    <div />
                                                                    <div />
                                                                    <Input
                                                                        value={row.player2Nickname}
                                                                        placeholder="Nickname 2"
                                                                        onChange={(e) => { const newRows = [...manualRows]; newRows[index].player2Nickname = e.target.value; setManualRows(newRows); }}
                                                                        className="h-8 rounded-lg text-xs border-gray-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 transition-all placeholder:text-gray-300"
                                                                    />
                                                                    <div className="col-span-3" />
                                                                </div>
                                                            )}`;

const newBlock = `
                                                            <Input
                                                                value={row.teamName}
                                                                placeholder="Tên đội / VĐV"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].teamName = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.teamShortName}
                                                                placeholder="VT"
                                                                maxLength={4}
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].teamShortName = e.target.value.toUpperCase(); setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all text-center uppercase placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.phone}
                                                                placeholder="SĐT"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].phone = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <Input
                                                                value={row.email}
                                                                placeholder="Email"
                                                                onChange={(e) => { const newRows = [...manualRows]; newRows[index].email = e.target.value; setManualRows(newRows); }}
                                                                className="h-9 rounded-lg text-xs border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all placeholder:text-gray-300"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    if (manualRows.length > 1) {
                                                                        setManualRows(manualRows.filter((_, i) => i !== index));
                                                                    }
                                                                }}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/row:opacity-100"
                                                                title="Xóa dòng"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
`;

if (content.includes(oldBlock.trim().substring(0, 50))) {
    // If exact block matching fails due to whitespace differences, we'll use regex or string methods.
    // Try simple indexOf based replacement
}
content = content.replace(
    /\{\/\* EFV ID smart-verify \*\/\}[\s\S]*?\{teamSize >= 2 && \([\s\S]*?\}\)/,
    newBlock.trim()
);

fs.writeFileSync(path, content);
console.log('Done script 4');
