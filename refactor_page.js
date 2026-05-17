const fs = require('fs');

const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/giai-dau/[id]/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Color replacements
code = code.replace(/text-blue-600/g, 'text-red-600');
code = code.replace(/text-blue-700/g, 'text-red-700');
code = code.replace(/bg-blue-50\/50/g, 'bg-red-50/50');
code = code.replace(/text-blue-400/g, 'text-red-400');
code = code.replace(/bg-blue-50/g, 'bg-red-50');
code = code.replace(/border-blue-100/g, 'border-red-100');
code = code.replace(/text-emerald-600/g, 'text-red-600'); // for wins
code = code.replace(/bg-emerald-50\/30/g, 'bg-red-50/30'); // for advancing groups
code = code.replace(/bg-emerald-500/g, 'bg-red-500'); // for advancing index
code = code.replace(/text-efb-blue/g, 'text-efb-red');
code = code.replace(/text-emerald-500/g, 'text-red-500');

// 2. Hero Section replacement
const heroStartRegex = /<section className="relative pt-28 pb-14 overflow-hidden">[\s\S]*?<\/section>/;
const newHero = `
            <section className="relative pt-24 pb-14">
                <div className="absolute inset-0 overflow-hidden">
                    <img src={tournament.thumbnail || "/assets/efootball_bg.webp"} alt="" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#7A1414]/90 via-[#A01B1B]/70 to-white" />
                </div>

                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-[11px] text-white/50 mb-5">
                        <Link href="/" className="hover:text-white/80 transition-colors">Trang chủ</Link>
                        <ChevronRight className="w-3 h-3 text-white/30" />
                        <Link href="/giai-dau" className="hover:text-white/80 transition-colors">Giải đấu</Link>
                        <ChevronRight className="w-3 h-3 text-white/30" />
                        <span className="text-white/80">{tournament.title}</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-2xl p-5 sm:p-6 -mb-8 relative z-20 shadow-xl border border-gray-100/50"
                    >
                        {/* Badges */}
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                            <Badge className={\`bg-\${cfg.color}-50 border-\${cfg.color}-200 text-\${cfg.color}-700 border text-[10px] font-semibold px-2.5 py-0.5 gap-1 rounded-full\`}>
                                <span className={\`w-1.5 h-1.5 rounded-full bg-\${cfg.color}-500\`} />
                                {cfg.label}
                            </Badge>
                            <Badge className="bg-red-50 text-red-600 border-red-100 text-[10px] rounded-full px-2.5 py-0.5">{formatLabels[format] || TOURNAMENT_FORMATS[format as keyof typeof TOURNAMENT_FORMATS] || format}</Badge>
                            <Badge className="bg-gray-50 text-gray-500 border-gray-100 text-[10px] rounded-full px-2.5 py-0.5">{isTeam ? "Đội" : "Cá nhân"} ({tournament.gameMode})</Badge>
                        </div>

                        {/* Title */}
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">{tournament.title}</h1>

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-gray-500 mb-4">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-red-400" />{formatDate(tournament.schedule?.tournamentStart)} - {formatDate(tournament.schedule?.tournamentEnd)}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" />{tournament.isOnline ? "Online" : (tournament.location || "Chưa xác định")}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-medium text-gray-400">Số lượng đăng ký</span>
                                <span className="text-[11px] font-semibold text-efb-red">{tournament.currentSlots}/{tournament.maxSlots}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: \`\${Math.min((tournament.currentSlots / tournament.maxSlots) * 100, 100)}%\` }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className={\`h-full rounded-full \${(tournament.currentSlots / tournament.maxSlots) >= 0.8 ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-red-400 to-rose-500"}\`}
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-red-50/60 rounded-xl px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <Users className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-[10px] text-red-500/70 font-medium uppercase tracking-wider">Đội</span>
                                </div>
                                <div className="text-gray-900">
                                    <span className="text-lg font-bold tabular-nums">{tournament.currentSlots}</span>
                                    <span className="text-xs text-gray-400 font-medium">/{tournament.maxSlots}</span>
                                </div>
                            </div>
                            <div className="bg-amber-50/60 rounded-xl px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] text-amber-500/70 font-medium uppercase tracking-wider">Giải thưởng</span>
                                </div>
                                <div className="text-amber-700 text-sm font-bold truncate">
                                    {tournament.prize?.total
                                        ? (typeof tournament.prize.total === 'number'
                                            ? Number(tournament.prize.total).toLocaleString("vi-VN") + ' VNĐ'
                                            : tournament.prize.total)
                                        : "—"}
                                </div>
                            </div>
                            <div className="bg-rose-50/60 rounded-xl px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <CreditCard className="w-3.5 h-3.5 text-rose-500" />
                                    <span className="text-[10px] text-rose-500/70 font-medium uppercase tracking-wider">Lệ phí</span>
                                </div>
                                <div className={\`text-sm font-bold text-rose-600\`}>
                                    {tournament.entryFee > 0 ? \`\${Number(tournament.entryFee).toLocaleString("vi-VN")} ₫\` : "Liên hệ"}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
`;
code = code.replace(heroStartRegex, newHero.trim());

// 3. Match Card styling for Brackets
const oldBracketMatch = /<div key=\{m\._id\} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Updated Hero Section and Colors.");
