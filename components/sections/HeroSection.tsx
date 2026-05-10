"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative min-h-[92vh] flex items-center overflow-hidden">
            {/* Background — bright, warm gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626] via-[#E53E3E] to-[#C53030]" />

            {/* Warm light overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-orange-300/[0.08]" />

            {/* Decorative mesh — soft & warm */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-32 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/25 via-orange-300/15 to-transparent rounded-full blur-[80px]"
                />
                <motion.div
                    animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.15, 0.08] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-gradient-to-tr from-rose-300/20 via-pink-300/10 to-transparent rounded-full blur-[60px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.12, 0.05] }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-yellow-200/15 via-orange-300/10 to-transparent rounded-full blur-[80px]"
                />
            </div>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            {/* Content */}
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-8 pt-28 pb-20 w-full">
                <div className="max-w-2xl">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.12] border border-white/[0.15] backdrop-blur-sm mb-7"
                    >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span className="text-[11px] font-medium text-white/95 tracking-wider uppercase">
                            Giải đấu 6v6 #1 Việt Nam
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="text-[42px] sm:text-[56px] md:text-[64px] lg:text-[76px] font-extralight leading-[1.05] tracking-tight text-white mb-6"
                    >
                        Sân chơi
                        <br />
                        <span className="font-bold text-white">eFootball 6v6</span>
                        <br />
                        chuyên nghiệp<span className="text-amber-300 font-light">.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-[16px] sm:text-[18px] text-white/70 font-light leading-relaxed max-w-lg mb-10"
                    >
                        Tổ chức giải đấu 6v6 chỉ trong vài phút. Quản lý đội hình,
                        theo dõi kết quả trực tiếp và kết nối cộng đồng game thủ.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.45 }}
                        className="flex flex-col sm:flex-row items-start gap-3.5"
                    >
                        <Button
                            size="lg"
                            className="bg-white text-efb-red hover:bg-white/95 font-semibold text-sm h-12 px-7 rounded-xl shadow-lg shadow-black/10 transition-all duration-300 group"
                            asChild
                        >
                            <Link href="/giai-dau">
                                <Trophy className="w-4 h-4 mr-2" />
                                Xem giải đấu
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            className="bg-white/[0.1] border border-white/[0.2] text-white hover:bg-white/[0.18] font-medium text-sm h-12 px-7 rounded-xl backdrop-blur-sm transition-all duration-300"
                            asChild
                        >
                            <Link href="/huong-dan">
                                Tìm hiểu thêm
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Bottom curve to white */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 80" fill="none" className="w-full block">
                    <path d="M0 80H1440V20C1440 20 1200 80 720 80C240 80 0 20 0 20V80Z" fill="white" />
                </svg>
            </div>
        </section>
    );
}
