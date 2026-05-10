"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, Video, MessageCircle, Mail, Phone, MapPin, Camera, Send, Gamepad2, Trophy } from "lucide-react";

const quickLinks = [
    { label: "Giải đấu", href: "/giai-dau" },
    { label: "Tin tức", href: "/tin-tuc" },
    { label: "BXH", href: "/bxh" },
    { label: "Cộng đồng", href: "/cong-dong" },
];

const supportLinks = [
    { label: "Liên hệ", href: "/lien-he" },
    { label: "Điều khoản", href: "/dieu-khoan" },
    { label: "Chính sách", href: "/chinh-sach" },
    { label: "FAQ", href: "/faq" },
];

const socialLinks = [
    { label: "Facebook", href: "https://facebook.com/6v6vietnam", icon: Globe },
    { label: "YouTube", href: "https://youtube.com/@6v6vietnam", icon: Video },
    { label: "Discord", href: "https://discord.gg/6v6vietnam", icon: MessageCircle },
    { label: "Instagram", href: "https://instagram.com/6v6vietnam", icon: Camera },
];

export function Footer() {
    return (
        <footer className="bg-efb-dark text-white">
            {/* Main Footer */}
            <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                            <Image
                                src="/images/logo/logo_6v6_remove_bg.png"
                                alt="6v6 Vietnam Official"
                                width={160}
                                height={45}
                                className="h-10 w-auto object-contain brightness-110"
                            />
                        </Link>
                        <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-6">
                            Nền tảng tổ chức và quản lý giải đấu eFootball 6v6 hàng đầu Việt Nam. Kết nối cộng đồng game thủ, tạo sân chơi chuyên nghiệp.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-2.5">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-efb-gold hover:bg-white/[0.12] transition-all duration-200"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>

                        {/* Contact Info */}
                        <div className="mt-6 space-y-2.5 text-white/50 text-sm">
                            <a href="mailto:contact@6v6vietnam.vn" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>contact@6v6vietnam.vn</span>
                            </a>
                            <a href="tel:0901234567" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>090 123 4567</span>
                            </a>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span>TP. Hồ Chí Minh, Việt Nam</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 mb-4">
                            Truy cập nhanh
                        </h4>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 mb-4">
                            Hỗ trợ
                        </h4>
                        <ul className="space-y-2.5">
                            {supportLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/[0.08]">
                <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-white/40 text-xs">
                        © 2026 6v6 Vietnam Official. Mọi quyền được bảo lưu.
                    </p>
                    <p className="text-white/25 text-xs">
                        eFootball™ là thương hiệu của KONAMI Digital Entertainment.
                    </p>
                </div>
            </div>
        </footer>
    );
}
