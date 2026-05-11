"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const bannerY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
    const scaleValue = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full overflow-hidden bg-white"
        >
            {/* Spacer to push banner below fixed navbar (h-18 = 72px) */}
            <div className="h-12" />

            {/* Banner wrapper */}
            <div className="relative w-full">
                <motion.div
                    className="relative w-full"
                    style={{ y: bannerY, scale: scaleValue }}
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto block"
                    >
                        <source src="/images/banner/banner_video.mp4" type="video/mp4" />
                    </video>
                </motion.div>

                White fade at bottom — long smooth gradient, no hard edge
                <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{ background: 'linear-gradient(to top, white 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.15) 70%, transparent 100%)' }} />

                {/* Floating gold particles */}
                {isMounted && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full bg-[#D4871A]/30"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${55 + (i % 3) * 10}%`,
                                }}
                                animate={{
                                    y: [0, -30, 0],
                                    opacity: [0, 0.6, 0],
                                }}
                                transition={{
                                    duration: 3.5 + i * 0.4,
                                    repeat: Infinity,
                                    delay: i * 0.7,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Scroll indicator */}
                {isMounted && (
                    <motion.div
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                    >
                        <motion.div
                            className="w-5 h-8 rounded-full border-2 border-white/25 flex items-start justify-center p-1"
                        >
                            <motion.div
                                className="w-1 h-2 rounded-full bg-white/60"
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
