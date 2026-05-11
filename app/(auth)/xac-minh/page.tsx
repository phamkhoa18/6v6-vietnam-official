"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [code, setCode] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [success, setSuccess] = useState(false);
    const { verifyEmail, resendCode } = useAuth();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => { if (!email) router.push("/dang-ky"); }, [email, router]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 3) inputRefs.current[index + 1]?.focus();
        if (newCode.every((d) => d !== "")) handleSubmit(newCode.join(""));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        if (pasted.length === 4) {
            setCode(pasted.split(""));
            inputRefs.current[3]?.focus();
            handleSubmit(pasted);
        }
    };

    const handleSubmit = async (codeStr?: string) => {
        const fullCode = codeStr || code.join("");
        if (fullCode.length !== 4) { setError("Vui lòng nhập đủ 4 số"); return; }
        setError("");
        setIsSubmitting(true);
        try {
            const result = await verifyEmail(email, fullCode);
            if (result.success) { setSuccess(true); setTimeout(() => router.push("/giai-dau"), 2000); }
            else { setError(result.message); setCode(["", "", "", ""]); inputRefs.current[0]?.focus(); }
        } catch { setError("Có lỗi xảy ra"); }
        finally { setIsSubmitting(false); }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setIsResending(true);
        setError("");
        try {
            const result = await resendCode(email);
            if (result.success) { setResendCooldown(60); setCode(["", "", "", ""]); inputRefs.current[0]?.focus(); }
            else setError(result.message);
        } catch { setError("Không gửi được mã"); }
        finally { setIsResending(false); }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-white rounded-2xl p-10 shadow-lg max-w-sm mx-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-emerald-600" /></div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Xác minh thành công!</h2>
                    <p className="text-sm text-gray-500 mb-4">Đang chuyển hướng...</p>
                    <Loader2 className="w-5 h-5 animate-spin text-efb-red mx-auto" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-efb-red/10 flex items-center justify-center mx-auto mb-5"><ShieldCheck className="w-8 h-8 text-efb-red" /></div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Xác minh email</h1>
                    <p className="text-sm text-gray-500">Nhập mã 4 số đã gửi đến<br /><span className="font-medium text-gray-700">{email}</span></p>
                </div>

                {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">{error}</motion.div>}

                <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                    {code.map((digit, i) => (
                        <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                            onChange={(e) => handleCodeChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                            className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-efb-red focus:ring-2 focus:ring-efb-red/20 outline-none transition-all" disabled={isSubmitting} />
                    ))}
                </div>

                <Button onClick={() => handleSubmit()} disabled={isSubmitting || code.some((d) => !d)} className="w-full h-12 bg-efb-red text-white hover:bg-efb-red-light font-semibold rounded-xl shadow-sm hover:shadow-md transition-all group mb-4">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xác minh...</> : <>Xác minh<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" /></>}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Chưa nhận được mã?</p>
                    <button onClick={handleResend} disabled={isResending || resendCooldown > 0} className="text-sm text-efb-red hover:text-efb-red-light font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto">
                        {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                        {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại mã"}
                    </button>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <Link href="/dang-ky" className="text-xs text-gray-400 hover:text-efb-red transition-colors">← Quay lại đăng ký</Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function XacMinhPage() {
    return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>}><VerifyContent /></Suspense>;
}
