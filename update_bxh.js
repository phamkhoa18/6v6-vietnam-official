const fs = require('fs');

const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/bxh/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// Ensure Gamepad icon is imported
if (!code.includes('Gamepad2')) {
    code = code.replace(
        'Trophy, Search, ChevronLeft, ChevronRight, Medal,',
        'Trophy, Search, ChevronLeft, ChevronRight, Medal, Gamepad2,'
    );
}

// Add mainCategory state and handleCategoryChange
const stateBlockMatch = code.match(/const \[activeMode, setActiveMode\] = useState<GameMode>\("1v1"\);/);
if (stateBlockMatch && !code.includes('mainCategory')) {
    const newStateBlock = `const [mainCategory, setMainCategory] = useState<"esports" | "6v6">("esports");
    const [activeMode, setActiveMode] = useState<GameMode>("1v1");

    const handleCategoryChange = (cat: "esports" | "6v6") => {
        setMainCategory(cat);
        setActiveMode(cat === "6v6" ? "6v6" : "1v1");
        setPage(1);
        setSearch("");
    };`;
    code = code.replace('const [activeMode, setActiveMode] = useState<GameMode>("1v1");', newStateBlock);
}

// Replace the Tabs Section
const tabsStart = code.indexOf('{/* Mode Tabs + Search */}');
const tabsEndRegex = /\{\/\* Mode description \*\/\}/;
const tabsEndMatch = code.match(tabsEndRegex);

if (tabsStart !== -1 && tabsEndMatch) {
    const newTabsJsx = `{/* Category Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-200/20">
                            <button
                                onClick={() => handleCategoryChange("esports")}
                                className={\`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 \${
                                    mainCategory === "esports"
                                        ? "bg-gradient-to-r from-efb-red to-efb-red-dark text-white shadow-lg shadow-red-900/20"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-white"
                                }\`}
                            >
                                <Gamepad2 className="w-5 h-5" />
                                E-SPORTS
                            </button>
                            <button
                                onClick={() => handleCategoryChange("6v6")}
                                className={\`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 \${
                                    mainCategory === "6v6"
                                        ? "bg-gradient-to-r from-efb-red to-efb-red-dark text-white shadow-lg shadow-red-900/20"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-white"
                                }\`}
                            >
                                <Shield className="w-5 h-5" />
                                6V6 SÂN CỎ
                            </button>
                        </div>
                    </div>

                    {/* Mode Tabs + Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={mainCategory} // Trigger animation on switch
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Mode Tabs (Only for eSports) */}
                            {mainCategory === "esports" ? (
                                <div className="flex bg-gray-50 rounded-xl p-1 gap-1">
                                    {MODE_TABS.filter(t => t.key !== "6v6").map((tab) => {
                                        const TabIcon = tab.icon;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => { setActiveMode(tab.key); setPage(1); setSearch(""); }}
                                                className={\`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 \${activeMode === tab.key
                                                    ? "bg-white text-efb-red shadow-sm border border-gray-100"
                                                    : "text-gray-500 hover:text-gray-800 hover:bg-white"
                                                    }\`}
                                            >
                                                <TabIcon className="w-4 h-4" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-efb-red">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900">Xếp hạng CLB Sân cỏ</h2>
                                        <p className="text-xs text-gray-500">Thành tích thi đấu giải 6 người</p>
                                    </div>
                                </div>
                            )}

                            {/* Search */}
                            <div className="relative max-w-xs w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={isTeamMode ? "Tìm kiếm đội bóng..." : "Tìm kiếm cầu thủ..."}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all"
                                />
                            </div>
                        </div>

                        {/* Mode description */}`;

    code = code.substring(0, tabsStart) + newTabsJsx + code.substring(tabsEndMatch.index + '{/* Mode description */}'.length);
}

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Updated BXH successfully.");
