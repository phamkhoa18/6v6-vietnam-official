"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    Trophy,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Search,
    Menu,
    FileText,
    ArrowLeft,
    ShieldAlert,
    Globe,
    FolderTree
} from "lucide-react";
import { Loader2 } from "lucide-react";

const adminSidebarLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Người dùng", href: "/admin/nguoi-dung", icon: Users },
    { label: "Giải đấu", href: "/admin/giai-dau", icon: Trophy },
    { label: "Bài viết", href: "/admin/bai-viet", icon: FileText },
    { label: "Danh mục", href: "/admin/danh-muc", icon: FolderTree },
    { label: "Quản lý Menu", href: "/admin/menu", icon: Globe },
    { label: "Cài đặt", href: "/admin/cai-dat", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !isAdmin)) {
            router.push("/dang-nhap");
        }
    }, [isLoading, isAuthenticated, isAdmin, router]);

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className={`flex items-center h-16 px-4 border-b border-gray-100 ${collapsed ? "justify-center" : "gap-3"}`}>
                {collapsed ? (
                    <Image src="/images/logo/logo_6v6_remove_bg.png" alt="6v6" width={32} height={32} className="w-8 h-8 object-contain" />
                ) : (
                    <>
                        <Image src="/images/logo/logo_6v6_remove_bg.png" alt="6v6" width={80} height={32} className="h-8 w-auto object-contain flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-efb-dark leading-tight">6v6 Vietnam</span>
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> ADMIN
                            </span>
                        </div>
                    </>
                )}
            </div>

            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {adminSidebarLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                active
                                    ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            } ${collapsed ? "justify-center" : ""}`}
                            title={collapsed ? link.label : undefined}
                        >
                            <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-amber-500"}`} />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </div>

            <div className="px-3 pb-4 space-y-1 border-t border-gray-100 pt-3">
                <Link
                    href="/"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 ${collapsed ? "justify-center" : ""}`}
                >
                    <ArrowLeft className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && <span>Về trang chủ</span>}
                </Link>

                <div className={`flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-amber-50 ${collapsed ? "justify-center" : ""}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
                        <ShieldAlert className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-amber-900 truncate">{user?.name}</div>
                            <div className="text-[11px] text-amber-700/70 truncate">{user?.email}</div>
                        </div>
                    )}
                    {!collapsed && (
                        <button onClick={logout} className="text-amber-700/50 hover:text-amber-700 transition-colors flex-shrink-0" title="Đăng xuất">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-40 ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-20 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-gray-400 hover:text-amber-500"
                    style={{ left: collapsed ? "60px" : "248px" }}
                >
                    {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </aside>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
                        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed top-0 left-0 bottom-0 w-[260px] bg-white z-50 lg:hidden shadow-xl">
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input placeholder="Tìm kiếm Admin..." className="w-64 h-9 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
