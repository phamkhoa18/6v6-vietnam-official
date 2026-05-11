"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Trophy, Calendar, MapPin, Gamepad2, Settings, Loader2, User as UserIcon, Shield, Camera, X, Mail, Phone, Link as LinkIcon, Globe } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
    const router = useRouter();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Form states
    const [editData, setEditData] = useState({
        name: "",
        nickname: "",
        phone: "",
        dateOfBirth: "",
        province: "",
        jerseyNumber: "",
        facebookLink: "",
        bio: "",
        avatar: "",
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/dang-nhap");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user && isEditModalOpen) {
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
        }
    }, [user, isEditModalOpen]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-efb-red" />
                    <p className="text-gray-500 font-medium">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleUpdateProfile = async () => {
        if (!editData.name.trim()) {
            toast.error("Tên hiển thị không được để trống");
            return;
        }

        setIsUpdating(true);
        try {
            const payload = {
                ...editData,
                jerseyNumber: editData.jerseyNumber ? parseInt(editData.jerseyNumber, 10) : undefined,
            };
            
            const res = await updateProfile(payload);

            if (res.success) {
                toast.success("Cập nhật hồ sơ thành công");
                setIsEditModalOpen(false);
            } else {
                toast.error(res.message || "Cập nhật thất bại");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật hồ sơ");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Banner */}
            <section className="relative pt-24 pb-28 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7A1414] via-[#A01B1B] to-[#0F172A]" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/banner/bg-nen.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)]" />
                </div>
                <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10 text-white">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-efb-gold text-[10px] font-bold uppercase mb-3 backdrop-blur-sm">
                            <UserIcon className="w-3 h-3" />Hồ sơ
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extralight leading-tight mb-2">
                            Trang cá nhân <span className="font-bold text-efb-gold">cầu thủ</span>
                        </h1>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-6 lg:px-8 -mt-16 relative z-20">
                {/* Header Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/40 relative overflow-hidden mb-6 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                        <div className="relative group">
                            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white shadow-lg bg-white ring-2 ring-gray-50 flex-shrink-0">
                                <AvatarImage src={user.avatar || ""} alt={user.name} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-efb-red to-red-700 text-white text-2xl font-bold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        
                        <div className="flex-1 w-full mt-1">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2">
                                {user.name} 
                                {user.nickname && <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">({user.nickname})</span>}
                            </h2>
                            <p className="text-sm text-gray-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                                <Mail className="w-3.5 h-3.5" /> {user.email}
                            </p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[11px] font-semibold">
                                <span className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg flex items-center gap-1.5 shadow-sm">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> ID: {user.playerId || "Chưa cấp"}
                                </span>
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center gap-1.5 shadow-sm">
                                    <Gamepad2 className="w-3.5 h-3.5" /> Cầu thủ 6v6
                                </span>
                                {user.jerseyNumber && (
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg flex items-center gap-1.5 shadow-sm">
                                        <span className="font-black text-emerald-600">#</span> {user.jerseyNumber}
                                    </span>
                                )}
                                {(user.role === "manager" || user.role === "admin") && (
                                    <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg flex items-center gap-1.5 shadow-sm">
                                        <Shield className="w-3.5 h-3.5" /> {user.role.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-shrink-0 w-full md:w-auto">
                            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full md:w-auto bg-gray-900 text-white hover:bg-gray-800 border-none font-semibold rounded-xl px-5 h-10 text-sm shadow-sm transition-all hover:shadow-md">
                                        <Settings className="w-4 h-4 mr-2" /> Chỉnh sửa hồ sơ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl bg-gray-50">
                                    <div className="flex flex-col max-h-[85vh]">
                                        <div className="px-6 py-4 bg-white border-b border-gray-100 shrink-0">
                                            <DialogTitle className="text-lg font-bold text-gray-900">Thông tin cá nhân</DialogTitle>
                                        </div>
                                        
                                        <div className="p-6 overflow-y-auto space-y-6">
                                            {/* Avatar Edit Section */}
                                            <div className="flex items-center gap-5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <Avatar className="w-16 h-16 border border-gray-200 shrink-0">
                                                    <AvatarImage src={editData.avatar} className="object-cover" />
                                                    <AvatarFallback className="bg-gray-100"><Camera className="w-5 h-5 text-gray-400" /></AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1.5">
                                                    <Label className="text-xs font-semibold text-gray-600">URL Ảnh đại diện</Label>
                                                    <Input 
                                                        name="avatar"
                                                        value={editData.avatar} 
                                                        onChange={handleChange} 
                                                        placeholder="https://..."
                                                        className="h-9 rounded-lg text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Basic Info */}
                                            <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Thông tin cơ bản</h4>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-600">Tên hiển thị *</Label>
                                                        <Input name="name" value={editData.name} onChange={handleChange} placeholder="Ví dụ: Nguyễn Văn A" className="h-9 rounded-lg" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-600">Biệt danh (Nickname)</Label>
                                                        <Input name="nickname" value={editData.nickname} onChange={handleChange} placeholder="Biệt danh trên sân..." className="h-9 rounded-lg" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-600">Số áo yêu thích</Label>
                                                        <Input name="jerseyNumber" type="number" value={editData.jerseyNumber} onChange={handleChange} placeholder="VD: 10" className="h-9 rounded-lg" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-600">Ngày sinh</Label>
                                                        <Input name="dateOfBirth" type="date" value={editData.dateOfBirth} onChange={handleChange} className="h-9 rounded-lg" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Thông tin liên hệ</h4>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-600">Số điện thoại</Label>
                                                        <Input name="phone" value={editData.phone} onChange={handleChange} placeholder="0987..." className="h-9 rounded-lg" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-600">Khu vực sinh sống</Label>
                                                        <Input name="province" value={editData.province} onChange={handleChange} placeholder="Ví dụ: Hà Nội" className="h-9 rounded-lg" />
                                                    </div>
                                                    <div className="space-y-1.5 sm:col-span-2">
                                                        <Label className="text-xs font-semibold text-gray-600">Link Facebook cá nhân</Label>
                                                        <Input name="facebookLink" value={editData.facebookLink} onChange={handleChange} placeholder="https://facebook.com/..." className="h-9 rounded-lg" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bio */}
                                            <div className="space-y-1.5 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <Label className="text-xs font-semibold text-gray-600">Tiểu sử / Lời giới thiệu</Label>
                                                <Textarea 
                                                    name="bio"
                                                    value={editData.bio} 
                                                    onChange={handleChange} 
                                                    placeholder="Viết một chút về phong cách đá của bạn..."
                                                    className="resize-none h-20 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="h-9 rounded-lg px-5">
                                                Hủy
                                            </Button>
                                            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="h-9 bg-efb-red hover:bg-efb-red-light text-white rounded-lg font-semibold px-6 shadow-sm shadow-red-500/20">
                                                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar Stats */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                        {user.bio && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><UserIcon className="w-3.5 h-3.5" /></span>
                                    Giới thiệu
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center"><Gamepad2 className="w-3.5 h-3.5" /></span>
                                Thống kê thi đấu
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                    <span className="text-xs text-gray-600 font-medium">Giải tham gia</span>
                                    <span className="text-base font-bold text-gray-900">{user.stats?.tournamentsJoined || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                    <span className="text-xs text-emerald-700 font-medium">Trận thắng</span>
                                    <span className="text-base font-bold text-emerald-700">{user.stats?.wins || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                                    <span className="text-xs text-blue-700 font-medium">Bàn thắng</span>
                                    <span className="text-base font-bold text-blue-700">{user.stats?.goalsScored || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><LinkIcon className="w-3.5 h-3.5" /></span>
                                Liên kết
                            </h3>
                            <div className="space-y-3">
                                {user.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500"><Phone className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium text-gray-900">{user.phone}</span>
                                    </div>
                                )}
                                {user.facebookLink ? (
                                    <a href={user.facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Globe className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium text-blue-600 group-hover:underline">Facebook cá nhân</span>
                                    </a>
                                ) : (
                                    <div className="text-xs text-gray-400 italic">Chưa liên kết Facebook</div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Feed */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center h-full flex flex-col items-center justify-center min-h-[350px]">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-7 h-7 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có hoạt động</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                                Bạn chưa tham gia giải đấu nào trên hệ thống 6v6 Vietnam. Hãy tìm kiếm giải đấu phù hợp và đăng ký tham gia ngay nhé!
                            </p>
                            <Button className="bg-gradient-to-r from-efb-red to-red-700 text-white shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all font-semibold rounded-xl px-6 h-11 text-sm" onClick={() => router.push("/giai-dau")}>
                                Tham gia giải đấu đầu tiên
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
