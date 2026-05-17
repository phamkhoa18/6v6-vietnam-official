const fs = require('fs');

const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(manager)/manager/giai-dau/[id]/dang-ky/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// Ensure FileUpload, FileSpreadsheet are imported
if (!code.includes('FileSpreadsheet')) {
    code = code.replace(
        'UserPlus, Camera, ImageIcon, X',
        'UserPlus, Camera, ImageIcon, X, FileSpreadsheet, UploadCloud'
    );
}

// Add addTab state
if (!code.includes('const [addTab, setAddTab]')) {
    code = code.replace(
        'const [addForm, setAddForm] = useState({ name: "", shortName: "", captainName: "", phone: "", logo: "" });',
        'const [addForm, setAddForm] = useState({ name: "", shortName: "", captainName: "", phone: "", logo: "" });\n    const [addTab, setAddTab] = useState<"manual" | "excel">("manual");'
    );
}

const modalJsx = `
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
                                <div className="flex items-center justify-between">
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
                                <form id="add-form" onSubmit={handleAddSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 custom-scrollbar">
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

                            <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
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
                                        className="px-6 h-10 rounded-xl text-sm font-semibold text-white bg-emerald-600 shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-2"
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

// Replace the end of the file safely using string replacement instead of dangerous regex
const oldEnd = `            )}
        </div>
    );
}`;

code = code.replace(oldEnd, `            )}` + '\n' + modalJsx);

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Injected modal successfully.");
