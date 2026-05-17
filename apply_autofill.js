const fs = require('fs');
const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/giai-dau/[id]/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Import useAuth
if (!code.includes('import { useAuth }')) {
    code = code.replace(
        'import Link from "next/link";',
        'import Link from "next/link";\nimport { useAuth } from "@/contexts/AuthContext";'
    );
}

// 2. Add useAuth to TournamentDetailContent and update regForm
const stateInsertionPoint = `    const { id } = useParams() as { id: string };
    const router = useRouter();

    const [tournament, setTournament] = useState<any>(null);`;

const newStateBlock = `    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [tournament, setTournament] = useState<any>(null);`;
code = code.replace(stateInsertionPoint, newStateBlock);

// 3. Update regForm state and add useEffect
const regFormRegex = /const \[regForm, setRegForm\] = useState\(\{[\s\S]*?\}\);/;
const newRegFormCode = `const [regForm, setRegForm] = useState({
        playerName: "",
        phone: "",
        personalPhoto: "",
        dateOfBirth: "",
        address: "",
        teamName: "",
        teamShortName: "",
        teamLogo: ""
    });

    useEffect(() => {
        if (showRegisterModal && isAuthenticated && user) {
            setRegForm(prev => ({
                ...prev,
                playerName: user.name || prev.playerName,
                phone: user.phone || prev.phone,
                personalPhoto: user.avatar || prev.personalPhoto,
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : prev.dateOfBirth,
                address: user.province || prev.address,
                teamName: user.teamName || prev.teamName
            }));
        }
    }, [showRegisterModal, isAuthenticated, user]);`;
code = code.replace(regFormRegex, newRegFormCode);

// 4. Update the "Đăng ký tham gia" button to check auth
const oldRegisterBtn = `onClick={() => setShowRegisterModal(true)}`;
const newRegisterBtn = `onClick={() => {
                                        if (!isAuthenticated) {
                                            router.push(\`/dang-nhap?redirect=/giai-dau/\${id}\`);
                                        } else {
                                            setShowRegisterModal(true);
                                        }
                                    }}`;
code = code.replace(oldRegisterBtn, newRegisterBtn);

// 5. Update handleRegisterSubmit for validation
const oldSubmitValidation = `if (!regForm.playerName || !regForm.personalPhoto || !regForm.dateOfBirth || !regForm.address) {`;
const newSubmitValidation = `if (!regForm.playerName || !regForm.phone || !regForm.personalPhoto || !regForm.teamName || !regForm.teamShortName) {`;
code = code.replace(oldSubmitValidation, newSubmitValidation);

// 6. Add handleUploadLogo
const oldHandleUpload = `    const handleUploadRegImage = (e: React.ChangeEvent<HTMLInputElement>) => {`;
const newHandleUpload = `    const handleUploadRegImage = (e: React.ChangeEvent<HTMLInputElement>, field: 'personalPhoto' | 'teamLogo') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setRegForm(prev => ({ ...prev, [field]: url }));
        }
    };
    
    // Kept old function def for backward compatibility or replace entirely below:
    const handleUploadPersonal = (e: React.ChangeEvent<HTMLInputElement>) => handleUploadRegImage(e, 'personalPhoto');
    const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => handleUploadRegImage(e, 'teamLogo');`;
code = code.replace(oldHandleUpload, newHandleUpload);

// 7. Update Modal Form UI
const formRegex = /<form onSubmit=\{handleRegisterSubmit\} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 custom-scrollbar">[\s\S]*?<\/form>/;

const newFormCode = `<form onSubmit={handleRegisterSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 custom-scrollbar">
                                {/* Phần 1: Đội trưởng */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">1. Thông tin Đại diện (Đội trưởng)</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.playerName}
                                                    onChange={(e) => setRegForm({...regForm, playerName: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="Nhập họ và tên..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="tel" 
                                                    value={regForm.phone}
                                                    onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="09..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Ngày sinh</label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={\`w-full flex items-center justify-between border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 \${!regForm.dateOfBirth ? "text-gray-400" : "text-gray-700"}\`}
                                                        >
                                                            {regForm.dateOfBirth ? format(new Date(regForm.dateOfBirth), "PPP", { locale: vi }) : "Chọn ngày..."}
                                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-[110]" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={regForm.dateOfBirth ? new Date(regForm.dateOfBirth) : undefined}
                                                            onSelect={(date) => {
                                                                if (date) {
                                                                    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                                                    setRegForm({...regForm, dateOfBirth: offsetDate.toISOString().split('T')[0]});
                                                                } else {
                                                                    setRegForm({...regForm, dateOfBirth: ''});
                                                                }
                                                            }}
                                                            locale={vi}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Khu vực/Địa chỉ</label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.address}
                                                    onChange={(e) => setRegForm({...regForm, address: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="VD: TP.HCM"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">Ảnh chân dung (Rõ mặt) <span className="text-red-500">*</span></label>
                                            <div className="flex items-start gap-4">
                                                {regForm.personalPhoto ? (
                                                    <div className="relative">
                                                        <img src={regForm.personalPhoto} alt="Avatar" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setRegForm({...regForm, personalPhoto: ''})} 
                                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer flex-1">
                                                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all bg-red-50/30">
                                                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                                <Camera className="w-4 h-4 text-red-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Tải ảnh lên</p>
                                                            </div>
                                                        </div>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadPersonal} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Phần 2: Đội bóng */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">2. Thông tin FC (Đội bóng)</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Tên Đội bóng <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.teamName}
                                                    onChange={(e) => setRegForm({...regForm, teamName: e.target.value})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="VD: FC Anh Em..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Tên viết tắt (Short) <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.teamShortName}
                                                    onChange={(e) => setRegForm({...regForm, teamShortName: e.target.value.toUpperCase().slice(0, 4)})}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase"
                                                    placeholder="VD: FCAE"
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">Logo Đội bóng <span className="text-gray-400 font-normal">(Tùy chọn)</span></label>
                                            <div className="flex items-start gap-4">
                                                {regForm.teamLogo ? (
                                                    <div className="relative">
                                                        <img src={regForm.teamLogo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-200 shadow-sm p-1" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setRegForm({...regForm, teamLogo: ''})} 
                                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer flex-1">
                                                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-gray-50/30">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Tải logo lên</p>
                                                            </div>
                                                        </div>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>`;

code = code.replace(formRegex, newFormCode);

// Fix the file input handleUploadRegImage references inside the previous markup if it wasn't captured correctly
// Actually it is completely replaced.

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Applied Autofill and Form changes.");
