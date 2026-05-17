"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Trophy, Calendar, Users, Gamepad2, Settings, ChevronLeft, MapPin, Loader2,
    PlayCircle, Eye, Edit, Save, X, Camera, Upload, FileImage, ImageIcon,
    Flame, Clock, CheckCircle2, Ban, ExternalLink, Wifi, Search as SearchIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tournamentAPI, uploadImage } from "@/lib/api";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; bg: string; next?: string; nextLabel?: string }> = {
    draft: { label: "NHÁP", bg: "bg-gray-100 text-gray-600", next: "registration", nextLabel: "Mở đăng ký" },
    registration: { label: "MỞ ĐĂNG KÝ", bg: "bg-blue-100 text-blue-600", next: "ongoing", nextLabel: "Bắt đầu thi đấu" },
    ongoing: { label: "ĐANG DIỄN RA", bg: "bg-red-100 text-red-600", next: "completed", nextLabel: "Kết thúc giải" },
    completed: { label: "ĐÃ KẾT THÚC", bg: "bg-emerald-100 text-emerald-600" },
    cancelled: { label: "ĐÃ HỦY", bg: "bg-gray-100 text-gray-500" },
};

const formatLabels: Record<string, string> = {
    single_elimination: "Loại trực tiếp",
    round_robin: "Vòng tròn",
    group_stage: "Vòng bảng + Loại trực tiếp",
};

export default function TournamentOverview() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [tournament, setTournament] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Banner edit
    const [isEditingBanner, setIsEditingBanner] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // SEO edit
    const [isEditingSeo, setIsEditingSeo] = useState(false);
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [isSavingSeo, setIsSavingSeo] = useState(false);

    const loadTournament = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await tournamentAPI.getById(id);
            if (res.success) {
                setTournament(res.data.tournament);
                setParticipants(res.data.participants || []);
                setMatches(res.data.matches || []);
                setSeoTitle(res.data.tournament.seo?.title || "");
                setSeoDescription(res.data.tournament.seo?.description || "");
            } else {
                toast.error(res.message || "Không tìm thấy giải đấu");
                router.push("/manager/giai-dau");
            }
        } catch {
            toast.error("Có lỗi xảy ra");
            router.push("/manager/giai-dau");
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) loadTournament();
    }, [id, loadTournament]);

    /* ===== Banner Upload ===== */
    const handleBannerUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Chỉ chấp nhận file hình ảnh");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File quá lớn, tối đa 10MB");
            return;
        }
        setIsUploadingBanner(true);
        try {
            const uploadRes = await uploadImage(file, "banner");
            if (uploadRes.success) {
                const updateRes = await tournamentAPI.update(id, { banner: uploadRes.data.url });
                if (updateRes.success) {
                    setTournament((prev: any) => ({ ...prev, banner: uploadRes.data.url }));
                    toast.success("Đã cập nhật ảnh banner");
                    setIsEditingBanner(false);
                }
            } else {
                toast.error(uploadRes.message || "Upload thất bại");
            }
        } catch {
            toast.error("Có lỗi xảy ra khi upload");
        } finally {
            setIsUploadingBanner(false);
        }
    }, [id]);

    const handleBannerDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleBannerUpload(file);
    }, [handleBannerUpload]);

    const removeBanner = useCallback(async () => {
        try {
            const res = await tournamentAPI.update(id, { banner: "" });
            if (res.success) {
                setTournament((prev: any) => ({ ...prev, banner: "" }));
                toast.success("Đã xóa ảnh banner");
            }
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    }, [id]);

    /* ===== Status Update ===== */
    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Chuyển trạng thái giải đấu sang "${statusConfig[newStatus]?.label}"?`)) return;
        setIsUpdatingStatus(true);
        try {
            const res = await tournamentAPI.updateStatus(id, newStatus);
            if (res.success) {
                setTournament((prev: any) => ({ ...prev, status: newStatus }));
                toast.success("Đã cập nhật trạng thái");
            } else {
                toast.error(res.message || "Không thể cập nhật");
            }
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    /* ===== SEO Save ===== */
    const handleSaveSeo = async () => {
        setIsSavingSeo(true);
        try {
            const res = await tournamentAPI.update(id, {
                seo: {
                    title: seoTitle || tournament.title,
                    description: seoDescription || tournament.description,
                },
            });
            if (res.success) {
                setTournament((prev: any) => ({
                    ...prev,
                    seo: { title: seoTitle, description: seoDescription },
                }));
                toast.success("Đã lưu SEO");
                setIsEditingSeo(false);
            }
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setIsSavingSeo(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-efb-red mb-4" />
                <p className="text-sm text-gray-500">Đang tải thông tin giải đấu...</p>
            </div>
        );
    }

    if (!tournament) return <div>Không tìm thấy giải đấu</div>;

    const currentStatus = statusConfig[tournament.status] || statusConfig.draft;
    const completedMatches = matches.filter(m => m.status === "completed").length;
    const matchProgress = matches.length > 0 ? Math.round((completedMatches / matches.length) * 100) : 0;

    const quickActions = [
        { label: "Đăng ký thi đấu", href: `/manager/giai-dau/${id}/dang-ky`, icon: Users, color: "text-blue-600", bg: "bg-blue-50", desc: `${participants.length} đã đăng ký` },
        { label: "Lịch thi đấu", href: `/manager/giai-dau/${id}/lich`, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50", desc: `${matches.length} trận đấu` },
        { label: "Cài đặt giải đấu", href: `/manager/giai-dau/${id}/cai-dat`, icon: Settings, color: "text-purple-600", bg: "bg-purple-50", desc: "Chỉnh sửa thông tin" },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {tournament.banner ? (
                    <div className="relative h-48 sm:h-56 group">
                        <img src={tournament.banner} alt={tournament.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => bannerInputRef.current?.click()} className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                                <Camera className="w-4 h-4 text-gray-700" />
                            </button>
                            <button onClick={removeBanner} className="w-9 h-9 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg">
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        {isUploadingBanner && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleBannerDrop}
                        onClick={() => bannerInputRef.current?.click()}
                        className={`h-40 flex flex-col items-center justify-center cursor-pointer transition-all ${
                            isDragging ? "bg-red-50 border-2 border-dashed border-efb-red" : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-gray-50"
                        }`}
                    >
                        <Upload className={`w-8 h-8 mb-2 ${isDragging ? "text-efb-red" : "text-gray-300"}`} />
                        <p className="text-sm text-gray-500 font-medium">{isDragging ? "Thả ảnh vào đây" : "Thêm ảnh banner"}</p>
                        <p className="text-xs text-gray-400">Kéo thả hoặc click • 1200×630px</p>
                    </div>
                )}
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); e.target.value = ""; }} className="hidden" />
            </div>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Trophy className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/manager/giai-dau">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-efb-dark">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Danh sách
                            </Button>
                        </Link>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${currentStatus.bg}`}>
                            {currentStatus.label}
                        </span>
                        {currentStatus.next && (
                            <Button
                                size="sm"
                                onClick={() => handleStatusChange(currentStatus.next!)}
                                disabled={isUpdatingStatus}
                                className="h-7 text-[10px] rounded-full bg-efb-red text-white hover:bg-red-700 ml-auto"
                            >
                                {isUpdatingStatus ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                → {currentStatus.nextLabel}
                            </Button>
                        )}
                        <Link href={`/giai-dau/${id}`} target="_blank" className="ml-auto">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-indigo-600">
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Gamepad2 className="w-4 h-4" /> {tournament.gameMode}</span>
                        <span className="flex items-center gap-1.5"><Settings className="w-4 h-4" /> {formatLabels[tournament.format] || tournament.format}</span>
                        {!tournament.isOnline && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {tournament.location || "Chưa cập nhật"}</span>}
                        {tournament.isOnline && <span className="flex items-center gap-1.5"><Wifi className="w-4 h-4" /> Online</span>}
                        {tournament.schedule?.tournamentStart && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {new Date(tournament.schedule.tournamentStart).toLocaleDateString("vi-VN")}
                            </span>
                        )}
                    </div>

                    {tournament.description && (
                        <p className="text-sm text-gray-400 mt-3 line-clamp-2">{tournament.description}</p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Đội tham gia", value: `${tournament.currentSlots || 0}/${tournament.maxSlots}`, icon: Users, color: "text-blue-600" },
                    { label: "Trận đấu", value: matches.length, icon: PlayCircle, color: "text-red-600" },
                    { label: "Lượt xem", value: tournament.views || 0, icon: Eye, color: "text-emerald-600" },
                    { label: "Hoàn thành", value: `${matchProgress}%`, icon: Trophy, color: "text-amber-600" },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                            <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Truy cập nhanh</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quickActions.map((action, i) => (
                        <Link key={i} href={action.href}>
                            <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                                <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                                    <action.icon className={`w-5 h-5 ${action.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">{action.label}</h3>
                                    <p className="text-[11px] text-gray-400">{action.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <SearchIcon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Tối ưu SEO</h2>
                            <p className="text-[11px] text-gray-400">Hiển thị trên Google & mạng xã hội</p>
                        </div>
                    </div>
                    {!isEditingSeo ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditingSeo(true)} className="h-8 rounded-lg text-xs">
                            <Edit className="w-3 h-3 mr-1" /> Chỉnh sửa
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditingSeo(false)} className="h-8 rounded-lg text-xs">
                                <X className="w-3 h-3 mr-1" /> Hủy
                            </Button>
                            <Button size="sm" onClick={handleSaveSeo} disabled={isSavingSeo} className="h-8 rounded-lg text-xs bg-efb-red text-white hover:bg-red-700">
                                {isSavingSeo ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Lưu
                            </Button>
                        </div>
                    )}
                </div>

                {isEditingSeo ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">Tiêu đề SEO</Label>
                            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={tournament.title} className="h-10 text-sm" maxLength={70} />
                            <div className="flex justify-end">
                                <span className={`text-[10px] ${seoTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>{seoTitle.length}/70</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">Mô tả SEO</Label>
                            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={tournament.description || "Mô tả giải đấu..."} rows={3} maxLength={160} className="w-full rounded border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red" />
                            <div className="flex justify-end">
                                <span className={`text-[10px] ${seoDescription.length > 150 ? "text-amber-500" : "text-gray-400"}`}>{seoDescription.length}/160</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Xem trước trên Google</p>
                        <p className="text-blue-700 text-sm font-medium truncate">
                            {tournament.seo?.title || tournament.title} | 6v6 Vietnam
                        </p>
                        <p className="text-emerald-700 text-xs truncate">6v6.vn › giai-dau › {tournament.slug || id}</p>
                        <p className="text-gray-600 text-xs line-clamp-2">
                            {tournament.seo?.description || tournament.description || "Chưa có mô tả SEO"}
                        </p>
                    </div>
                )}
            </div>

            {/* Tournament Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Thông tin chi tiết</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                        { label: "Giải thưởng", value: tournament.prize?.total || "Chưa cập nhật" },
                        { label: "Thời lượng trận", value: `${tournament.settings?.matchDuration || 25} phút` },
                        { label: "Hiệp phụ", value: tournament.settings?.extraTime ? "Có" : "Không" },
                        { label: "Penalty", value: tournament.settings?.penalties ? "Có" : "Không" },
                        { label: "Ngày khai mạc", value: tournament.schedule?.tournamentStart ? new Date(tournament.schedule.tournamentStart).toLocaleDateString("vi-VN") : "Chưa đặt" },
                        { label: "Ngày bế mạc", value: tournament.schedule?.tournamentEnd ? new Date(tournament.schedule.tournamentEnd).toLocaleDateString("vi-VN") : "Chưa đặt" },
                        { label: "Công khai", value: tournament.isPublic ? "Có" : "Không" },
                        { label: "Tags", value: tournament.tags?.join(", ") || "Không có" },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500">{item.label}</span>
                            <span className="font-medium text-gray-900">{item.value}</span>
                        </div>
                    ))}
                </div>
                {tournament.contact && (tournament.contact.phone || tournament.contact.facebook || tournament.contact.zalo) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Liên hệ BTC</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {tournament.contact.phone && <span>📞 {tournament.contact.phone}</span>}
                            {tournament.contact.zalo && <span>💬 Zalo: {tournament.contact.zalo}</span>}
                            {tournament.contact.facebook && <a href={tournament.contact.facebook} target="_blank" className="text-blue-500 hover:underline">🔗 Facebook</a>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
