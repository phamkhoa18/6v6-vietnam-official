"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
    Trophy, Calendar, MapPin, Gamepad2, Settings, Loader2, User as UserIcon,
    Shield, Camera, X, Mail, Phone, Globe, Hash, Shirt, Award, Target,
    Swords, ChevronRight, ExternalLink, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState("");

    const [editData, setEditData] = useState({
        name: "", nickname: "", phone: "", dateOfBirth: "",
        province: "", jerseyNumber: "", facebookLink: "", bio: "", avatar: "",
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push("/dang-nhap");
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user && isEditing) {
            setEditData({
                name: user.name || "",
                nickname: user.nickname || "",
                phone: user.phone || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                province: user.province || "",
                jerseyNumber: user.jerseyNumber ? String(user.jerseyNumber) : "",
                facebookLink: user.facebookLink || "",
                bio: user.bio || "",
                avatar: user.avatar || "",
            });
            setAvatarPreview(user.avatar || "");
        }
    }, [user, isEditing]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#A01B1B]" />
            </div>
        );
    }
    if (!user) return null;

    const initials = user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setUploadingAvatar(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("type", "avatar");
            const token = localStorage.getItem("6v6_token");
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: fd,
            });
            const d = await res.json();
            if (d.success && d.data?.url) {
                setEditData(prev => ({ ...prev, avatar: d.data.url }));
                toast.success("Tải ảnh thành công!");
            } else {
                toast.error(d.message || "Upload thất bại");
            }
        } catch {
            toast.error("Lỗi khi tải ảnh lên");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!editData.name.trim()) { toast.error("Tên không được để trống"); return; }
        setIsUpdating(true);
        try {
            const payload = { ...editData, jerseyNumber: editData.jerseyNumber ? parseInt(editData.jerseyNumber, 10) : undefined };
            const res = await updateProfile(payload);
            if (res.success) { toast.success("Cập nhật thành công!"); setIsEditing(false); }
            else toast.error(res.message || "Cập nhật thất bại");
        } catch { toast.error("Có lỗi xảy ra"); }
        finally { setIsUpdating(false); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const statsItems = [
        { label: "Giải tham gia", value: user.stats?.tournamentsJoined || 0, icon: Trophy, bg: "bg-amber-50", color: "text-amber-600" },
        { label: "Trận thắng", value: user.stats?.wins || 0, icon: Target, bg: "bg-emerald-50", color: "text-emerald-600" },
        { label: "Trận thua", value: user.stats?.losses || 0, icon: Swords, bg: "bg-red-50", color: "text-red-500" },
        { label: "Bàn thắng", value: user.stats?.goalsScored || 0, icon: TrendingUp, bg: "bg-blue-50", color: "text-blue-600" },
    ];

    const infoRows = [
        { label: "Player ID", value: `#${user.playerId || "—"}`, icon: Hash },
        { label: "Biệt danh", value: user.nickname, icon: Gamepad2 },
        { label: "Số áo", value: user.jerseyNumber ? `#${user.jerseyNumber}` : null, icon: Shirt },
        { label: "Ngày sinh", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : null, icon: Calendar },
        { label: "Khu vực", value: user.province, icon: MapPin },
        { label: "SĐT", value: user.phone, icon: Phone },
        { label: "Email", value: user.email, icon: Mail },
    ].filter(r => r.value);

    // ─── EDIT MODE ───
    if (isEditing) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                {/* Header */}
                <div className="relative pt-16">
                    <div className="h-36 bg-[#7A1414] relative">
                        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('/images/banner/bg-nen.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />
                    </div>
                </div>

                <div className="max-w-[700px] mx-auto px-4 sm:px-6 pb-16 relative z-10" style={{ marginTop: "-50px" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                        {/* Title bar */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa hồ sơ</h2>
                            <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Avatar upload */}
                            <div className="flex items-center gap-5">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#A01B1B] to-[#7A1414] flex items-center justify-center overflow-hidden ring-2 ring-gray-100">
                                        {(avatarPreview || editData.avatar) ? (
                                            <img src={avatarPreview || editData.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-2xl font-bold">{initials}</span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Ảnh đại diện</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Bấm vào ảnh để thay đổi</p>
                                    {uploadingAvatar && <p className="text-xs text-amber-600 mt-1 animate-pulse">Đang tải lên...</p>}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4 p-5 bg-gray-50/80 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thông tin cơ bản</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { name: "name", label: "Họ và tên *", placeholder: "Nguyễn Văn A" },
                                        { name: "nickname", label: "Biệt danh", placeholder: "Nickname trên sân" },
                                        { name: "jerseyNumber", label: "Số áo", placeholder: "VD: 10", type: "number" },
                                        { name: "dateOfBirth", label: "Ngày sinh", type: "date" },
                                    ].map(f => (
                                        <div key={f.name} className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-600">{f.label}</label>
                                            <input
                                                name={f.name} type={f.type || "text"}
                                                value={(editData as any)[f.name]} onChange={handleChange}
                                                placeholder={f.placeholder}
                                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-4 p-5 bg-gray-50/80 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Liên hệ</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { name: "phone", label: "Số điện thoại", placeholder: "0987..." },
                                        { name: "province", label: "Khu vực", placeholder: "TP.HCM" },
                                    ].map(f => (
                                        <div key={f.name} className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-600">{f.label}</label>
                                            <input
                                                name={f.name} value={(editData as any)[f.name]} onChange={handleChange}
                                                placeholder={f.placeholder}
                                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                                            />
                                        </div>
                                    ))}
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-gray-600">Link Facebook</label>
                                        <input
                                            name="facebookLink" value={editData.facebookLink} onChange={handleChange}
                                            placeholder="https://facebook.com/..."
                                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-1.5 p-5 bg-gray-50/80 rounded-xl border border-gray-100">
                                <label className="text-xs font-semibold text-gray-600">Tiểu sử</label>
                                <textarea
                                    name="bio" value={editData.bio} onChange={handleChange}
                                    placeholder="Phong cách đá bóng của bạn..."
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white resize-none h-24"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-5 h-10 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Hủy</button>
                            <button onClick={handleSave} disabled={isUpdating || uploadingAvatar}
                                className="px-6 h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#A01B1B] to-red-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ─── VIEW MODE ───
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Banner */}
            <div className="relative pt-16">
                <div className="h-56 sm:h-72 relative">
                    <div className="absolute inset-0 bg-[#7A1414]" />
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('/images/banner/bg-nen.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#7A1414]/40 via-[#4a0d0d]/70 to-gray-50" />
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-amber-400/[0.08] rounded-full blur-3xl" />
                    </div>
                </div>
            </div>

            <div className="max-w-[900px] mx-auto px-4 sm:px-6 pb-16 relative z-10" style={{ marginTop: "-100px" }}>
                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    <div className="px-6 sm:px-8 pt-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0 self-center sm:self-start">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl ring-2 ring-gray-100 bg-gradient-to-br from-[#A01B1B] to-[#7A1414] flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-3xl sm:text-4xl font-bold">{initials}</span>
                                    )}
                                </div>
                            </div>

                            {/* Name + Badges */}
                            <div className="flex-1 min-w-0 text-center sm:text-left pb-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
                                {user.nickname && <p className="text-base text-gray-500 font-medium mt-0.5">&quot;{user.nickname}&quot;</p>}
                                <div className="flex items-center gap-2 mt-3 flex-wrap justify-center sm:justify-start">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg">
                                        <Hash className="w-3 h-3 text-red-500" />ID: {user.playerId || "—"}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                                        <Gamepad2 className="w-3 h-3" />Cầu thủ
                                    </span>
                                    {user.jerseyNumber && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                                            <Shirt className="w-3 h-3" />#{user.jerseyNumber}
                                        </span>
                                    )}
                                    {(user.role === "manager" || user.role === "admin") && (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#A01B1B] bg-red-50 px-2.5 py-1.5 rounded-lg">
                                            <Shield className="w-3 h-3" />{user.role.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Edit button */}
                                <button onClick={() => setIsEditing(true)}
                                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all shadow-sm hover:shadow-md">
                                    <Settings className="w-4 h-4" />Chỉnh sửa hồ sơ
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <>
                            <div className="h-px bg-gray-100" />
                            <div className="px-6 sm:px-8 py-5">
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                            </div>
                        </>
                    )}

                    <div className="h-px bg-gray-100" />

                    {/* Stats */}
                    <div className="px-6 sm:px-8 py-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Thống kê</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {statsItems.map(s => (
                                <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center border border-gray-100/50 hover:shadow-md transition-all`}>
                                    <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mx-auto mb-2`}>
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />Thông tin chi tiết
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {infoRows.map(item => (
                                <div key={item.label} className="flex items-center gap-3 py-3 px-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/70 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                                        <item.icon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{item.label}</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Facebook */}
                        {user.facebookLink && (
                            <a href={user.facebookLink} target="_blank" rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-3 py-3 px-4 bg-blue-50/80 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Globe className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">Facebook</p>
                                    <p className="text-sm font-medium text-blue-700 truncate">{user.facebookLink}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            </a>
                        )}
                    </div>

                    <div className="px-6 sm:px-8 pb-6">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            Tham gia từ {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="mt-4 bg-gradient-to-r from-[#7A1414] to-[#A01B1B] rounded-2xl p-6 text-center text-white shadow-lg">
                    <Trophy className="w-8 h-8 mx-auto mb-3 text-amber-300" />
                    <h3 className="text-lg font-bold mb-1">Sẵn sàng thi đấu?</h3>
                    <p className="text-sm text-white/70 mb-4">Tìm kiếm giải đấu phù hợp và tham gia ngay!</p>
                    <button onClick={() => router.push("/giai-dau")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#7A1414] rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-md">
                        Xem giải đấu <ChevronRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
