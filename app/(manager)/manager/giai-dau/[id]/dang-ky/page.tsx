"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, CheckCircle2, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TournamentRegistration() {
    const params = useParams();
    const [search, setSearch] = useState("");

    // Mock data
    const [registrations, setRegistrations] = useState([
        { id: 1, teamName: "Hanoi FC", captain: "Nguyen Van A", phone: "0901234567", status: "pending", date: "2026-05-10" },
        { id: 2, teamName: "Saigon United", captain: "Tran Van B", phone: "0987654321", status: "approved", date: "2026-05-11" },
    ]);

    const handleApprove = (id: number) => {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    };

    const handleReject = (id: number) => {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý đăng ký</h1>
                    <p className="text-sm text-gray-500 mt-1">Duyệt các đội tham gia giải đấu</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm đội bóng..." className="pl-9 h-10 rounded-xl" />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Đội bóng</th>
                            <th className="px-6 py-4 font-medium">Đội trưởng</th>
                            <th className="px-6 py-4 font-medium">Liên hệ</th>
                            <th className="px-6 py-4 font-medium">Ngày ĐK</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {registrations.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-900">{r.teamName}</td>
                                <td className="px-6 py-4 text-gray-600">{r.captain}</td>
                                <td className="px-6 py-4 text-gray-600">{r.phone}</td>
                                <td className="px-6 py-4 text-gray-600">{r.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                        r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {r.status === 'approved' ? 'ĐÃ DUYỆT' : r.status === 'rejected' ? 'TỪ CHỐI' : 'CHỜ DUYỆT'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {r.status === 'pending' && (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => handleApprove(r.id)} className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Duyệt
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleReject(r.id)} className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                                <XCircle className="w-4 h-4 mr-1" /> Từ chối
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {registrations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có đơn đăng ký nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
