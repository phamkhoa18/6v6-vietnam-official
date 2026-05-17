"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Star } from "lucide-react";

export function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-20 lg:py-28 bg-white">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Rich crimson base */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#A01B1B] via-[#8B1818] to-[#5C1010]" />
                        {/* Gold accent sweep */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4871A]/[0.06] to-[#D4871A]/[0.12]" />
                        {/* Depth */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.05] via-transparent to-black/[0.1]" />

                        {/* Decorative mesh */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-24 -right-24 w-[350px] h-[350px] bg-gradient-to-br from-[#D4871A]/20 via-[#E6A030]/10 to-transparent rounded-full blur-[60px]" />
                            <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] bg-gradient-to-tr from-[#A01B1B]/20 via-[#D4871A]/8 to-transparent rounded-full blur-[60px]" />
                        </div>

                        {/* Diagonal gold lines */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-0 right-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-[#D4871A]/12 to-transparent transform rotate-12 origin-top" />
                        </div>

                        {/* Dot pattern */}
                        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        <div className="relative px-8 py-16 sm:px-16 sm:py-20 lg:px-24 lg:py-24 text-center z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4871A]/[0.12] border border-[#D4871A]/[0.2] backdrop-blur-sm mb-8">
                                <Star className="w-4 h-4 text-[#E6A030]" />
                                <span className="text-xs font-medium text-[#F5D5A0] tracking-wider uppercase">Bắt đầu miễn phí</span>
                            </div>
                            <h2 className="text-[32px] sm:text-[40px] lg:text-[56px] font-extralight text-white leading-tight mb-6 tracking-tight">
                                Sẵn sàng tạo giải đấu
                                <br />
                                <span className="font-bold">6v6 của riêng bạn?</span>
                            </h2>
                            <p className="text-white/65 text-[17px] max-w-xl mx-auto mb-10 leading-relaxed font-light">
                                Tham gia cùng hàng ngàn cầu thủ phủi 6v6 Việt Nam. Tạo giải đấu ngay hôm nay.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                                <Button size="lg" className="bg-gradient-to-r from-[#D4871A] to-[#E6A030] text-white hover:from-[#C07818] hover:to-[#D4951A] font-semibold text-sm h-13 px-10 rounded-xl shadow-lg shadow-[#D4871A]/20 transition-all duration-300 group border border-[#E6A030]/30" asChild>
                                    <Link href="/giai-dau"><Trophy className="w-5 h-5 mr-2" />Xem giải đấu<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Link>
                                </Button>
                                <Button size="lg" className="bg-white/[0.08] border border-white/[0.18] text-white hover:bg-white/[0.15] font-medium text-sm h-13 px-8 rounded-xl backdrop-blur-sm" asChild>
                                    <Link href="/huong-dan">Tìm hiểu thêm</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
