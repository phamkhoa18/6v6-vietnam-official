const fs = require('fs');

const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(manager)/manager/giai-dau/[id]/dang-ky/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// Ensure useDebounce is imported if needed, but we can just use a simple timeout or direct fetch for search
if (!code.includes('SearchIcon')) {
    code = code.replace(
        'UserPlus, Camera, ImageIcon, X, FileSpreadsheet, UploadCloud',
        'UserPlus, Camera, ImageIcon, X, FileSpreadsheet, UploadCloud, Search as SearchIcon, Plus'
    );
}

// Add state for Roster
const oldStateBlock = `    const [addForm, setAddForm] = useState({ name: "", shortName: "", captainName: "", phone: "", logo: "" });
    const [addTab, setAddTab] = useState<"manual" | "excel">("manual");`;

const newStateBlock = `    const [addForm, setAddForm] = useState({ name: "", shortName: "", logo: "" });
    const [addTab, setAddTab] = useState<"manual" | "excel">("manual");
    const [roster, setRoster] = useState<{ userId: string; isNew: boolean; name: string; phone: string; avatar: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const maxSlots = gameMode === "1v1" || gameMode === "6v6" ? 1 : parseInt(gameMode.charAt(0)) || 1;

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const token = localStorage.getItem("6v6_token");
                const res = await fetch(\`/api/users/search?q=\${encodeURIComponent(searchQuery)}\`, {
                    headers: token ? { Authorization: \`Bearer \${token}\` } : {}
                }).then(r => r.json());
                if (res.success) setSearchResults(res.data);
            } catch {}
            finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectUser = (user: any) => {
        if (roster.find(r => r.userId === user._id)) {
            toast.error("VĐV này đã có trong danh sách!");
            return;
        }
        if (roster.length >= maxSlots) {
            toast.error(\`Chế độ này chỉ cho phép tối đa \${maxSlots} VĐV\`);
            return;
        }
        setRoster([...roster, { userId: user._id, isNew: false, name: user.name, phone: user.phone || "", avatar: user.avatar || "" }]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleQuickCreate = () => {
        if (roster.length >= maxSlots) {
            toast.error(\`Chế độ này chỉ cho phép tối đa \${maxSlots} VĐV\`);
            return;
        }
        if (!searchQuery.trim()) {
            toast.error("Vui lòng nhập tên VĐV");
            return;
        }
        setRoster([...roster, { userId: \`new_\${Date.now()}\`, isNew: true, name: searchQuery, phone: "", avatar: "" }]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleRemoveRoster = (index: number) => {
        setRoster(roster.filter((_, i) => i !== index));
    };

    const handleUpdateRosterPhone = (index: number, phone: string) => {
        const newRoster = [...roster];
        newRoster[index].phone = phone;
        setRoster(newRoster);
    };
`;
if (!code.includes('const [roster, setRoster]')) {
    code = code.replace(oldStateBlock, newStateBlock);
}

// Update handleAddSubmit logic
const oldSubmitStart = `    const handleAddSubmit = async (e: React.FormEvent) => {`;
const oldSubmitEnd = `    const handleUploadLogo =`;

const newSubmitFunc = `    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isTeam = gameMode !== "1v1";
        
        if (isTeam && !addForm.name) {
            toast.error("Vui lòng điền tên đội bóng!");
            return;
        }
        if (roster.length < maxSlots) {
            toast.error(\`Vui lòng chọn đủ \${maxSlots} VĐV để đăng ký!\`);
            return;
        }

        setIsAdding(true);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(\`/api/tournaments/\${id}/participants\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: \`Bearer \${token}\` } : {}) },
                body: JSON.stringify({
                    name: isTeam ? addForm.name : roster[0].name,
                    shortName: addForm.shortName,
                    logo: addForm.logo,
                    players: roster
                }),
            }).then(r => r.json());

            if (res.success) {
                setParticipants([res.data.participant, ...participants]);
                setShowAddModal(false);
                setAddForm({ name: "", shortName: "", logo: "" });
                setRoster([]);
                toast.success("Đã thêm thành công!");
            } else {
                toast.error(res.message || "Có lỗi xảy ra");
            }
        } catch {
            toast.error("Lỗi kết nối");
        } finally {
            setIsAdding(false);
        }
    };

`;

code = code.replace(new RegExp(`${oldSubmitStart}[\\s\\S]*?${oldSubmitEnd}`), newSubmitFunc + oldSubmitEnd);

// Replace the Modal UI
const modalStartIdx = code.indexOf('{/* Modal Thêm */}');
if (modalStartIdx !== -1) {
    code = code.substring(0, modalStartIdx);
}

const newModalJsx = `
            {/* Modal Thêm */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isAdding && setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Thêm {gameMode === "1v1" ? "Cầu thủ" : "Đội bóng"} <span className="text-sm font-normal text-efb-red px-2 py-0.5 bg-red-50 rounded-full ml-2">{gameMode}</span></h2>
                                        <p className="text-[13px] text-gray-500 mt-0.5">Xây dựng đội hình và liên kết tài khoản</p>
                                    </div>
                                    <button
                                        onClick={() => !isAdding && setShowAddModal(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button 
                                        type="button"
                                        onClick={() => setAddTab("manual")}
                                        className={\`flex-1 py-2 text-sm font-semibold rounded-lg transition-all \${addTab === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}\`}
                                    >
                                        Thêm thủ công
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAddTab("excel")}
                                        className={\`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 \${addTab === "excel" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}\`}
                                    >
                                        <FileSpreadsheet className="w-4 h-4" /> Từ file Excel
                                    </button>
                                </div>
                            </div>
                            
                            {addTab === "manual" ? (
                                <form id="add-form" onSubmit={handleAddSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 custom-scrollbar">
                                    
                                    {/* THÔNG TIN ĐỘI BÓNG (NẾU KHÔNG PHẢI 1V1) */}
                                    {gameMode !== "1v1" && (
                                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Shield className="w-4 h-4 text-efb-red" /> Thông tin Đội</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-2 space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-700">Tên Đội bóng <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        value={addForm.name}
                                                        onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                                                        placeholder="Nhập tên đội..."
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-700">Viết tắt</label>
                                                    <input 
                                                        type="text" 
                                                        value={addForm.shortName}
                                                        onChange={(e) => setAddForm({...addForm, shortName: e.target.value.toUpperCase().slice(0, 4)})}
                                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase bg-white"
                                                        placeholder="VD: FC"
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Logo Đội bóng <span className="text-gray-400 font-normal">(Tùy chọn)</span></label>
                                                <div className="flex items-start gap-4">
                                                    {addForm.logo ? (
                                                        <div className="relative">
                                                            <img src={addForm.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-200 shadow-sm p-1 bg-white" />
                                                            <button type="button" onClick={() => setAddForm({...addForm, logo: ''})} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer">
                                                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-white">
                                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-600">Tải logo lên</span>
                                                            </div>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DANH SÁCH VĐV (ROSTER) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Đội hình ({roster.length}/{maxSlots})</h3>
                                            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded uppercase">{gameMode === "6v6" ? "Chỉ cần Đội trưởng" : "Phải đủ Slots"}</span>
                                        </div>

                                        {/* Thanh tìm kiếm */}
                                        {roster.length < maxSlots && (
                                            <div className="relative">
                                                <div className="relative">
                                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                                        placeholder="Tìm VĐV bằng SĐT, Mã Player ID hoặc Tên..."
                                                    />
                                                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
                                                </div>

                                                {/* Dropdown Kết quả */}
                                                {searchQuery && !isSearching && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-10 max-h-[250px] overflow-y-auto">
                                                        {searchResults.length > 0 ? (
                                                            <div className="py-1">
                                                                {searchResults.map((user) => (
                                                                    <button
                                                                        key={user._id}
                                                                        type="button"
                                                                        onClick={() => handleSelectUser(user)}
                                                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                                                    >
                                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                                            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                                                                {user.playerId && <span className="bg-gray-100 px-1.5 rounded">{user.playerId}</span>}
                                                                                {user.phone && <span>{user.phone}</span>}
                                                                            </div>
                                                                        </div>
                                                                        <Plus className="w-4 h-4 text-blue-500" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 text-center">
                                                                <p className="text-sm text-gray-500 mb-3">Không tìm thấy VĐV nào trong hệ thống.</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleQuickCreate}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                                                                >
                                                                    <UserPlus className="w-4 h-4" /> Tạo nhanh VĐV "{searchQuery}"
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Danh sách Slots đã chọn */}
                                        <div className="space-y-2 mt-3">
                                            {roster.map((player, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm relative group">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                                                        {player.avatar ? <img src={player.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{player.name}</p>
                                                            {idx === 0 && gameMode !== "1v1" && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Đội trưởng</span>}
                                                            {player.isNew && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Tạo mới</span>}
                                                        </div>
                                                        {player.isNew ? (
                                                            <input 
                                                                type="tel" 
                                                                value={player.phone}
                                                                onChange={(e) => handleUpdateRosterPhone(idx, e.target.value)}
                                                                className="mt-1 w-full max-w-[200px] border-b border-gray-200 pb-0.5 text-xs text-gray-600 focus:outline-none focus:border-blue-500 placeholder:text-gray-300"
                                                                placeholder="Nhập SĐT..."
                                                                required
                                                            />
                                                        ) : (
                                                            <p className="text-xs text-gray-500 mt-0.5">{player.phone || "Không có SĐT"}</p>
                                                        )}
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveRoster(idx)}
                                                        className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {roster.length === 0 && (
                                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <p className="text-sm text-gray-400">Chưa chọn VĐV nào</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-5 sm:p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-100">
                                        <FileSpreadsheet className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">Tải lên danh sách Excel</h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-[250px]">Chức năng đang được phát triển. Vui lòng sử dụng tính năng Thêm thủ công tạm thời.</p>
                                    </div>
                                    <Button variant="outline" className="mt-2 text-emerald-700 border-emerald-200 bg-emerald-50" onClick={() => toast.info("Tính năng đang phát triển")}><UploadCloud className="w-4 h-4 mr-2" /> Chọn file .xlsx</Button>
                                </div>
                            )}

                            <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="px-5 h-10 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                    disabled={isAdding}
                                >
                                    Hủy
                                </button>
                                {addTab === "manual" && (
                                    <button 
                                        type="submit"
                                        form="add-form"
                                        disabled={isAdding}
                                        className="px-6 h-10 rounded-xl text-sm font-semibold text-white bg-emerald-600 shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isAdding ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                                        ) : (
                                            "Lưu thay đổi"
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
`;

code += newModalJsx;

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Replaced Modal with Smart Roster Search UI.");
