"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardList, Settings, Play, Trophy, ArrowRight } from "lucide-react";

const steps = [
    {
        step: "01",
        icon: ClipboardList,
        title: "Tạo giải đấu",
        description: "Đặt tên giải, chọn thể thức 6v6, thiết lập thể lệ và thời gian diễn ra.",
        gradient: "from-red-400 to-rose-500",
        bgLight: "bg-red-50",
    },
    {
        step: "02",
        icon: Settings,
        title: "Cấu hình & mời",
        description: "Thiết lập nhánh đấu, chia bảng. Chia sẻ link mời đội bóng đăng ký.",
        gradient: "from-amber-400 to-orange-500",
        bgLight: "bg-amber-50",
    },
    {
        step: "03",
        icon: Play,
        title: "Bắt đầu thi đấu",
        description: "Cập nhật kết quả từng trận. Hệ thống tự động tính bảng xếp hạng.",
        gradient: "from-emerald-400 to-teal-500",
        bgLight: "bg-emerald-50",
    },
    {
        step: "04",
        icon: Trophy,
        title: "Trao giải",
        description: "Xem kết quả chung cuộc, chia sẻ thành tích và lưu lịch sử giải đấu.",
        gradient: "from-violet-400 to-purple-500",
        bgLight: "bg-violet-50",
    },
];

export function HowItWorksSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section ref={ref} className="py-20 lg:py-28 bg-white relative overflow-hidden">
            {/* Subtle decorations */}
            <div className="absolute top-20 right-[5%] w-64 h-64 bg-red-50/60 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 left-[5%] w-48 h-48 bg-amber-50/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-100 text-efb-red text-xs font-semibold tracking-wider uppercase mb-5">
                        <Settings className="w-3 h-3" />
                        Cách thức
                    </span>
                    <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extralight text-efb-dark leading-tight tracking-tight">
                        Tổ chức giải đấu
                        <br />
                        <span className="text-gradient font-medium">chỉ 4 bước</span>
                    </h2>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 28 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="relative group"
                        >
                            {i < steps.length - 1 && (
                                <div className="hidden lg:flex absolute -right-3 top-12 z-20 text-gray-300">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            )}

                            <div className="bg-white rounded-2xl p-6 h-full border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/60 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                        <step.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className={`text-[11px] font-bold tracking-widest uppercase ${step.bgLight} px-2.5 py-1 rounded-md text-efb-text-secondary`}>
                                        Bước {step.step}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-efb-dark mb-2 group-hover:text-efb-red transition-colors duration-200">
                                    {step.title}
                                </h3>
                                <p className="text-[14px] text-efb-text-secondary leading-relaxed font-light">
                                    {step.description}
                                </p>

                                <div className="mt-5 h-1 rounded-full bg-gray-100 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={isInView ? { width: "100%" } : {}}
                                        transition={{ duration: 0.8, delay: 0.6 + i * 0.2 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${step.gradient}`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
