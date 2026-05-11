"use client";

import { useState } from "react";
import { Search, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlayersPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý cầu thủ</h1>
                    <p className="text-sm text-gray-500 mt-1">Danh sách tất cả cầu thủ đã đăng ký hệ thống 6v6</p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên, ID, hoặc SĐT..." className="pl-9 h-11 rounded-xl" />
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-gray-200">
                    <Filter className="w-4 h-4 mr-2" /> Bộ lọc
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu cầu thủ</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Chưa có cầu thủ nào đăng ký trên hệ thống hoặc tham gia giải đấu của bạn.</p>
            </div>
        </div>
    );
}
