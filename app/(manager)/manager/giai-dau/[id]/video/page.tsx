"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, PlaySquare, Plus, Save, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tournamentAPI } from "@/lib/api";
import { toast } from "sonner";

export default function TournamentVideoSettings() {
    const { id } = useParams() as { id: string };
    const [tournament, setTournament] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [videos, setVideos] = useState<{ url: string; title: string }[]>([]);

    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await tournamentAPI.getById(id);
            if (res.success) {
                const t = res.data.tournament;
                setTournament(t);
                setVideos(t.videos || []);
            }
        } catch { toast.error("Lỗi tải dữ liệu"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const handleSave = async (updatedVideos: any[]) => {
        setIsSaving(true);
        try {
            const res = await tournamentAPI.update(id, { videos: updatedVideos });
            if (res.success) {
                toast.success("Đã lưu video");
                setVideos(updatedVideos);
            } else {
                toast.error(res.message || "Lưu thất bại");
            }
        } catch { toast.error("Lỗi lưu dữ liệu"); }
        finally { setIsSaving(false); }
    };

    const handleAddVideo = () => {
        if (!newTitle.trim() || !newUrl.trim()) {
            toast.error("Vui lòng nhập đủ tiêu đề và link video");
            return;
        }
        
        // Basic check for embedded script/iframe vs url
        const urlToSave = newUrl.trim();
        const updated = [{ title: newTitle.trim(), url: urlToSave }, ...videos];
        handleSave(updated);
        
        setNewTitle("");
        setNewUrl("");
    };

    const handleRemoveVideo = (index: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa video này?")) return;
        const updated = [...videos];
        updated.splice(index, 1);
        handleSave(updated);
    };

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>;
    if (!tournament) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Quản lý Video Highlight</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Thêm các video ngắn, highlight dạng TikTok/Reels cho giải đấu</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Video className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Thêm Video Mới</h2>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 font-medium">Tiêu đề / Caption</Label>
                        <Input 
                            value={newTitle} 
                            onChange={(e) => setNewTitle(e.target.value)} 
                            placeholder="VD: Siêu phẩm sút phạt vòng bảng..." 
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 font-medium">Link MP4 hoặc Mã Nhúng (Iframe)</Label>
                        <Input 
                            value={newUrl} 
                            onChange={(e) => setNewUrl(e.target.value)} 
                            placeholder="https://...mp4 hoặc <iframe>...</iframe>" 
                            className="h-10"
                        />
                    </div>
                </div>
                
                <div className="flex justify-end pt-2">
                    <Button 
                        onClick={handleAddVideo} 
                        disabled={isSaving} 
                        className="h-10 px-5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Thêm Video
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <PlaySquare className="w-4 h-4 text-gray-400" />
                        Danh sách Video ({videos.length})
                    </h2>
                </div>
                
                <div className="p-6">
                    {videos.length === 0 ? (
                        <div className="text-center py-10">
                            <Video className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Chưa có video nào.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map((vid, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 items-start">
                                    <div className="w-24 h-32 bg-black rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                        {vid.url.includes("<iframe") ? (
                                            <div className="absolute inset-0 pointer-events-none opacity-50 flex items-center justify-center bg-gray-800 text-white text-[10px] text-center p-2">
                                                Iframe<br/>Embed
                                            </div>
                                        ) : (
                                            <video src={vid.url} className="w-full h-full object-cover opacity-60" />
                                        )}
                                        <PlaySquare className="w-6 h-6 text-white absolute z-10 opacity-80" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{vid.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-1 truncate bg-white px-2 py-1 rounded border border-gray-100 font-mono mt-2">
                                            {vid.url}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleRemoveVideo(idx)}
                                        className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
