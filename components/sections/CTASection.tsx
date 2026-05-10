"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-20 lg:py-28 bg-white">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Bright red gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626] via-[#E53E3E] to-[#C53030]" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-amber-300/[0.06]" />

                        {/* Decorative mesh */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-24 -right-24 w-[350px] h-[350px] bg-gradient-to-br from-amber-300/15 via-orange-300/10 to-transparent rounded-full blur-[60px]" />
                            <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] bg-gradient-to-tr from-rose-300/10 via-pink-300/5 to-transparent rounded-full blur-[60px]" />
                        </div>

                        {/* Dot pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        <div className="relative px-8 py-16 sm:px-16 sm:py-20 lg:px-24 lg:py-24 text-center z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.1] border border-white/[0.15] backdrop-blur-sm mb-8">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span className="text-xs font-medium text-white/95 tracking-wider uppercase">Bắt đầu miễn phí</span>
                            </div>
                            <h2 className="text-[32px] sm:text-[40px] lg:text-[56px] font-extralight text-white leading-tight mb-6 tracking-tight">
                                Sẵn sàng tạo giải đấu
                                <br />
                                <span className="font-bold">6v6 của riêng bạn?</span>
                            </h2>
                            <p className="text-white/70 text-[17px] max-w-xl mx-auto mb-10 leading-relaxed font-light">
                                Tham gia cùng hàng ngàn game thủ eFootball 6v6 Việt Nam. Tạo giải đấu ngay hôm nay.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                                <Button size="lg" className="bg-white text-efb-red hover:bg-white/95 font-semibold text-sm h-13 px-10 rounded-xl shadow-lg shadow-black/10 transition-all duration-300 group" asChild>
                                    <Link href="/giai-dau"><Trophy className="w-5 h-5 mr-2" />Xem giải đấu<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Link>
                                </Button>
                                <Button size="lg" className="bg-white/[0.1] border border-white/[0.2] text-white hover:bg-white/[0.18] font-medium text-sm h-13 px-8 rounded-xl backdrop-blur-sm" asChild>
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
