"use client";

import { useState } from "react";
import { Search, Trophy, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminTournamentsPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Giải đấu</h1>
                    <p className="text-sm text-gray-500 mt-1">Danh sách giải đấu toàn hệ thống</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm giải đấu..." className="pl-9 h-10" />
                    </div>
                    <Button variant="outline" className="h-10 rounded-xl border-gray-200">
                        <Filter className="w-4 h-4 mr-2" /> Lọc
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Chưa có giải đấu nào được tạo trên hệ thống.</p>
            </div>
        </div>
    );
}
