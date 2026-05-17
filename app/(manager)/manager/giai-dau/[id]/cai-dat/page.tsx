"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Loader2, Save, Settings, Trophy, Calendar, Phone, Globe, Upload,
    Camera, X, Trash2, AlertTriangle, ImageIcon, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tournamentAPI, uploadImage } from "@/lib/api";
import { toast } from "sonner";

export default function TournamentSettings() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [tournament, setTournament] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const bannerRef = useRef<HTMLInputElement>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [location, setLocation] = useState("");
    const [isOnline, setIsOnline] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [maxSlots, setMaxSlots] = useState("16");
    const [matchDuration, setMatchDuration] = useState("25");
    const [extraTime, setExtraTime] = useState(false);
    const [penalties, setPenalties] = useState(false);
    const [pointsWin, setPointsWin] = useState("3");
    const [pointsDraw, setPointsDraw] = useState("1");
    const [pointsLoss, setPointsLoss] = useState("0");
    const [prizeTotal, setPrizeTotal] = useState("");
    const [prizeFirst, setPrizeFirst] = useState("");
    const [prizeSecond, setPrizeSecond] = useState("");
    const [prizeThird, setPrizeThird] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactFacebook, setContactFacebook] = useState("");
    const [contactZalo, setContactZalo] = useState("");
    const [rules, setRules] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await tournamentAPI.getById(id);
            if (res.success) {
                const t = res.data.tournament;
                setTournament(t);
                setTitle(t.title || "");
                setDescription(t.description || "");
                setTags(t.tags?.join(", ") || "");
                setLocation(t.location || "");
                setIsOnline(t.isOnline || false);
                setIsPublic(t.isPublic !== false);
                setMaxSlots(String(t.maxSlots || 16));
                setMatchDuration(String(t.settings?.matchDuration || 25));
                setExtraTime(t.settings?.extraTime || false);
                setPenalties(t.settings?.penalties || false);
                setPointsWin(String(t.scoring?.pointsPerWin || 3));
                setPointsDraw(String(t.scoring?.pointsPerDraw || 1));
                setPointsLoss(String(t.scoring?.pointsPerLoss || 0));
                setPrizeTotal(t.prize?.total || "");
                setPrizeFirst(t.prize?.first || "");
                setPrizeSecond(t.prize?.second || "");
                setPrizeThird(t.prize?.third || "");
                setContactPhone(t.contact?.phone || "");
                setContactFacebook(t.contact?.facebook || "");
                setContactZalo(t.contact?.zalo || "");
                setRules(t.rules || "");
                setSeoTitle(t.seo?.title || "");
                setSeoDescription(t.seo?.description || "");
                setBannerUrl(t.banner || "");
            }
        } catch { toast.error("Lỗi tải dữ liệu"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const handleSave = async () => {
        if (!title.trim()) { toast.error("Vui lòng nhập tên giải đấu"); return; }
        setIsSaving(true);
        try {
            const res = await tournamentAPI.update(id, {
                title, description, location, isOnline, isPublic,
                maxSlots: parseInt(maxSlots) || 16,
                tags: tags.split(",").map(t => t.trim()).filter(Boolean),
                settings: { matchDuration: parseInt(matchDuration) || 25, extraTime, penalties },
                scoring: { ...tournament.scoring, pointsPerWin: parseInt(pointsWin), pointsPerDraw: parseInt(pointsDraw), pointsPerLoss: parseInt(pointsLoss) },
                prize: { total: prizeTotal, first: prizeFirst, second: prizeSecond, third: prizeThird },
                contact: { phone: contactPhone, facebook: contactFacebook, zalo: contactZalo },
                rules, banner: bannerUrl,
                seo: { title: seoTitle || title, description: seoDescription || description },
            });
            if (res.success) toast.success("Đã lưu cài đặt");
            else toast.error(res.message);
        } catch { toast.error("Lỗi lưu"); }
        finally { setIsSaving(false); }
    };

    const handleBannerUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) { toast.error("File ảnh không hợp lệ (max 10MB)"); return; }
        setIsUploadingBanner(true);
        try {
            const res = await uploadImage(file, "banner");
            if (res.success) { setBannerUrl(res.data.url); toast.success("Đã tải ảnh"); }
            else toast.error(res.message);
        } catch { toast.error("Upload lỗi"); }
        finally { setIsUploadingBanner(false); }
    }, []);

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN giải đấu này? Hành động này không thể hoàn tác.")) return;
        setIsDeleting(true);
        try {
            const res = await tournamentAPI.delete(id);
            if (res.success) { toast.success("Đã xóa giải đấu"); router.push("/manager/giai-dau"); }
            else toast.error(res.message);
        } catch { toast.error("Lỗi"); }
        finally { setIsDeleting(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>;
    if (!tournament) return null;

    const Section = ({ icon: Icon, title, children, color = "text-efb-red", bg = "bg-red-50" }: any) => (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${color}`} /></div>
                <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );

    const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-medium">{label}</Label>{children}</div>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Cài đặt giải đấu</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Chỉnh sửa thông tin và cấu hình giải đấu</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="h-10 px-5 rounded-xl bg-efb-red text-white hover:bg-red-700 font-medium">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Lưu thay đổi
                </Button>
            </div>

            {/* Banner */}
            <Section icon={ImageIcon} title="Ảnh banner" color="text-indigo-600" bg="bg-indigo-50">
                {bannerUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                        <img src={bannerUrl} alt="Banner" className="w-full h-44 object-cover" />
                        {isUploadingBanner && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                                <button onClick={() => bannerRef.current?.click()} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"><Camera className="w-4 h-4" /></button>
                                <button onClick={() => setBannerUrl("")} className="w-10 h-10 rounded-full bg-red-500/90 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => bannerRef.current?.click()} className="h-36 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-efb-red/50 hover:bg-gray-50/50 transition-all">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" /><p className="text-xs text-gray-500 font-medium">Click để tải ảnh</p>
                    </div>
                )}
                <input ref={bannerRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); e.target.value = ""; }} className="hidden" />
            </Section>

            {/* Basic info */}
            <Section icon={Trophy} title="Thông tin cơ bản">
                <Field label="Tên giải đấu *"><Input value={title} onChange={e => setTitle(e.target.value)} className="h-10" /></Field>
                <Field label="Mô tả"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red" /></Field>
                <Field label="Tags"><Input value={tags} onChange={e => setTags(e.target.value)} placeholder="football, 6v6, hanoi" className="h-10" /></Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Số đội tối đa"><Input value={maxSlots} onChange={e => setMaxSlots(e.target.value)} type="number" className="h-10" /></Field>
                    <Field label="Hình thức">
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsOnline(false)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border-2 ${!isOnline ? "border-efb-red bg-red-50 text-efb-red" : "border-gray-200 text-gray-500"}`}>Offline</button>
                            <button type="button" onClick={() => setIsOnline(true)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border-2 ${isOnline ? "border-efb-red bg-red-50 text-efb-red" : "border-gray-200 text-gray-500"}`}>Online</button>
                        </div>
                    </Field>
                </div>
                {!isOnline && <Field label="Địa điểm"><Input value={location} onChange={e => setLocation(e.target.value)} className="h-10" /></Field>}
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded border-gray-300 text-efb-red" />
                    <label htmlFor="isPublic" className="text-xs text-gray-600 font-medium">Công khai giải đấu</label>
                </div>
            </Section>

            {/* Rules */}
            <Section icon={Settings} title="Quy định" color="text-purple-600" bg="bg-purple-50">
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Thời lượng trận (phút)"><Input value={matchDuration} onChange={e => setMatchDuration(e.target.value)} type="number" className="h-10" /></Field>
                    <Field label="Thắng"><Input value={pointsWin} onChange={e => setPointsWin(e.target.value)} type="number" className="h-10" /></Field>
                    <Field label="Hòa"><Input value={pointsDraw} onChange={e => setPointsDraw(e.target.value)} type="number" className="h-10" /></Field>
                </div>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <input type="checkbox" checked={extraTime} onChange={e => setExtraTime(e.target.checked)} className="rounded border-gray-300 text-efb-red" />Hiệp phụ
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <input type="checkbox" checked={penalties} onChange={e => setPenalties(e.target.checked)} className="rounded border-gray-300 text-efb-red" />Penalty
                    </label>
                </div>
                <Field label="Điều lệ giải đấu"><textarea value={rules} onChange={e => setRules(e.target.value)} rows={4} className="w-full rounded border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red" /></Field>
            </Section>

            {/* Prize */}
            <Section icon={Trophy} title="Giải thưởng" color="text-amber-600" bg="bg-amber-50">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Tổng giải thưởng"><Input value={prizeTotal} onChange={e => setPrizeTotal(e.target.value)} className="h-10" /></Field>
                    <Field label="Vô địch"><Input value={prizeFirst} onChange={e => setPrizeFirst(e.target.value)} className="h-10" /></Field>
                    <Field label="Á quân"><Input value={prizeSecond} onChange={e => setPrizeSecond(e.target.value)} className="h-10" /></Field>
                    <Field label="Hạng 3"><Input value={prizeThird} onChange={e => setPrizeThird(e.target.value)} className="h-10" /></Field>
                </div>
            </Section>

            {/* Contact */}
            <Section icon={Phone} title="Liên hệ BTC" color="text-blue-600" bg="bg-blue-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Điện thoại"><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="h-10" /></Field>
                    <Field label="Zalo"><Input value={contactZalo} onChange={e => setContactZalo(e.target.value)} className="h-10" /></Field>
                    <Field label="Facebook"><Input value={contactFacebook} onChange={e => setContactFacebook(e.target.value)} className="h-10" /></Field>
                </div>
            </Section>

            {/* SEO */}
            <Section icon={Search} title="SEO" color="text-emerald-600" bg="bg-emerald-50">
                <Field label="Tiêu đề SEO"><Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title} className="h-10" maxLength={70} /><span className="text-[10px] text-gray-400 float-right">{seoTitle.length}/70</span></Field>
                <Field label="Mô tả SEO"><textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder={description} rows={2} maxLength={160} className="w-full rounded border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-efb-red/20 focus:border-efb-red" /><span className="text-[10px] text-gray-400 float-right">{seoDescription.length}/160</span></Field>
            </Section>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border-2 border-red-200 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
                    <h2 className="text-sm font-bold text-red-600">Vùng nguy hiểm</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">Xóa giải đấu sẽ xóa toàn bộ dữ liệu bao gồm đội, trận đấu, và kết quả. Hành động này không thể hoàn tác.</p>
                <Button variant="outline" onClick={handleDelete} disabled={isDeleting} className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl">
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}Xóa giải đấu
                </Button>
            </div>

            {/* Floating Save Button */}
            <div className="sticky bottom-6 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="h-11 px-6 rounded-xl bg-efb-red text-white hover:bg-red-700 font-medium shadow-lg shadow-red-500/20">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Lưu tất cả thay đổi
                </Button>
            </div>
        </div>
    );
}
