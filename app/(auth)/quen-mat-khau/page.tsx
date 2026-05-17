"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ArrowLeft, Loader2, KeyRound, ShieldCheck, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";

type Step = "email" | "code" | "success";

export default function QuenMatKhauPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const router = useRouter();
    const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email.trim()) return setError("Vui lòng nhập email");
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, step: "request" }) });
            const data = await res.json();
            if (data.success) { setStep("code"); setCountdown(60); } else setError(data.message);
        } catch { setError("Có lỗi xảy ra"); }
        finally { setIsSubmitting(false); }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, step: "request" }) });
            const data = await res.json();
            if (data.success) setCountdown(60);
        } catch { /* silent */ }
        finally { setIsSubmitting(false); }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code]; newCode[index] = value.slice(-1); setCode(newCode);
        if (value && index < 5) codeRefs.current[index + 1]?.focus();
    };
    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !code[index] && index > 0) codeRefs.current[index - 1]?.focus(); };
    const handleCodePaste = (e: React.ClipboardEvent) => {
        e.preventDefault(); const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newCode = [...code]; for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i];
        setCode(newCode); codeRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault(); setError("");
        const fullCode = code.join("");
        if (fullCode.length !== 6) return setError("Vui lòng nhập đủ 6 số");
        if (!newPassword) return setError("Vui lòng nhập mật khẩu mới");
        if (newPassword.length < 8) return setError("Mật khẩu phải có ít nhất 8 ký tự");
        if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp");
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, step: "reset", code: fullCode, newPassword }) });
            const data = await res.json();
            if (data.success) setStep("success"); else setError(data.message);
        } catch { setError("Có lỗi xảy ra"); }
        finally { setIsSubmitting(false); }
    };

    const inputCls = "pl-10 h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-efb-red focus:ring-efb-red/20 transition-all text-sm";

    return (
        <div className="min-h-screen flex">
            {/* Left — Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
                    <Link href="/" className="inline-block mb-10">
                        <Image src="/images/logo/logo_6v6_remove_bg.png" alt="6v6 Vietnam" width={160} height={48} className="h-12 w-auto object-contain" />
                    </Link>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Email */}
                        {step === "email" && (
                            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                                    <KeyRound className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-[28px] font-extralight text-efb-dark leading-tight tracking-tight mb-2">
                                    Quên <span className="font-medium bg-gradient-to-r from-efb-red to-efb-red-light bg-clip-text text-transparent">mật khẩu?</span>
                                </h1>
                                <p className="text-efb-text-secondary text-[15px] font-light mb-8">Nhập email đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu</p>

                                {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</motion.div>}

                                <form onSubmit={handleRequestCode} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-efb-dark">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-efb-text-muted" />
                                            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required disabled={isSubmitting} autoFocus />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-efb-red text-white hover:bg-efb-red-light font-semibold rounded-xl shadow-sm hover:shadow-md transition-all group">
                                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang gửi...</> : <>Gửi mã xác nhận<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" /></>}
                                    </Button>
                                </form>
                                <p className="text-center mt-8 text-sm text-efb-text-secondary">
                                    <Link href="/dang-nhap" className="text-efb-red hover:text-efb-red-light font-semibold transition-colors inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập</Link>
                                </p>
                            </motion.div>
                        )}

                        {/* Step 2: Code + New Password */}
                        {step === "code" && (
                            <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-[28px] font-extralight text-efb-dark leading-tight tracking-tight mb-2">
                                    Xác nhận <span className="font-medium bg-gradient-to-r from-efb-red to-efb-red-light bg-clip-text text-transparent">mã OTP</span>
                                </h1>
                                <p className="text-efb-text-secondary text-[15px] font-light mb-2">Nhập mã 6 số đã gửi đến</p>
                                <p className="text-sm font-bold text-efb-dark mb-8">{email}</p>

                                {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</motion.div>}

                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    <div>
                                        <Label className="text-sm font-medium text-efb-dark mb-3 block">Mã xác nhận</Label>
                                        <div className="flex gap-2 justify-between" onPaste={handleCodePaste}>
                                            {code.map((digit, i) => (
                                                <input key={i} ref={el => { codeRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                                                    onChange={(e) => handleCodeChange(i, e.target.value)} onKeyDown={(e) => handleCodeKeyDown(i, e)}
                                                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none ${digit ? "border-efb-red bg-red-50/50 text-efb-red" : "border-gray-200 bg-gray-50/50 text-efb-dark"} focus:border-efb-red focus:ring-2 focus:ring-efb-red/20`}
                                                    disabled={isSubmitting} />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-400">Mã có hiệu lực trong 15 phút</span>
                                            <button type="button" onClick={handleResend} disabled={countdown > 0 || isSubmitting} className={`text-xs font-semibold transition-colors ${countdown > 0 ? "text-gray-400" : "text-efb-red hover:text-efb-red-light"}`}>
                                                {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi lại mã"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-efb-dark">Mật khẩu mới</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-efb-text-muted" />
                                            <Input type={showPassword ? "text" : "password"} placeholder="Tối thiểu 8 ký tự" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 pr-10 h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-efb-red focus:ring-efb-red/20 transition-all text-sm" required disabled={isSubmitting} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-efb-text-muted hover:text-efb-text-secondary transition-colors">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {newPassword && (
                                            <div className="flex gap-1 mt-1">
                                                {[newPassword.length >= 8, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].map((met, i) => (
                                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${met ? "bg-emerald-400" : "bg-gray-200"}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-efb-dark">Xác nhận mật khẩu</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-efb-text-muted" />
                                            <Input type={showPassword ? "text" : "password"} placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-efb-red focus:ring-efb-red/20 transition-all text-sm" required disabled={isSubmitting} />
                                            {confirmPassword && newPassword === confirmPassword && <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-efb-red text-white hover:bg-efb-red-light font-semibold rounded-xl shadow-sm hover:shadow-md transition-all group">
                                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xử lý...</> : <>Đặt lại mật khẩu<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" /></>}
                                    </Button>
                                </form>
                                <p className="text-center mt-6 text-sm">
                                    <button onClick={() => { setStep("email"); setError(""); setCode(["", "", "", "", "", ""]); }} className="text-efb-red hover:text-efb-red-light font-semibold transition-colors inline-flex items-center gap-1">
                                        <ArrowLeft className="w-3.5 h-3.5" /> Đổi email khác
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* Step 3: Success */}
                        {step === "success" && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-[28px] font-extralight text-efb-dark leading-tight tracking-tight mb-3">
                                    Đặt lại mật khẩu <span className="font-medium bg-gradient-to-r from-efb-red to-efb-red-light bg-clip-text text-transparent">thành công!</span>
                                </h1>
                                <p className="text-efb-text-secondary text-[15px] font-light mb-8">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ</p>
                                <Button onClick={() => router.push("/dang-nhap")} className="w-full h-12 bg-efb-red text-white hover:bg-efb-red-light font-semibold rounded-xl shadow-sm hover:shadow-md transition-all group">
                                    Đăng nhập ngay<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-[#7A1414] via-[#A01B1B] to-[#0F172A] items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/banner/bg-nen.png')", backgroundSize: "cover" }} />
                <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-yellow-300/[0.08] rounded-full blur-3xl" /><div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full blur-3xl" /></div>
                <div className="relative z-10 text-center max-w-md">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        <div className="w-20 h-20 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] flex items-center justify-center mx-auto mb-8"><KeyRound className="w-10 h-10 text-efb-gold" /></div>
                        <h2 className="text-[28px] font-extralight text-white leading-tight mb-4">Bảo mật tài khoản<br /><span className="text-efb-gold font-medium">là ưu tiên hàng đầu</span></h2>
                        <p className="text-white/50 text-[15px] font-light">Đặt lại mật khẩu nhanh chóng và an toàn chỉ với vài bước đơn giản.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
