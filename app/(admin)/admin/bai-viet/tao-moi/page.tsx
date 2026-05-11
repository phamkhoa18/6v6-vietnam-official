"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    ArrowLeft, Save, Send, Clock, Upload, X, Plus,
    Loader2, Image as ImageIcon, Globe, RefreshCw,
    Pin, Star, Search as SearchIcon,
    FileText, Hash, Code, AlertCircle,
    Trash2, CalendarIcon, FolderTree, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CategoryIcon } from "@/lib/category-icons";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

export default function CreatePostPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await adminAPI.getCategories();
                if (res.success) setCategories(res.data.categories || []);
            } catch (e) { console.error("Load categories error:", e); }
        };
        loadCategories();
    }, []);

    const [form, setForm] = useState({
        title: "", content: "", excerpt: "",
        category: "news", categoryRef: "",
        status: "draft" as string, tags: "",
        isPinned: false, isFeatured: false,
        coverImage: "", gallery: [] as string[],
        seo: {
            metaTitle: "", metaDescription: "", metaKeywords: "",
            ogImage: "", ogTitle: "", ogDescription: "",
            canonicalUrl: "", noIndex: false, structuredData: "",
        },
    });

    const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
    const updateSEO = (key: string, value: any) => setForm(prev => ({ ...prev, seo: { ...prev.seo, [key]: value } }));

    const handleImageUpload = async (file: File, type: "cover" | "gallery" | "content") => {
        setIsUploading(true);
        try {
            const res = await adminAPI.uploadContentImage(file, type);
            if (res.success) {
                const url = res.data.url;
                if (type === "cover") updateForm("coverImage", url);
                else if (type === "gallery") setForm(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
                toast.success("Upload thành công!"); return url;
            } else { toast.error(res.message || "Upload thất bại"); return null; }
        } catch (e: any) { toast.error(e.message || "Có lỗi upload"); return null; }
        finally { setIsUploading(false); }
    };

    const handleEditorImageUpload = useCallback(async (file: File): Promise<string | null> => {
        setIsUploading(true);
        try {
            const res = await adminAPI.uploadContentImage(file, "content");
            if (res.success) { toast.success("Upload ảnh thành công!"); return res.data.url; }
            toast.error(res.message || "Upload thất bại"); return null;
        } catch (e: any) { toast.error(e.message || "Có lỗi upload"); return null; }
        finally { setIsUploading(false); }
    }, []);

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "cover"); };
    const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => { const fs = e.target.files; if (fs) Array.from(fs).forEach(f => handleImageUpload(f, "gallery")); };
    const removeGalleryImage = (i: number) => setForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }));

    const autoFillSEO = () => {
        updateSEO("metaTitle", form.title || ""); updateSEO("ogTitle", form.title || "");
        const desc = form.excerpt || form.content.replace(/<[^>]*>/g, "").substring(0, 160);
        updateSEO("metaDescription", desc); updateSEO("ogDescription", desc);
        if (form.coverImage) updateSEO("ogImage", form.coverImage);
        if (form.tags) updateSEO("metaKeywords", form.tags);
        toast.success("Đã tự động điền SEO");
    };

    const plainText = form.content.replace(/<[^>]*>/g, "").replace(/[#*_~`\[\]()>-]/g, "").trim();
    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const seoTitleLen = (form.seo.metaTitle || form.title).length;
    const seoDescLen = (form.seo.metaDescription || form.excerpt).length;

    const handleSubmit = async (publishNow: boolean = false) => {
        if (!form.title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
        if (!form.content.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
        setIsSubmitting(true);
        try {
            const payload = {
                ...form, status: publishNow ? "published" : form.status,
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                seo: { ...form.seo, metaKeywords: form.seo.metaKeywords.split(",").map(t => t.trim()).filter(Boolean) },
                scheduledAt: scheduledDate ? scheduledDate.toISOString() : undefined,
            };
            const res = await adminAPI.createPost(payload);
            if (res.success) { toast.success(publishNow ? "Đã xuất bản!" : "Đã lưu nháp!"); router.push("/admin/bai-viet"); }
            else toast.error(res.message || "Có lỗi xảy ra");
        } catch (e: any) { toast.error(e.message || "Có lỗi xảy ra"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="max-w-[1140px] mx-auto">
            {/* Top bar — compact */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <Link href="/admin/bai-viet" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="w-px h-4 bg-gray-200" />
                    <span className="text-[13px] font-semibold text-gray-800">Bài viết mới</span>
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Nháp</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 mr-2">{wordCount} từ · {readingTime}p đọc</span>
                    <button onClick={() => handleSubmit(false)} disabled={isSubmitting}
                        className="h-8 px-3 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5"/>} Lưu nháp
                    </button>
                    <button onClick={() => handleSubmit(true)} disabled={isSubmitting}
                        className="h-8 px-3.5 text-[12px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5"/>} Xuất bản
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_280px] gap-5">
                {/* Main */}
                <div className="space-y-4">
                    {/* Title */}
                    <input
                        value={form.title} onChange={(e) => updateForm("title", e.target.value)}
                        placeholder="Tiêu đề bài viết..."
                        className="w-full text-xl font-bold text-gray-900 placeholder:text-gray-300 bg-transparent border-0 outline-none py-1"
                    />

                    {/* Tabs */}
                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="h-9 bg-gray-100/80 rounded-lg p-0.5 gap-0.5">
                            <TabsTrigger value="content" className="text-[12px] h-8 rounded-md px-3 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
                                <FileText className="w-3.5 h-3.5"/> Nội dung
                            </TabsTrigger>
                            <TabsTrigger value="media" className="text-[12px] h-8 rounded-md px-3 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
                                <ImageIcon className="w-3.5 h-3.5"/> Media
                            </TabsTrigger>
                            <TabsTrigger value="seo" className="text-[12px] h-8 rounded-md px-3 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
                                <SearchIcon className="w-3.5 h-3.5"/> SEO
                            </TabsTrigger>
                        </TabsList>

                        {/* === CONTENT === */}
                        <TabsContent value="content" className="mt-4 space-y-4">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Tóm tắt</label>
                                <Textarea value={form.excerpt} onChange={(e) => updateForm("excerpt", e.target.value)}
                                    placeholder="Mô tả ngắn hiển thị ở danh sách và kết quả tìm kiếm..." rows={2}
                                    className="resize-none text-[13px] border-gray-200 rounded-lg focus:border-gray-400 focus:ring-0"/>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <TiptapEditor content={form.content} onChange={(html) => updateForm("content", html)}
                                    onImageUpload={handleEditorImageUpload} isUploading={isUploading} placeholder="Viết nội dung bài viết..."/>
                            </div>
                        </TabsContent>

                        {/* === MEDIA === */}
                        <TabsContent value="media" className="mt-4 space-y-4">
                            {/* Cover */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Ảnh bìa</label>
                                {form.coverImage ? (
                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={form.coverImage} alt="Cover" className="w-full h-48 object-cover"/>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => fileInputRef.current?.click()} className="h-7 px-2.5 bg-white/90 text-gray-800 text-[11px] font-medium rounded-md flex items-center gap-1 hover:bg-white"><Upload className="w-3 h-3"/> Đổi</button>
                                            <button onClick={() => updateForm("coverImage", "")} className="h-7 px-2.5 bg-red-500/90 text-white text-[11px] font-medium rounded-md flex items-center gap-1 hover:bg-red-500"><Trash2 className="w-3 h-3"/> Xóa</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-36 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-2 transition-colors group bg-gray-50/50">
                                        {isUploading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin"/> : <>
                                            <Upload className="w-4 h-4 text-gray-400 group-hover:text-gray-500"/>
                                            <span className="text-[12px] text-gray-400 group-hover:text-gray-500">Tải ảnh bìa · 1200×630px</span>
                                        </>}
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect}/>
                            </div>
                            {/* Gallery */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Thư viện ảnh</label>
                                    <button onClick={() => galleryInputRef.current?.click()} className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-1"><Plus className="w-3 h-3"/> Thêm</button>
                                </div>
                                <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGallerySelect}/>
                                {form.gallery.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {form.gallery.map((url, i) => (
                                            <div key={i} className="relative group rounded-md overflow-hidden border border-gray-200 aspect-square">
                                                <img src={url} alt="" className="w-full h-full object-cover"/>
                                                <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-center py-6 text-[12px] text-gray-400">Chưa có ảnh</p>}
                            </div>
                        </TabsContent>

                        {/* === SEO === */}
                        <TabsContent value="seo" className="mt-4 space-y-4">
                            {/* Google Preview */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Xem trước Google</label>
                                    <button onClick={autoFillSEO} className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-1"><RefreshCw className="w-3 h-3"/> Tự động</button>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-0.5">
                                    <p className="text-[13px] text-blue-700 font-medium truncate">{form.seo.metaTitle || form.title || "Tiêu đề bài viết"}</p>
                                    <p className="text-[11px] text-emerald-700 truncate">6v6.vn/bai-viet/{form.title ? form.title.toLowerCase().replace(/\s+/g, "-").substring(0, 30) : "slug"}</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-2">{form.seo.metaDescription || form.excerpt || "Mô tả bài viết..."}</p>
                                </div>
                            </div>
                            {/* Meta */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1"><label className="text-[11px] font-medium text-gray-600">Meta Title</label><span className={`text-[10px] ${seoTitleLen > 60 ? 'text-red-500' : 'text-gray-400'}`}>{seoTitleLen}/60</span></div>
                                    <Input value={form.seo.metaTitle} onChange={(e) => updateSEO("metaTitle", e.target.value)} placeholder="Tiêu đề trên Google" className="h-8 text-[13px] rounded-lg"/>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1"><label className="text-[11px] font-medium text-gray-600">Meta Description</label><span className={`text-[10px] ${seoDescLen > 160 ? 'text-red-500' : 'text-gray-400'}`}>{seoDescLen}/160</span></div>
                                    <Textarea value={form.seo.metaDescription} onChange={(e) => updateSEO("metaDescription", e.target.value)} placeholder="Mô tả trên Google" rows={2} className="text-[13px] resize-none rounded-lg"/>
                                </div>
                                <div>
                                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Keywords</label>
                                    <Input value={form.seo.metaKeywords} onChange={(e) => updateSEO("metaKeywords", e.target.value)} placeholder="6v6, giải đấu, bóng đá" className="h-8 text-[13px] rounded-lg"/>
                                </div>
                            </div>
                            {/* OG */}
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Open Graph</label>
                                <Input value={form.seo.ogTitle} onChange={(e) => updateSEO("ogTitle", e.target.value)} placeholder="OG Title" className="h-8 text-[13px] rounded-lg"/>
                                <Textarea value={form.seo.ogDescription} onChange={(e) => updateSEO("ogDescription", e.target.value)} placeholder="OG Description" rows={2} className="text-[13px] resize-none rounded-lg"/>
                                <Input value={form.seo.ogImage} onChange={(e) => updateSEO("ogImage", e.target.value)} placeholder="OG Image URL" className="h-8 text-[13px] rounded-lg"/>
                                {(form.seo.ogImage || form.coverImage) && <img src={form.seo.ogImage || form.coverImage} alt="OG" className="w-full h-32 object-cover rounded-lg border border-gray-200"/>}
                            </div>
                            {/* Advanced */}
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nâng cao</label>
                                <Input value={form.seo.canonicalUrl} onChange={(e) => updateSEO("canonicalUrl", e.target.value)} placeholder="Canonical URL" className="h-8 text-[13px] rounded-lg"/>
                                <div className="flex items-center justify-between">
                                    <div><span className="text-[12px] font-medium text-gray-700">noIndex</span><p className="text-[10px] text-gray-400">Ẩn khỏi Google</p></div>
                                    <Switch checked={form.seo.noIndex} onCheckedChange={(v) => updateSEO("noIndex", v)}/>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar — compact */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-3.5 space-y-3.5 sticky top-20">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Xuất bản</p>

                        {/* Status */}
                        <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Trạng thái</label>
                            <Select value={form.status} onValueChange={(v) => updateForm("status", v)}>
                                <SelectTrigger className="h-8 text-[12px] rounded-lg"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft"><span className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> Nháp</span></SelectItem>
                                    <SelectItem value="published"><span className="flex items-center gap-1.5"><Globe className="w-3 h-3"/> Xuất bản</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Schedule */}
                        <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Lên lịch</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-8 px-2.5 text-[12px] border border-gray-200 rounded-lg flex items-center gap-1.5 text-gray-600 hover:bg-gray-50">
                                        <CalendarIcon className="w-3 h-3 text-gray-400"/>
                                        {scheduledDate ? format(scheduledDate, "dd/MM/yyyy", { locale: vi }) : <span className="text-gray-400">Chọn ngày...</span>}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate}/></PopoverContent>
                            </Popover>
                        </div>

                        <div className="h-px bg-gray-100"/>

                        {/* Category */}
                        <div>
                            <label className="text-[11px] text-gray-500 mb-1 flex items-center gap-1"><FolderTree className="w-3 h-3"/> Danh mục</label>
                            <Select value={form.categoryRef || form.category} onValueChange={(val) => {
                                const cat = categories.find(c => c._id === val);
                                if (cat) setForm(prev => ({ ...prev, categoryRef: cat._id, category: cat.slug }));
                                else updateForm("category", val);
                            }}>
                                <SelectTrigger className="h-8 text-[12px] rounded-lg"><SelectValue placeholder="Chọn danh mục"/></SelectTrigger>
                                <SelectContent>
                                    {categories.filter(c => c.isActive).map(cat => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            <span className="flex items-center gap-1.5"><CategoryIcon name={cat.icon} className="w-3 h-3"/>{cat.name}</span>
                                        </SelectItem>
                                    ))}
                                    {categories.length === 0 && <>
                                        <SelectItem value="news">Tin tức</SelectItem>
                                        <SelectItem value="announcement">Thông báo</SelectItem>
                                        <SelectItem value="guide">Hướng dẫn</SelectItem>
                                        <SelectItem value="update">Cập nhật</SelectItem>
                                    </>}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="text-[11px] text-gray-500 mb-1 flex items-center gap-1"><Hash className="w-3 h-3"/> Tags</label>
                            <Input value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} placeholder="6v6, giải đấu" className="h-8 text-[12px] rounded-lg"/>
                        </div>

                        <div className="h-px bg-gray-100"/>

                        {/* Toggles */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-gray-600 flex items-center gap-1.5"><Pin className="w-3 h-3 text-amber-500"/> Ghim</span>
                                <Switch checked={form.isPinned} onCheckedChange={(v) => updateForm("isPinned", v)}/>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-gray-600 flex items-center gap-1.5"><Star className="w-3 h-3 text-yellow-500"/> Nổi bật</span>
                                <Switch checked={form.isFeatured} onCheckedChange={(v) => updateForm("isFeatured", v)}/>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"/>

                        {/* Cover preview */}
                        {form.coverImage ? (
                            <img src={form.coverImage} alt="" className="w-full h-16 object-cover rounded-md border border-gray-200"/>
                        ) : (
                            <button onClick={() => fileInputRef.current?.click()}
                                className="w-full h-14 rounded-md border border-dashed border-gray-300 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors">
                                <ImageIcon className="w-3.5 h-3.5"/> Thêm ảnh bìa
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
