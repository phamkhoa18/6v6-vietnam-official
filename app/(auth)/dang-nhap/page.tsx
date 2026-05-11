"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DangNhapPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${localStorage.getItem("6v6_token")}` } });
                const data = await res.json();
                router.push(data.success && data.data.role === "manager" ? "/manager" : "/giai-dau");
            } else if (result.requiresVerification) {
                router.push(`/xac-minh?email=${encodeURIComponent(result.email || email)}`);
            } else { setError(result.message); }
        } catch { setError("Có lỗi xảy ra, vui lòng thử lại"); }
        finally { setIsSubmitting(false); }
    };

    const inputCls = "pl-10 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-efb-red focus:ring-efb-red/20 transition-all text-sm";

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
                    <Link href="/" className="inline-block mb-10">
                        <Image src="/images/logo/logo_6v6_remove_bg.png" alt="6v6 Vietnam" width={160} height={48} className="h-12 w-auto object-contain" />
                    </Link>
                    <h1 className="text-[28px] sm:text-[32px] font-extralight text-efb-dark leading-tight tracking-tight mb-2">
                        Chào mừng <span className="font-medium bg-gradient-to-r from-efb-red to-efb-red-light bg-clip-text text-transparent">trở lại</span>
                    </h1>
                    <p className="text-efb-text-secondary text-[15px] font-light mb-8">Đăng nhập để quản lý giải đấu và theo dõi thành tích</p>

                    {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</motion.div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-efb-dark">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-efb-text-muted" />
                                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-efb-dark">Mật khẩu</Label>
                                <Link href="/quen-mat-khau" className="text-xs text-efb-red hover:text-efb-red-light font-medium transition-colors">Quên mật khẩu?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-efb-text-muted" />
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-efb-red focus:ring-efb-red/20 transition-all text-sm" required disabled={isSubmitting} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-efb-text-muted hover:text-efb-text-secondary transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Checkbox id="remember" className="border-gray-300 data-[state=checked]:bg-efb-red data-[state=checked]:border-efb-red" />
                            <Label htmlFor="remember" className="text-sm text-efb-text-secondary font-normal cursor-pointer">Ghi nhớ đăng nhập</Label>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-efb-red text-white hover:bg-efb-red-light font-semibold rounded-xl shadow-sm hover:shadow-md transition-all group">
                            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang đăng nhập...</> : <>Đăng nhập<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" /></>}
                        </Button>
                    </form>
                    <p className="text-center mt-8 text-sm text-efb-text-secondary">Chưa có tài khoản?{" "}<Link href="/dang-ky" className="text-efb-red hover:text-efb-red-light font-semibold transition-colors">Đăng ký ngay</Link></p>
                </motion.div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-[#7A1414] via-[#A01B1B] to-[#0F172A] items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/banner/bg-nen.png')", backgroundSize: "cover" }} />
                <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-yellow-300/[0.08] rounded-full blur-3xl" /><div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full blur-3xl" /></div>
                <div className="relative z-10 text-center max-w-md">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        <div className="w-20 h-20 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] flex items-center justify-center mx-auto mb-8"><Trophy className="w-10 h-10 text-efb-gold" /></div>
                        <h2 className="text-[28px] font-extralight text-white leading-tight mb-4">Tạo & quản lý giải đấu<br /><span className="text-efb-gold font-medium">dễ dàng hơn bao giờ hết</span></h2>
                        <p className="text-white/50 text-[15px] font-light">Nền tảng quản lý bóng đá sân 6 hàng đầu Việt Nam</p>
                        <div className="flex items-center justify-center gap-6 mt-8">
                            <div className="text-center"><div className="text-2xl font-light text-white">100+</div><div className="text-[11px] text-white/40 font-medium">Giải đấu</div></div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center"><div className="text-2xl font-light text-white">1K+</div><div className="text-[11px] text-white/40 font-medium">Cầu thủ</div></div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center"><div className="text-2xl font-light text-white">4.9</div><div className="text-[11px] text-white/40 font-medium">Đánh giá</div></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
