"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TournamentSchedule() {
    const params = useParams();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lịch thi đấu</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các trận đấu của giải</p>
                </div>
                <Button className="bg-efb-red text-white hover:bg-efb-red-light rounded-xl shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo trận đấu
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có trận đấu nào</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Bạn chưa tạo trận đấu nào cho giải này. Hãy bắt đầu bằng cách tạo các cặp đấu hoặc chia bảng.</p>
                <Button variant="outline" className="rounded-xl border-gray-200">
                    <Plus className="w-4 h-4 mr-2" /> Tạo trận đầu tiên
                </Button>
            </div>
        </div>
    );
}
