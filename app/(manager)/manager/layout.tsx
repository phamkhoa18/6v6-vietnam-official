"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Trophy,
    Users,
    CalendarPlus,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    Menu,
    BarChart3,
    User,
    ArrowLeft,
    Eye,
    Swords,
    Calendar,
    UserCheck,
    ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ===== Main sidebar links ===== */
const mainSidebarLinks = [
    { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { label: "Giải đấu", href: "/manager/giai-dau", icon: Trophy },
    { label: "Tạo giải đấu", href: "/manager/tao-giai-dau", icon: CalendarPlus },
    { label: "Quản lý cầu thủ", href: "/manager/cau-thu", icon: Users },
    { label: "Thống kê", href: "/manager/thong-ke", icon: BarChart3 },
];

const mainBottomLinks = [
    { label: "Về trang chủ", href: "/", icon: ArrowLeft },
];

/* ===== Tournament detail sidebar links ===== */
const tournamentSidebarLinks = (id: string) => [
    { label: "Tổng quan", href: `/manager/giai-dau/${id}`, icon: Eye },
    { label: "Đăng ký thi đấu", href: `/manager/giai-dau/${id}/dang-ky`, icon: UserCheck },
    { label: "Lịch thi đấu", href: `/manager/giai-dau/${id}/lich`, icon: Calendar },
    { label: "Cài đặt giải đấu", href: `/manager/giai-dau/${id}/cai-dat`, icon: Settings },
];

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, isAuthenticated, isManager, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Auth protection
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !isManager)) {
            router.push("/dang-nhap");
        }
    }, [isLoading, isAuthenticated, isManager, router]);

    // Detect if inside a tournament detail page
    const tournamentMatch = pathname.match(/^\/manager\/giai-dau\/([^/]+)/);
    const tournamentId = tournamentMatch && tournamentMatch[1] !== "tao-giai-dau" ? tournamentMatch[1] : null;
    const isInTournamentDetail = !!tournamentId;

    const currentLinks = useMemo(() => {
        if (isInTournamentDetail && tournamentId) {
            return tournamentSidebarLinks(tournamentId);
        }
        return mainSidebarLinks;
    }, [isInTournamentDetail, tournamentId]);

    const isActive = (href: string) => {
        if (isInTournamentDetail) {
            return pathname === href;
        }
        if (href === "/manager") return pathname === "/manager";
        return pathname.startsWith(href);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-efb-red mx-auto mb-3" />
                    <p className="text-sm text-efb-text-muted">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !isManager) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center h-16 px-4 border-b border-gray-100 ${collapsed ? "justify-center" : "gap-3"}`}>
                {collapsed ? (
                    <Image src="/images/logo/logo_6v6_remove_bg.png" alt="6v6 Vietnam" width={32} height={32} className="w-8 h-8 object-contain" />
                ) : (
                    <>
                        <div className="flex-shrink-0">
                            <Image src="/images/logo/logo_6v6_remove_bg.png" alt="6v6 Vietnam" width={80} height={32} className="h-8 w-auto object-contain" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-efb-dark leading-tight">6v6 Vietnam</span>
                            <span className="text-[10px] text-efb-red font-medium">Manager</span>
                        </div>
                    </>
                )}
            </div>

            {/* Back button (tournament detail) */}
            {isInTournamentDetail && !collapsed && (
                <Link
                    href="/manager/giai-dau"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-lg text-xs font-medium text-efb-text-muted hover:text-efb-red hover:bg-red-50 transition-all"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại danh sách
                </Link>
            )}
            {isInTournamentDetail && collapsed && (
                <Link
                    href="/manager/giai-dau"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center mx-3 mt-3 p-2 rounded-lg text-efb-text-muted hover:text-efb-red hover:bg-red-50 transition-all"
                    title="Quay lại danh sách"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
            )}

            {/* Nav Links */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                <div className={`text-[10px] font-semibold text-efb-text-muted uppercase tracking-wider mb-3 ${collapsed ? "text-center" : "px-3"}`}>
                    {collapsed ? "—" : isInTournamentDetail ? "Quản lý giải đấu" : "Menu"}
                </div>
                {currentLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                ? "bg-efb-red text-white shadow-sm shadow-efb-red/20"
                                : "text-efb-text-secondary hover:bg-gray-100 hover:text-efb-dark"
                                } ${collapsed ? "justify-center" : ""}`}
                            title={collapsed ? link.label : undefined}
                        >
                            <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-white" : "text-efb-text-muted group-hover:text-efb-red"}`} />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom */}
            <div className="px-3 pb-4 space-y-1 border-t border-gray-100 pt-3">
                {!isInTournamentDetail && mainBottomLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-gray-100 text-efb-dark" : "text-efb-text-muted hover:bg-gray-50 hover:text-efb-text-secondary"
                                } ${collapsed ? "justify-center" : ""}`}
                        >
                            <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}

                {/* User profile */}
                <div className={`flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-gray-50 ${collapsed ? "justify-center" : ""}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-efb-red to-efb-gold flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/20">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-efb-dark truncate">{user?.name || "Manager"}</div>
                            <div className="text-[11px] text-efb-text-muted truncate">{user?.email || ""}</div>
                        </div>
                    )}
                    {!collapsed && (
                        <button onClick={logout} className="text-efb-text-muted hover:text-red-500 transition-colors flex-shrink-0" title="Đăng xuất">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-40 ${collapsed ? "w-[72px]" : "w-[260px]"
                    }`}
            >
                <SidebarContent />
                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-20 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-efb-text-muted hover:text-efb-red"
                    style={{ left: collapsed ? "60px" : "248px" }}
                >
                    {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[260px] bg-white z-50 lg:hidden shadow-xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-efb-text-secondary hover:text-efb-dark">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-efb-text-muted" />
                            <input
                                placeholder="Tìm kiếm..."
                                className="w-64 h-9 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-efb-text-secondary focus:bg-white focus:border-efb-red focus:ring-2 focus:ring-efb-red/10 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-efb-red/20">
                                    <Bell className="w-4 h-4 text-efb-text-secondary" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-gray-100 shadow-xl overflow-hidden mt-2">
                                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="font-bold text-gray-900 text-sm">Thông báo</div>
                                </div>
                                <div className="p-8 text-center text-sm text-gray-500">
                                    Tính năng đang phát triển.
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="/" className="text-xs text-efb-text-muted hover:text-efb-red transition-colors font-medium">
                            ← Về trang chủ
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
