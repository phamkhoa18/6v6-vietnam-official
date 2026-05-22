"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PlaySquare, Plus, Trash2, Video, GripVertical, ExternalLink, Link as LinkIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tournamentAPI } from "@/lib/api";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

/* ===== Video Type Config ===== */
type VideoType = "youtube" | "shorts" | "tiktok" | "other";

const videoTypeConfig: Record<VideoType, { label: string; color: string; bg: string; placeholder: string; desc: string }> = {
    youtube: {
        label: "YouTube",
        color: "text-red-600",
        bg: "bg-red-50 border-red-200",
        placeholder: "https://www.youtube.com/watch?v=...",
        desc: "Video YouTube thông thường (16:9)",
    },
    shorts: {
        label: "Shorts",
        color: "text-pink-600",
        bg: "bg-pink-50 border-pink-200",
        placeholder: "https://www.youtube.com/shorts/... hoặc https://youtube.com/watch?v=...",
        desc: "YouTube Shorts dạng dọc (9:16)",
    },
    tiktok: {
        label: "TikTok",
        color: "text-gray-900",
        bg: "bg-gray-100 border-gray-300",
        placeholder: "https://www.tiktok.com/@user/video/... hoặc https://vm.tiktok.com/...",
        desc: "Video TikTok dạng dọc (9:16)",
    },
    other: {
        label: "Khác",
        color: "text-indigo-600",
        bg: "bg-indigo-50 border-indigo-200",
        placeholder: "Link MP4 hoặc <iframe>...</iframe>",
        desc: "Iframe embed hoặc link video trực tiếp",
    },
};

/* ===== Helpers ===== */
function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    const iframeM = url.match(/src=["'](?:https?:)?\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (iframeM) return iframeM[1];
    return null;
}

function extractTikTokId(url: string): string | null {
    if (!url) return null;
    const m = url.match(/\/video\/(\d+)/);
    if (m) return m[1];
    // Also try to match the embed URL format
    const embedM = url.match(/tiktok\.com\/embed\/v2\/(\d+)/);
    if (embedM) return embedM[1];
    return null;
}

function getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function autoDetectType(url: string): VideoType {
    if (!url) return "youtube";
    if (/youtube\.com\/shorts\/|\/shorts\//i.test(url)) return "shorts";
    if (/tiktok\.com/i.test(url) || /vm\.tiktok\.com/i.test(url)) return "tiktok";
    if (extractYouTubeId(url)) return "youtube";
    return "other";
}

export default function TournamentVideoSettings() {
    const { id } = useParams() as { id: string };
    const [tournament, setTournament] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [videos, setVideos] = useState<{ url: string; title: string; type: VideoType; createdAt?: string }[]>([]);

    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newType, setNewType] = useState<VideoType>("youtube");
    const [previewId, setPreviewId] = useState<string | null>(null);

    const confirmDialog = useConfirmDialog();

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await tournamentAPI.getById(id);
            if (res.success) {
                const t = res.data.tournament;
                setTournament(t);
                setVideos((t.videos || []).map((v: any) => ({ ...v, type: v.type || autoDetectType(v.url) })));
            }
        } catch { toast.error("Lỗi tải dữ liệu"); }
        finally { setIsLoading(false); }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    // Auto-detect type + preview when URL changes
    useEffect(() => {
        const detected = autoDetectType(newUrl);
        setNewType(detected);
        if (detected === "youtube" || detected === "shorts") {
            setPreviewId(extractYouTubeId(newUrl));
        } else {
            setPreviewId(null);
        }
    }, [newUrl]);

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
        const trimmedUrl = newUrl.trim();
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) { toast.error("Vui lòng nhập tiêu đề"); return; }
        if (!trimmedUrl) { toast.error("Vui lòng nhập link video"); return; }

        const updated = [{ title: trimmedTitle, url: trimmedUrl, type: newType, createdAt: new Date().toISOString() }, ...videos];
        handleSave(updated);
        setNewTitle("");
        setNewUrl("");
    };

    const handleRemoveVideo = async (index: number) => {
        const isConfirmed = await confirmDialog.confirm({
            title: "Xóa video",
            description: `Bạn có chắc chắn muốn xóa "${videos[index]?.title || 'video này'}"?`,
            confirmText: "Xóa", cancelText: "Hủy", variant: "danger"
        });
        if (!isConfirmed) return;
        const updated = [...videos];
        updated.splice(index, 1);
        handleSave(updated);
    };

    const moveVideo = (from: number, to: number) => {
        if (to < 0 || to >= videos.length) return;
        const updated = [...videos];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        handleSave(updated);
    };

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>;
    if (!tournament) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <PlaySquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Video Highlights</h1>
                        <p className="text-sm text-gray-400 mt-0.5">YouTube, Shorts, TikTok và iframe embed</p>
                    </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                    {videos.length} video
                </div>
            </div>

            {/* Add Video Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/30">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">Thêm Video Mới</h2>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    {/* Video Type Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Loại Video</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(Object.entries(videoTypeConfig) as [VideoType, typeof videoTypeConfig.youtube][]).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setNewType(key)}
                                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                                        newType === key
                                            ? `${cfg.bg} shadow-sm scale-[1.02]`
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {/* Type icon */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${newType === key ? cfg.bg : "bg-gray-100"}`}>
                                        {key === "youtube" && (
                                            <svg className={`w-4 h-4 ${newType === key ? cfg.color : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
                                            </svg>
                                        )}
                                        {key === "shorts" && (
                                            <svg className={`w-4 h-4 ${newType === key ? cfg.color : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                                            </svg>
                                        )}
                                        {key === "tiktok" && (
                                            <svg className={`w-4 h-4 ${newType === key ? cfg.color : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.8.1v-3.5a6.37 6.37 0 0 0-.8-.05A6.34 6.34 0 0 0 3.15 15.2 6.34 6.34 0 0 0 9.49 21.6a6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 3.76.92V6.18a4.83 4.83 0 0 1-.01.51z"/>
                                            </svg>
                                        )}
                                        {key === "other" && <LinkIcon className={`w-4 h-4 ${newType === key ? cfg.color : "text-gray-400"}`} />}
                                    </div>
                                    <span className={`text-xs font-bold ${newType === key ? cfg.color : "text-gray-500"}`}>{cfg.label}</span>
                                    {newType === key && (
                                        <motion.div layoutId="type-indicator" className="absolute -top-px left-0 right-0 h-[3px] bg-current rounded-b-full" style={{ color: "currentColor" }} />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{videoTypeConfig[newType].desc}</p>
                    </div>

                    {/* Title + URL */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 font-medium">Tiêu đề video *</Label>
                            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="VD: Highlight Bán kết" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 font-medium">Link video *</Label>
                            <Input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder={videoTypeConfig[newType].placeholder}
                                className="h-11 rounded-xl font-mono text-xs"
                            />
                        </div>
                    </div>

                    {/* Live Preview (YouTube/Shorts only) */}
                    <AnimatePresence>
                        {previewId && (newType === "youtube" || newType === "shorts") && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100/60 border-b border-gray-100">
                                        <Eye className="w-3 h-3 text-gray-400" />
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Xem trước</span>
                                    </div>
                                    <div className={`${newType === "shorts" ? "max-w-[280px] mx-auto aspect-[9/16]" : "aspect-video"}`}>
                                        <iframe src={`https://www.youtube.com/embed/${previewId}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-1">
                        <p className="text-[10px] text-gray-400">
                            Tự động nhận diện loại video khi dán link
                        </p>
                        <Button
                            onClick={handleAddVideo}
                            disabled={isSaving || !newTitle.trim() || !newUrl.trim()}
                            className="h-10 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 font-medium shadow-md shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Thêm Video
                        </Button>
                    </div>
                </div>
            </div>

            {/* Video List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-400" />
                        Danh sách Video ({videos.length})
                    </h2>
                </div>
                <div className="p-4">
                    {videos.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4">
                                <PlaySquare className="w-7 h-7 text-gray-200" />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">Chưa có video nào</p>
                            <p className="text-gray-400 text-xs mt-1">Thêm video YouTube, Shorts hoặc TikTok cho giải đấu</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {videos.map((vid, idx) => {
                                const type = vid.type || autoDetectType(vid.url);
                                const cfg = videoTypeConfig[type];
                                const ytId = extractYouTubeId(vid.url);
                                const thumbnail = ytId ? getYouTubeThumbnail(ytId) : null;
                                const isVertical = type === "shorts" || type === "tiktok";

                                return (
                                    <motion.div
                                        key={`${vid.url}-${idx}`}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all duration-200 items-start"
                                    >
                                        {/* Reorder */}
                                        <div className="flex flex-col items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveVideo(idx, idx - 1)} disabled={idx === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-30">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <GripVertical className="w-4 h-4 text-gray-300" />
                                            <button onClick={() => moveVideo(idx, idx + 1)} disabled={idx === videos.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-30">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        </div>

                                        {/* Thumbnail */}
                                        <div className={`bg-black rounded-lg overflow-hidden flex-shrink-0 relative ${isVertical ? "w-20 h-32" : "w-40 h-24"}`}>
                                            {thumbnail ? (
                                                <img src={thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                    <Video className="w-6 h-6 text-gray-500" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                            {/* Type badge */}
                                            <div className="absolute top-1.5 left-1.5">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${type === "youtube" ? "bg-red-600 text-white" : type === "shorts" ? "bg-pink-600 text-white" : type === "tiktok" ? "bg-gray-900 text-white" : "bg-indigo-600 text-white"}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <h3 className="font-bold text-sm text-gray-900 mb-1.5 line-clamp-2 leading-snug">{vid.title}</h3>
                                            <p className="text-[11px] text-gray-400 truncate font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 max-w-sm">
                                                {vid.url.length > 70 ? vid.url.substring(0, 70) + "..." : vid.url}
                                            </p>
                                            {vid.createdAt && (
                                                <p className="text-[10px] text-gray-300 mt-2">
                                                    {new Date(vid.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                                            <Button variant="outline" size="sm" onClick={() => window.open(vid.url, '_blank')} className="text-gray-400 border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 h-8 w-8 p-0" title="Mở video">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleRemoveVideo(idx)} className="text-gray-400 border-gray-100 hover:bg-red-50 hover:text-red-500 h-8 w-8 p-0" title="Xóa video">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
