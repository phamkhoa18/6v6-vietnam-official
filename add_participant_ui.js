const fs = require('fs');

const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(manager)/manager/giai-dau/[id]/dang-ky/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Add AnimatePresence and Camera, ImageIcon, UserPlus
code = code.replace(
    'import { motion } from "framer-motion";',
    'import { motion, AnimatePresence } from "framer-motion";'
);
if (!code.includes('UserPlus')) {
    code = code.replace(
        'import { Users, CheckCircle2, XCircle, Search, Loader2, Shield, User, Ban, RefreshCw, UserX } from "lucide-react";',
        'import { Users, CheckCircle2, XCircle, Search, Loader2, Shield, User, Ban, RefreshCw, UserX, UserPlus, Camera, ImageIcon, X } from "lucide-react";'
    );
}

// 2. Add State for Modal
const statePoint = `    const [statusFilter, setStatusFilter] = useState("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);`;

const newStates = `    const [statusFilter, setStatusFilter] = useState("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState({ name: "", shortName: "", captainName: "", phone: "", logo: "" });`;
code = code.replace(statePoint, newStates);

// 3. Add handleAddSubmit function
const addFunc = `
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isTeam = gameMode !== "1v1";
        
        if (!addForm.name || !addForm.phone) {
            toast.error("Vui lòng điền các thông tin bắt buộc!");
            return;
        }
        if (isTeam && !addForm.shortName) {
            toast.error("Vui lòng điền tên viết tắt của đội!");
            return;
        }

        setIsAdding(true);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(\`/api/tournaments/\${id}/participants\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: \`Bearer \${token}\` } : {}) },
                body: JSON.stringify({
                    isTeam,
                    name: addForm.name,
                    shortName: addForm.shortName,
                    captainName: addForm.captainName,
                    phone: addForm.phone,
                    avatar: addForm.logo,
                    logo: addForm.logo
                }),
            }).then(r => r.json());

            if (res.success) {
                setParticipants([res.data.participant, ...participants]);
                setShowAddModal(false);
                setAddForm({ name: "", shortName: "", captainName: "", phone: "", logo: "" });
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

    const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAddForm(prev => ({ ...prev, logo: url }));
        }
    };
`;

code = code.replace('const filtered = useMemo(() => {', addFunc + '\n    const filtered = useMemo(() => {');

// 4. Update Header with the button
const oldHeader = `<Button variant="outline" onClick={load} className="h-9 rounded-xl"><RefreshCw className="w-4 h-4 mr-1.5" /> Làm mới</Button>`;
const newHeader = `<div className="flex items-center gap-2">
                    <Button onClick={() => setShowAddModal(true)} className="h-9 rounded-xl bg-efb-red hover:bg-red-700 text-white shadow-sm"><UserPlus className="w-4 h-4 mr-1.5" /> Thêm thủ công</Button>
                    <Button variant="outline" onClick={load} className="h-9 rounded-xl"><RefreshCw className="w-4 h-4 mr-1.5" /> Làm mới</Button>
                </div>`;
code = code.replace(oldHeader, newHeader);

// 5. Add Modal JSX before the final closing div
const modalJsx = `
            {/* Modal Thêm Thủ Công */}
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Thêm {isTeam ? "Đội bóng" : "Cầu thủ"}</h2>
                                    <p className="text-[13px] text-gray-500 mt-0.5">Thêm trực tiếp vào danh sách giải</p>
                                </div>
                                <button
                                    onClick={() => !isAdding && setShowAddModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 custom-scrollbar">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Tên {isTeam ? "Đội bóng" : "Cầu thủ"} <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={addForm.name}
                                        onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        placeholder={isTeam ? "Nhập tên đội..." : "Nhập tên cầu thủ..."}
                                    />
                                </div>

                                {isTeam && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">Tên viết tắt <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                value={addForm.shortName}
                                                onChange={(e) => setAddForm({...addForm, shortName: e.target.value.toUpperCase().slice(0, 4)})}
                                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase"
                                                placeholder="VD: FCAE"
                                                maxLength={4}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">Tên Đội trưởng</label>
                                            <input 
                                                type="text" 
                                                value={addForm.captainName}
                                                onChange={(e) => setAddForm({...addForm, captainName: e.target.value})}
                                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                placeholder="Tên người đại diện..."
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        value={addForm.phone}
                                        onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        placeholder="09..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">{isTeam ? "Logo Đội bóng" : "Ảnh Cầu thủ"} <span className="text-gray-400 font-normal">(Tùy chọn)</span></label>
                                    <div className="flex items-start gap-4">
                                        {addForm.logo ? (
                                            <div className="relative">
                                                <img src={addForm.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-200 shadow-sm p-1" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setAddForm({...addForm, logo: ''})} 
                                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer flex-1">
                                                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-gray-50/30">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        {isTeam ? <ImageIcon className="w-4 h-4 text-gray-500" /> : <Camera className="w-4 h-4 text-gray-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Tải ảnh lên</p>
                                                    </div>
                                                </div>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </form>

                            <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="px-5 h-10 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                    disabled={isAdding}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleAddSubmit}
                                    disabled={isAdding}
                                    className="px-6 h-10 rounded-xl text-sm font-semibold text-white bg-emerald-600 shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    {isAdding ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        "Lưu thay đổi"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
`;
code = code.replace(/<\/div>\n    \);\n}$/, modalJsx + '\n}');

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Added Frontend UI for manual addition.");
