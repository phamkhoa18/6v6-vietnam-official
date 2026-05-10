"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Menu, Trophy, Users, Newspaper, LogIn, LogOut, User, Settings,
    LayoutDashboard, Gamepad2, ChevronDown, Shield, Bell,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
    { label: "Giải đấu", href: "/giai-dau", icon: Trophy },
    { label: "Tin tức", href: "/tin-tuc", icon: Newspaper },
    { label: "BXH", href: "/bxh", icon: Users },
    { label: "Cộng đồng", href: "/cong-dong", icon: Gamepad2 },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Mock: not logged in by default. Set to true to preview logged-in state
    const isAuthenticated = false;
    const isManager = false;
    const isLoading = false;
    const user = isAuthenticated ? {
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        avatar: "",
        role: "user" as const,
    } : null;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-white/95 backdrop-blur-md shadow-sm"
                : "bg-white"
                }`}
        >
            <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
                <nav className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <Image
                            src="/images/logo/logo_6v6_remove_bg.png"
                            alt="6v6 Vietnam Official"
                            width={160}
                            height={45}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 text-sm font-medium text-efb-text-secondary hover:text-efb-red transition-colors duration-200 rounded-lg hover:bg-efb-red/[0.04]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                            </div>
                        ) : isAuthenticated && user ? (
                            <>
                                {/* Notification Bell */}
                                <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors group">
                                    <Bell className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        3
                                    </span>
                                </button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors duration-200 outline-none focus:ring-2 focus:ring-efb-red/20 focus:ring-offset-1">
                                            <Avatar className="w-8 h-8 border-2 border-efb-red/20">
                                                <AvatarImage src={user.avatar || ""} alt={user.name} />
                                                <AvatarFallback className="bg-efb-red text-white text-xs font-bold">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-efb-dark max-w-[120px] truncate hidden xl:block">
                                                {user.name}
                                            </span>
                                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-lg border border-gray-100">
                                        <DropdownMenuLabel className="px-3 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-2 border-efb-red/10">
                                                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                                                    <AvatarFallback className="bg-efb-red text-white text-sm font-bold">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-efb-red bg-red-50 px-1.5 py-0.5 rounded-full">
                                                            <Gamepad2 className="w-2.5 h-2.5" />
                                                            Người chơi
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="my-1" />
                                        <DropdownMenuItem asChild className="px-3 py-2.5 rounded-lg cursor-pointer">
                                            <Link href="/trang-ca-nhan" className="flex items-center gap-2.5">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">Trang cá nhân</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="px-3 py-2.5 rounded-lg cursor-pointer">
                                            <Link href="/giai-dau" className="flex items-center gap-2.5">
                                                <Trophy className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">Giải đấu của tôi</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-1" />
                                        <DropdownMenuItem className="px-3 py-2.5 rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                            <LogOut className="w-4 h-4 mr-2.5" />
                                            <span className="text-sm">Đăng xuất</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    className="text-efb-text-secondary hover:text-efb-red text-sm font-medium h-9 px-4"
                                    asChild
                                >
                                    <Link href="/dang-nhap">
                                        <LogIn className="w-4 h-4 mr-1.5" />
                                        Đăng nhập
                                    </Link>
                                </Button>
                                <Button
                                    className="bg-efb-red text-white hover:bg-efb-red-light font-semibold text-sm h-9 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    asChild
                                >
                                    <Link href="/dang-ky">
                                        Đăng ký
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-efb-text hover:bg-efb-red/[0.05]"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-full sm:w-[360px] bg-white border-l border-efb-border p-0"
                        >
                            <div className="flex flex-col h-full">
                                {/* Mobile header */}
                                <div className="flex items-center p-5 border-b border-efb-border">
                                    <Image
                                        src="/images/logo/logo_6v6_remove_bg.png"
                                        alt="6v6 Vietnam Official"
                                        width={140}
                                        height={40}
                                        className="h-9 w-auto object-contain cursor-pointer"
                                    />
                                </div>

                                {/* Mobile user info (if logged in) */}
                                {isAuthenticated && user && (
                                    <div className="px-5 py-4 border-b border-efb-border bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-11 h-11 border-2 border-efb-red/20">
                                                <AvatarImage src={user.avatar || ""} alt={user.name} />
                                                <AvatarFallback className="bg-efb-red text-white text-sm font-bold">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mobile nav links */}
                                <div className="flex-1 py-3 px-3">
                                    {navLinks.map((link, i) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: 16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-efb-text hover:bg-efb-bg-alt transition-colors duration-150"
                                            >
                                                <link.icon className="w-[18px] h-[18px] text-efb-red" />
                                                <span className="text-[15px] font-medium">{link.label}</span>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Mobile footer */}
                                <div className="p-5 space-y-2.5 border-t border-efb-border">
                                    {isAuthenticated && user ? (
                                        <Button
                                            variant="outline"
                                            className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium rounded-xl"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Đăng xuất
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="w-full h-11 border-efb-border text-efb-text font-medium rounded-xl"
                                                asChild
                                            >
                                                <Link href="/dang-nhap" onClick={() => setMobileOpen(false)}>
                                                    Đăng nhập
                                                </Link>
                                            </Button>
                                            <Button
                                                className="w-full h-11 bg-efb-red text-white hover:bg-efb-red-light font-semibold rounded-xl"
                                                asChild
                                            >
                                                <Link href="/dang-ky" onClick={() => setMobileOpen(false)}>
                                                    Đăng ký
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </nav>
            </div>
        </motion.header>
    );
}
