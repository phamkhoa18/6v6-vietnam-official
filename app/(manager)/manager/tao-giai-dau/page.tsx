"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format as formatDate } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Trophy, ArrowLeft, ArrowRight, Loader2, Calendar as CalendarIcon, Users,
    DollarSign, Settings, Info, MapPin, Wifi, CheckCircle2, BarChart3, Zap, Shield,
    Hash, Camera, X, ImageIcon, Upload, FileImage, Search as SearchIcon
} from "lucide-react";
import { tournamentAPI, uploadImage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

/* ===== Helpers ===== */
function formatVNCurrency(val: string | number): string {
    const num = typeof val === "string" ? val.replace(/\D/g, "") : String(val);
    if (!num) return "";
    return Number(num).toLocaleString("vi-VN");
}

function parseVNCurrency(formatted: string): number {
    return parseInt(formatted.replace(/\./g, "").replace(/\D/g, ""), 10) || 0;
}

/* ===== Currency Input ===== */
function CurrencyInput({ value, onChange, placeholder, className }: { value: string; onChange: (raw: string) => void; placeholder?: string; className?: string; }) {
    return (
        <Input
            value={value ? formatVNCurrency(value) : ""}
            onChange={(e) => onChange(e.target.value.replace(/\./g, "").replace(/\D/g, ""))}
            placeholder={placeholder}
            className={className}
            inputMode="numeric"
        />
    );
}

/* ===== Date Picker ===== */
function DatePicker({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (date: Date | undefined) => void; }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={`w-full h-12 rounded-xl justify-start text-left font-normal px-3 ${!value ? "text-muted-foreground" : ""}`}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                    {value ? <span className="truncate">{formatDate(value, "dd/MM/yyyy", { locale: vi })}</span> : <span className="text-gray-400">{label}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={value} onSelect={onChange} className="rounded-md" />
            </PopoverContent>
        </Popover>
    );
}

/* ===== Format Options ===== */
const formatOptions = [
    { value: "single_elimination", label: "Loại trực tiếp", icon: Zap, desc: "Thua 1 trận là bị loại. Nhanh gọn, phù hợp giải nhỏ.", scoring: "Không tính điểm", color: "text-red-600 bg-red-50" },
    { value: "round_robin", label: "Vòng tròn", icon: Users, desc: "Mỗi đội đấu với tất cả đội khác. Công bằng nhất.", scoring: "Thắng=3đ, Hòa=1đ, Thua=0đ", color: "text-blue-600 bg-blue-50" },
    { value: "group_stage", label: "Vòng bảng + Loại trực tiếp", icon: BarChart3, desc: "Chia bảng đấu vòng tròn, đội đứng đầu vào vòng loại trực tiếp.", scoring: "Thắng=3đ, Hòa=1đ", color: "text-purple-600 bg-purple-50" },
];

const gameModeOptions = [
    { value: "1v1", label: "1 vs 1" },
    { value: "2v2", label: "2 vs 2" },
    { value: "3v3", label: "3 vs 3" },
    { value: "6v6", label: "6 vs 6" },
];

const tiebreakerLabels: Record<string, string> = {
    points: "Điểm số", goalDifference: "Hiệu số bàn thắng", goalsFor: "Bàn thắng ghi được", headToHead: "Đối đầu trực tiếp",
};

export default function TaoGiaiDauPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Basic Info
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [gameMode, setGameMode] = useState<"1v1" | "2v2" | "3v3" | "6v6">("6v6");

    // Format & Settings
    const [format, setFormat] = useState("single_elimination");
    const [maxSlotsStr, setMaxSlotsStr] = useState("16");
    const [isOnline, setIsOnline] = useState(false);
    const [location, setLocation] = useState("");

    // Scoring
    const [pointsPerWin, setPointsPerWin] = useState("3");
    const [pointsPerDraw, setPointsPerDraw] = useState("1");
    const [pointsPerLoss, setPointsPerLoss] = useState("0");
    const [teamsPerGroup, setTeamsPerGroup] = useState("4");
    const [advancePerGroup, setAdvancePerGroup] = useState("2");

    // Schedule
    const [registrationStart, setRegistrationStart] = useState<Date | undefined>();
    const [registrationEnd, setRegistrationEnd] = useState<Date | undefined>();
    const [tournamentStart, setTournamentStart] = useState<Date | undefined>();
    const [tournamentEnd, setTournamentEnd] = useState<Date | undefined>();

    // Prize & Fee
    const [prizeTotal, setPrizeTotal] = useState("");
    const [prizeFirst, setPrizeFirst] = useState("");
    const [prizeSecond, setPrizeSecond] = useState("");
    const [prizeThird, setPrizeThird] = useState("");

    // Rules & Settings
    const [rules, setRules] = useState("");
    const [matchDuration, setMatchDuration] = useState("25");
    const [extraTime, setExtraTime] = useState(false);
    const [penalties, setPenalties] = useState(true);
    const [isPublic, setIsPublic] = useState(true);

    // Contact
    const [contactPhone, setContactPhone] = useState("");
    const [contactFacebook, setContactFacebook] = useState("");
    const [contactZalo, setContactZalo] = useState("");

    // Banner upload
    const [bannerUrl, setBannerUrl] = useState("");
    const [bannerPreview, setBannerPreview] = useState("");
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // SEO fields
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");

    const maxSlots = parseInt(maxSlotsStr, 10) || 2;

    const handleFormatChange = (newFormat: string) => {
        setFormat(newFormat);
        if (newFormat === "single_elimination") {
            setPointsPerWin("0"); setPointsPerDraw("0"); setPointsPerLoss("0");
        } else {
            setPointsPerWin("3"); setPointsPerDraw("1"); setPointsPerLoss("0");
        }
        if (newFormat === "group_stage") {
            setTeamsPerGroup("4"); setAdvancePerGroup("2");
        }
    };

    /* ===== Banner Upload Handler ===== */
    const handleBannerUpload = useCallback(async (file: File) => {
        if (!file) return;
        // Validate image type
        if (!file.type.startsWith("image/")) {
            setError("Chỉ chấp nhận file hình ảnh (JPG, PNG, WebP...)");
            return;
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("File quá lớn, tối đa 10MB");
            return;
        }
        setIsUploadingBanner(true);
        setError("");
        try {
            // Show preview immediately
            const previewUrl = URL.createObjectURL(file);
            setBannerPreview(previewUrl);
            // Upload to server
            const res = await uploadImage(file, "banner");
            if (res.success) {
                setBannerUrl(res.data.url);
            } else {
                setError(res.message || "Upload ảnh thất bại");
                setBannerPreview("");
            }
        } catch {
            setError("Có lỗi xảy ra khi upload ảnh");
            setBannerPreview("");
        } finally {
            setIsUploadingBanner(false);
        }
    }, []);

    const handleBannerDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleBannerUpload(file);
    }, [handleBannerUpload]);

    const handleBannerFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleBannerUpload(file);
        // Reset input so same file can be re-selected
        e.target.value = "";
    }, [handleBannerUpload]);

    const removeBanner = useCallback(() => {
        setBannerUrl("");
        setBannerPreview("");
    }, []);

    const getFormatInfo = () => {
        const n = maxSlots;
        const tpg = parseInt(teamsPerGroup, 10) || 4;
        const apg = parseInt(advancePerGroup, 10) || 2;

        switch (format) {
            case "single_elimination": return { rounds: Math.ceil(Math.log2(n)), matches: n > 0 ? n - 1 : 0 };
            case "round_robin": return { rounds: n - 1, matches: (n * (n - 1)) / 2 };
            case "group_stage": {
                const groups = Math.ceil(n / tpg);
                const groupMatches = groups * ((tpg * (tpg - 1)) / 2);
                const knockoutTeams = groups * apg;
                const knockoutMatches = knockoutTeams > 0 ? knockoutTeams - 1 : 0;
                return { rounds: tpg - 1 + Math.ceil(Math.log2(knockoutTeams || 1)), matches: groupMatches + knockoutMatches };
            }
            default: return { rounds: 0, matches: 0 };
        }
    };

    const handleSubmit = async () => {
        setError(""); setIsSubmitting(true);
        try {
            const scoring: any = {
                pointsPerWin: parseInt(pointsPerWin, 10) || 0,
                pointsPerDraw: parseInt(pointsPerDraw, 10) || 0,
                pointsPerLoss: parseInt(pointsPerLoss, 10) || 0,
            };
            if (format === "round_robin" || format === "group_stage") {
                scoring.tiebreakers = ["points", "goalDifference", "goalsFor", "headToHead"];
                if (format === "group_stage") {
                    scoring.teamsPerGroup = parseInt(teamsPerGroup, 10) || 4;
                    scoring.advancePerGroup = parseInt(advancePerGroup, 10) || 2;
                }
            }

            const formatPrize = (raw: string) => raw ? formatVNCurrency(raw) + " VNĐ" : "";
            const tournamentData = {
                title, description, gameMode, format, maxSlots, isOnline, location,
                schedule: {
                    registrationStart: registrationStart?.toISOString(),
                    registrationEnd: registrationEnd?.toISOString(),
                    tournamentStart: tournamentStart?.toISOString(),
                    tournamentEnd: tournamentEnd?.toISOString(),
                },
                prize: {
                    total: prizeTotal ? formatPrize(prizeTotal) : "0 VNĐ",
                    first: formatPrize(prizeFirst), second: formatPrize(prizeSecond), third: formatPrize(prizeThird),
                },
                scoring, rules,
                settings: { matchDuration: parseInt(matchDuration, 10) || 25, extraTime, penalties },
                contact: { phone: contactPhone, facebook: contactFacebook, zalo: contactZalo },
                isPublic, tags: tags.split(",").map(t => t.trim()).filter(Boolean),
                status: "draft", banner: bannerUrl,
                seo: {
                    title: seoTitle || title,
                    description: seoDescription || description,
                },
            };

            const res = await tournamentAPI.create(tournamentData);
            if (res.success) router.push(`/manager/giai-dau/${res.data.tournament._id}`);
            else setError(res.message || "Có lỗi xảy ra khi tạo giải đấu");
        } catch {
            setError("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSteps = 4;
    const formatInfo = getFormatInfo();
    const selectedFormat = formatOptions.find(f => f.value === format);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-efb-text-secondary" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-efb-dark">Tạo giải đấu mới</h1>
                    <p className="text-sm text-efb-text-muted">Bước {step}/{totalSteps}</p>
                </div>
            </div>

            <div className="flex gap-2 mb-8">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-efb-red" : "bg-gray-200"}`} />
                ))}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step 1: Basic */}
            {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <Info className="w-5 h-5 text-efb-red" />
                        </div>
                        <div><h2 className="text-lg font-semibold text-efb-dark">Thông tin cơ bản</h2><p className="text-xs text-efb-text-muted">Tên, mô tả và chế độ thi đấu</p></div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tên giải đấu *</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: 6v6 Hanoi Open 2026" className="h-12" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Chế độ thi đấu *</Label>
                        <div className="flex gap-2">
                            {gameModeOptions.map(mode => (
                                <button
                                    key={mode.value} type="button" onClick={() => setGameMode(mode.value as any)}
                                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${gameMode === mode.value ? "border-efb-red bg-red-50 text-efb-red" : "border-gray-200 text-efb-text-secondary hover:border-gray-300"}`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Mô tả</Label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Giới thiệu về giải đấu..." rows={4} className="w-full rounded border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tags</Label>
                        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="football, 6v6, hanoi" className="h-12" />
                    </div>

                    {/* Banner Image Upload */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-efb-red" /> Ảnh banner giải đấu
                        </Label>
                        {(bannerPreview || bannerUrl) ? (
                            <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-efb-red/30 transition-colors">
                                <img
                                    src={bannerPreview || bannerUrl}
                                    alt="Banner preview"
                                    className="w-full h-48 object-cover"
                                />
                                {isUploadingBanner && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                                            <span className="text-white text-sm font-medium">Đang tải lên...</span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => bannerInputRef.current?.click()}
                                            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                        >
                                            <Camera className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeBanner}
                                            className="w-10 h-10 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                                        <FileImage className="w-3.5 h-3.5 text-white/70" />
                                        <span className="text-white/90 text-xs truncate">{bannerUrl ? "Đã tải lên" : "Đang xử lý..."}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleBannerDrop}
                                onClick={() => bannerInputRef.current?.click()}
                                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
                                    isDragging
                                        ? "border-efb-red bg-red-50/50 scale-[1.01]"
                                        : "border-gray-300 hover:border-efb-red/50 hover:bg-gray-50/50"
                                }`}
                            >
                                <div className="flex flex-col items-center justify-center py-10 px-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                                        isDragging ? "bg-red-100" : "bg-gray-100"
                                    }`}>
                                        <Upload className={`w-6 h-6 transition-colors ${
                                            isDragging ? "text-efb-red" : "text-gray-400"
                                        }`} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        {isDragging ? "Thả ảnh vào đây" : "Kéo thả ảnh hoặc click để chọn"}
                                    </p>
                                    <p className="text-xs text-gray-400">JPG, PNG, WebP • Tối đa 10MB</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Kích thước khuyến nghị: 1200×630px</p>
                                </div>
                            </div>
                        )}
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* SEO Section */}
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <SearchIcon className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <Label className="text-sm font-semibold text-efb-dark">Tối ưu SEO</Label>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Tùy chọn</span>
                        </div>
                        <p className="text-xs text-gray-400 -mt-2">Tối ưu hiển thị trên Google và mạng xã hội. Để trống sẽ tự động sử dụng tên và mô tả giải đấu.</p>
                        <div className="space-y-2">
                            <Label className="text-xs text-efb-text-muted">Tiêu đề SEO</Label>
                            <Input
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                placeholder={title || "VD: Giải bóng đá 6v6 Hà Nội mở rộng 2026"}
                                className="h-10 text-sm"
                                maxLength={70}
                            />
                            <div className="flex justify-between">
                                <span className="text-[10px] text-gray-400">Hiển thị trên Google, Facebook...</span>
                                <span className={`text-[10px] ${seoTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>{seoTitle.length}/70</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-efb-text-muted">Mô tả SEO</Label>
                            <textarea
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                placeholder={description || "VD: Tham gia giải bóng đá sân 6 lớn nhất Hà Nội với tổng giải thưởng 50 triệu đồng..."}
                                rows={3}
                                maxLength={160}
                                className="w-full rounded border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all"
                            />
                            <div className="flex justify-between">
                                <span className="text-[10px] text-gray-400">Mô tả ngắn gọn về giải đấu</span>
                                <span className={`text-[10px] ${seoDescription.length > 150 ? "text-amber-500" : "text-gray-400"}`}>{seoDescription.length}/160</span>
                            </div>
                        </div>

                        {/* SEO Preview */}
                        {(seoTitle || title) && (
                            <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Xem trước trên Google</p>
                                <p className="text-blue-700 text-sm font-medium truncate hover:underline cursor-default">
                                    {seoTitle || title} | 6v6 Vietnam
                                </p>
                                <p className="text-emerald-700 text-xs truncate">6v6.vn › giai-dau › {(seoTitle || title || "ten-giai-dau").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").slice(0, 40)}</p>
                                <p className="text-gray-600 text-xs line-clamp-2">
                                    {seoDescription || description || "Mô tả giải đấu sẽ hiển thị tại đây..."}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Step 2: Format */}
            {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-purple-600" />
                        </div>
                        <div><h2 className="text-lg font-semibold text-efb-dark">Thể thức & Cài đặt</h2><p className="text-xs text-efb-text-muted">Chọn thể thức thi đấu và số lượng đội</p></div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Thể thức thi đấu *</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {formatOptions.map((fmt) => (
                                <button key={fmt.value} type="button" onClick={() => handleFormatChange(fmt.value)} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${format === fmt.value ? "border-efb-red bg-red-50/50" : "border-gray-200 hover:border-gray-300"}`}>
                                    <div className={`w-8 h-8 rounded-lg ${fmt.color} flex items-center justify-center flex-shrink-0 mt-0.5`}><fmt.icon className="w-4 h-4" /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-efb-dark">{fmt.label}</div>
                                        <div className="text-xs text-efb-text-muted mt-0.5">{fmt.desc}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${format === fmt.value ? "border-efb-red" : "border-gray-300"}`}>
                                        {format === fmt.value && <div className="w-2.5 h-2.5 rounded-full bg-efb-red" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {["round_robin", "group_stage"].includes(format) && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                            <Label className="text-sm font-semibold text-efb-dark">Cấu hình điểm số</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5"><Label className="text-xs text-efb-text-muted">Thắng</Label><Input value={pointsPerWin} onChange={(e) => setPointsPerWin(e.target.value.replace(/\D/g, ""))} className="h-10 text-center font-bold text-emerald-600" inputMode="numeric" /></div>
                                <div className="space-y-1.5"><Label className="text-xs text-efb-text-muted">Hòa</Label><Input value={pointsPerDraw} onChange={(e) => setPointsPerDraw(e.target.value.replace(/\D/g, ""))} className="h-10 text-center font-bold text-amber-600" inputMode="numeric" /></div>
                                <div className="space-y-1.5"><Label className="text-xs text-efb-text-muted">Thua</Label><Input value={pointsPerLoss} onChange={(e) => setPointsPerLoss(e.target.value.replace(/\D/g, ""))} className="h-10 text-center font-bold text-red-500" inputMode="numeric" /></div>
                            </div>
                            {format === "group_stage" && (
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                                    <div className="space-y-1.5"><Label className="text-xs text-efb-text-muted">Số đội/bảng</Label><Input value={teamsPerGroup} onChange={(e) => setTeamsPerGroup(e.target.value.replace(/\D/g, ""))} className="h-10" inputMode="numeric" /></div>
                                    <div className="space-y-1.5"><Label className="text-xs text-efb-text-muted">Đội đi tiếp/bảng</Label><Input value={advancePerGroup} onChange={(e) => setAdvancePerGroup(e.target.value.replace(/\D/g, ""))} className="h-10" inputMode="numeric" /></div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Số đội tối đa *</Label>
                        <Input value={maxSlotsStr} onChange={(e) => setMaxSlotsStr(e.target.value.replace(/\D/g, ""))} onBlur={() => { const n = parseInt(maxSlotsStr, 10); if (!n || n < 2) setMaxSlotsStr("2"); }} placeholder="16" className="h-12" inputMode="numeric" />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsOnline(true)} className={`flex-1 flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${isOnline ? "border-efb-red bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                            <Wifi className={`w-5 h-5 ${isOnline ? "text-efb-red" : "text-gray-400"}`} />
                            <div className="text-left"><div className={`text-sm font-medium ${isOnline ? "text-efb-red" : "text-gray-600"}`}>Online</div></div>
                        </button>
                        <button type="button" onClick={() => setIsOnline(false)} className={`flex-1 flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${!isOnline ? "border-efb-red bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                            <MapPin className={`w-5 h-5 ${!isOnline ? "text-efb-red" : "text-gray-400"}`} />
                            <div className="text-left"><div className={`text-sm font-medium ${!isOnline ? "text-efb-red" : "text-gray-600"}`}>Offline</div></div>
                        </button>
                    </div>
                    {!isOnline && (
                        <div className="space-y-2"><Label className="text-sm font-medium">Địa điểm thi đấu</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nhập địa chỉ sân bóng" className="h-12" /></div>
                    )}
                </motion.div>
            )}

            {/* Step 3: Schedule & Prize */}
            {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><CalendarIcon className="w-5 h-5 text-amber-600" /></div>
                        <div><h2 className="text-lg font-semibold text-efb-dark">Lịch trình & Giải thưởng</h2><p className="text-xs text-efb-text-muted">Thời gian và giải thưởng</p></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-sm font-medium">Bắt đầu đăng ký</Label><DatePicker label="Chọn ngày" value={registrationStart} onChange={setRegistrationStart} /></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Kết thúc đăng ký</Label><DatePicker label="Chọn ngày" value={registrationEnd} onChange={setRegistrationEnd} /></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Ngày khai mạc</Label><DatePicker label="Chọn ngày" value={tournamentStart} onChange={setTournamentStart} /></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Ngày bế mạc</Label><DatePicker label="Chọn ngày" value={tournamentEnd} onChange={setTournamentEnd} /></div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-amber-500" /><Label className="text-sm font-semibold text-efb-dark">Giải thưởng</Label></div>
                        <div className="space-y-2"><Label className="text-xs text-efb-text-muted">Tổng giải thưởng (VNĐ)</Label><CurrencyInput value={prizeTotal} onChange={setPrizeTotal} placeholder="VD: 10.000.000" className="h-12" /></div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2"><Label className="text-xs text-efb-text-muted">🥇 Nhất</Label><CurrencyInput value={prizeFirst} onChange={setPrizeFirst} placeholder="5.000.000" className="h-10 text-sm" /></div>
                            <div className="space-y-2"><Label className="text-xs text-efb-text-muted">🥈 Nhì</Label><CurrencyInput value={prizeSecond} onChange={setPrizeSecond} placeholder="3.000.000" className="h-10 text-sm" /></div>
                            <div className="space-y-2"><Label className="text-xs text-efb-text-muted">🥉 Ba</Label><CurrencyInput value={prizeThird} onChange={setPrizeThird} placeholder="1.000.000" className="h-10 text-sm" /></div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 4: Rules & Contact */}
            {step === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                        <div><h2 className="text-lg font-semibold text-efb-dark">Nội quy & Liên hệ</h2><p className="text-xs text-efb-text-muted">Bước cuối cùng</p></div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Cài đặt trận đấu</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2"><Label className="text-xs text-efb-text-muted">Thời gian trận (phút)</Label><Input value={matchDuration} onChange={(e) => setMatchDuration(e.target.value.replace(/\D/g, ""))} className="h-10" inputMode="numeric" /></div>
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={extraTime} onChange={(e) => setExtraTime(e.target.checked)} className="rounded border-gray-300 text-efb-red focus:ring-efb-red" /><span className="text-sm text-efb-text-secondary">Hiệp phụ</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={penalties} onChange={(e) => setPenalties(e.target.checked)} className="rounded border-gray-300 text-efb-red focus:ring-efb-red" /><span className="text-sm text-efb-text-secondary">Penalty</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded border-gray-300 text-efb-red focus:ring-efb-red" /><span className="text-sm text-efb-text-secondary">Công khai</span></label>
                        </div>
                    </div>

                    <div className="space-y-2"><Label className="text-sm font-medium">Nội quy giải đấu</Label><textarea value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Nhập nội quy, quy định của giải đấu..." rows={5} className="w-full rounded border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red transition-all" /></div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <Label className="text-sm font-semibold">Thông tin liên hệ BTC</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2"><Label className="text-xs text-efb-text-muted">Số điện thoại</Label><Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="0xxx xxx xxx" className="h-10 text-sm" /></div>
                            <div className="space-y-2"><Label className="text-xs text-efb-text-muted">Zalo</Label><Input value={contactZalo} onChange={(e) => setContactZalo(e.target.value)} placeholder="SĐT Zalo" className="h-10 text-sm" /></div>
                            <div className="space-y-2 col-span-2"><Label className="text-xs text-efb-text-muted">Facebook</Label><Input value={contactFacebook} onChange={(e) => setContactFacebook(e.target.value)} placeholder="Link Facebook" className="h-10 text-sm" /></div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="flex justify-between mt-6 pb-8">
                {step > 1 ? <Button type="button" variant="outline" onClick={() => { setError(""); setStep(step - 1); }} className="rounded-xl h-11 px-6"><ArrowLeft className="w-4 h-4 mr-2" />Quay lại</Button> : <div />}
                {step < totalSteps ? (
                    <Button type="button" onClick={() => { if (step === 1 && !title.trim()) return setError("Vui lòng nhập tên giải đấu"); setError(""); setStep(step + 1); }} className="bg-efb-red text-white hover:bg-efb-red-light rounded-xl h-11 px-6 group">
                        Tiếp theo<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                ) : (
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-efb-red text-white hover:bg-efb-red-light rounded-xl h-11 px-8 group">
                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang tạo...</> : <><Trophy className="w-4 h-4 mr-2" />Tạo giải đấu</>}
                    </Button>
                )}
            </div>
        </div>
    );
}
