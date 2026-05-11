"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Zap,
    GitBranch,
    BarChart3,
    Users2,
    Wallet,
    Smartphone,
} from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Tạo giải đấu nhanh chóng",
        description: "Thiết lập giải đấu bóng đá sân 6 chỉ trong vài bước đơn giản với giao diện trực quan.",
        gradient: "from-[#D4871A] to-[#E6A030]",
        iconBg: "bg-amber-50",
    },
    {
        icon: GitBranch,
        title: "Sơ đồ thi đấu thông minh",
        description: "Tự động tạo nhánh đấu loại trực tiếp, vòng tròn, chia bảng linh hoạt.",
        gradient: "from-[#A01B1B] to-[#C42B2B]",
        iconBg: "bg-red-50",
    },
    {
        icon: BarChart3,
        title: "Theo dõi kết quả trực tiếp",
        description: "Cập nhật kết quả real-time. Tự động tính bảng xếp hạng chi tiết.",
        gradient: "from-emerald-400 to-teal-500",
        iconBg: "bg-emerald-50",
    },
    {
        icon: Users2,
        title: "Quản lý đội & cầu thủ",
        description: "Đăng ký cầu thủ, quản lý đội hình 6 người, phân quyền ban tổ chức.",
        gradient: "from-violet-400 to-purple-500",
        iconBg: "bg-violet-50",
    },
    {
        icon: Wallet,
        title: "Quản lý tài chính",
        description: "Theo dõi lệ phí, giải thưởng, tài trợ minh bạch, chuyên nghiệp.",
        gradient: "from-[#A01B1B] to-[#D4871A]",
        iconBg: "bg-rose-50",
    },
    {
        icon: Smartphone,
        title: "Tối ưu mọi thiết bị",
        description: "Trải nghiệm mượt mà trên mobile và desktop, mọi lúc mọi nơi.",
        gradient: "from-sky-400 to-blue-500",
        iconBg: "bg-sky-50",
    },
];

export function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section ref={ref} className="py-20 lg:py-28 relative overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src="/images/banner/bg-nen.png"
                    alt=""
                    className="w-full h-full object-cover blur-sm scale-105"
                />
                {/* Light overlay for readability */}
                <div className="absolute inset-0 bg-white/85" />
            </div>

            {/* Content */}
            <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A01B1B]/[0.06] border border-[#A01B1B]/[0.1] text-efb-red text-xs font-semibold tracking-wider uppercase mb-5">
                        <Zap className="w-3 h-3" />
                        Tính năng
                    </span>
                    <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extralight text-efb-dark leading-tight mb-4 tracking-tight">
                        Mọi thứ bạn cần cho
                        <br />
                        <span className="text-gradient font-medium">giải đấu 6v6 hoàn hảo</span>
                    </h2>
                    <p className="text-efb-text-secondary text-[17px] max-w-xl mx-auto font-light">
                        Từ khởi tạo đến quản lý kết quả — công cụ chuyên nghiệp cho giải đấu
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 24 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-7 h-full border border-white/60 shadow-lg shadow-black/5 hover:bg-white/95 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 group">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                    <feature.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-[17px] font-semibold text-efb-dark mb-2 group-hover:text-efb-red transition-colors duration-200">
                                    {feature.title}
                                </h3>
                                <p className="text-[14px] text-efb-text-secondary leading-relaxed font-light">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
