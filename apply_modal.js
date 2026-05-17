const fs = require('fs');

const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/giai-dau/[id]/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Imports
code = code.replace(
    'import { motion } from "framer-motion";',
    'import { motion, AnimatePresence } from "framer-motion";\nimport { toast } from "sonner";'
);

code = code.replace(
    /ArrowRight, Eye, Award, UserPlus, Share2/,
    'ArrowRight, Eye, Award, UserPlus, Share2, Camera, X, ImageIcon, UploadCloud'
);

// 2. States
const stateInsertionPoint = `    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");`;

const newStates = `    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [regForm, setRegForm] = useState({
        playerName: "",
        personalPhoto: "",
        dateOfBirth: "",
        address: ""
    });

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!regForm.playerName || !regForm.personalPhoto || !regForm.dateOfBirth || !regForm.address) {
            toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }
        setIsRegistering(true);
        // Mock API Call
        setTimeout(() => {
            setIsRegistering(false);
            setShowRegisterModal(false);
            toast.success("Đăng ký thành công! Đội ngũ admin sẽ liên hệ bạn sớm.");
        }, 1500);
    };

    const handleUploadRegImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setRegForm(prev => ({ ...prev, personalPhoto: url }));
        }
    };`;

code = code.replace(stateInsertionPoint, newStates);

// 3. CTA Button
code = code.replace(
    "onClick={() => alert('Tính năng đăng ký đang được cập nhật')}",
    "onClick={() => setShowRegisterModal(true)}"
);

// 4. Modal Render
const modalCode = `
            {/* Registration Modal */}
            <AnimatePresence>
                {showRegisterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isRegistering && setShowRegisterModal(false)}
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
                                    <h2 className="text-lg font-bold text-gray-900">Đăng ký tham gia</h2>
                                    <p className="text-[13px] text-gray-500 mt-0.5">{tournament?.title}</p>
                                </div>
                                <button
                                    onClick={() => !isRegistering && setShowRegisterModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                                    disabled={isRegistering}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleRegisterSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 custom-scrollbar">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={regForm.playerName}
                                        onChange={(e) => setRegForm({...regForm, playerName: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        placeholder="Nhập họ và tên đầy đủ..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Ảnh đại diện <span className="text-red-500">*</span></label>
                                    <div className="flex items-start gap-4">
                                        {regForm.personalPhoto ? (
                                            <div className="relative">
                                                <img src={regForm.personalPhoto} alt="Avatar" className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setRegForm({...regForm, personalPhoto: ''})} 
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer flex-1">
                                                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all bg-red-50/30">
                                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                                        <Camera className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Tải ảnh lên</p>
                                                        <p className="text-[11px] text-gray-400">Hỗ trợ JPG, PNG</p>
                                                    </div>
                                                </div>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadRegImage} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Ngày sinh <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        value={regForm.dateOfBirth}
                                        onChange={(e) => setRegForm({...regForm, dateOfBirth: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Địa chỉ <span className="text-red-500">*</span></label>
                                    <textarea 
                                        value={regForm.address}
                                        onChange={(e) => setRegForm({...regForm, address: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[80px] resize-none"
                                        placeholder="Nhập địa chỉ của bạn..."
                                    />
                                </div>
                            </form>

                            <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowRegisterModal(false)}
                                    className="px-5 h-10 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                    disabled={isRegistering}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    onClick={handleRegisterSubmit}
                                    disabled={isRegistering}
                                    className="px-6 h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-efb-red to-red-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    {isRegistering ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        "Xác nhận đăng ký"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TournamentDetailPage() {`;

code = code.replace(
`        </div>
    );
}

export default function TournamentDetailPage() {`, modalCode);

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Applied modal changes.");
