"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, Clock, Eye, Calendar, Tag, Share2,
    Newspaper, Pin, Star, ChevronRight, Loader2, Copy, Check,
    TrendingUp, Flame, ArrowUp, ArrowRight
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readProgress, setReadProgress] = useState(0);

    useEffect(() => { loadPost(); }, [slug]);
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 600);
            const winH = window.innerHeight;
            const docH = document.documentElement.scrollHeight - winH;
            setReadProgress(docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const loadPost = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/posts/${slug}`);
            const data = await res.json();
            if (data.success) {
                setPost(data.data.post);
                setRelated(data.data.related || []);
            } else { router.push("/tin-tuc"); }
        } catch { router.push("/tin-tuc"); }
        finally { setIsLoading(false); }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const timeAgo = (date: string) => {
        try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi }); } catch { return ""; }
    };
    const formatDate = (date: string) => {
        try { return format(new Date(date), "dd MMMM, yyyy", { locale: vi }); } catch { return ""; }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-efb-red mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-16">
            {/* Reading Progress */}
            <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-100 z-50">
                <div className="h-full bg-gradient-to-r from-efb-red to-efb-red-light transition-all duration-150 ease-out" style={{ width: `${readProgress}%` }} />
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
                    <div className="flex items-center gap-2 h-10 text-[11px]">
                        <Link href="/" className="text-gray-400 hover:text-efb-red transition-colors">Trang chủ</Link>
                        <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
                        <Link href="/tin-tuc" className="text-gray-400 hover:text-efb-red transition-colors">Tin tức</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Article */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
                        <article className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            {/* Cover */}
                            {post.coverImage && (
                                <div className="relative aspect-[16/8] overflow-hidden">
                                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                </div>
                            )}

                            {/* Header */}
                            <div className="p-5 lg:p-7 pb-0">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    {post.isPinned && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-efb-red text-white text-[10px] font-medium rounded uppercase tracking-wider">
                                            <Flame className="w-2.5 h-2.5" /> NÓNG
                                        </span>
                                    )}
                                    {post.isFeatured && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-efb-gold text-gray-900 text-[10px] font-medium rounded uppercase tracking-wider">
                                            <Star className="w-2.5 h-2.5 fill-current" /> NỔI BẬT
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl lg:text-[28px] font-semibold text-gray-900 leading-tight mb-3">{post.title}</h1>

                                {post.excerpt && (
                                    <p className="text-[15px] text-gray-500 leading-relaxed mb-4 border-l-2 border-efb-red/30 pl-4 italic">{post.excerpt}</p>
                                )}

                                {/* Author */}
                                <div className="flex items-center justify-between pb-5 border-b border-gray-100 flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        {post.author?.avatar ? (
                                            <img src={post.author.avatar} alt={post.author.name} className="w-9 h-9 rounded-full border-2 border-gray-100 object-cover" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center text-white font-medium text-sm">
                                                {(post.author?.name || "A").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{post.author?.name || "Admin"}</p>
                                            <p className="text-[11px] text-gray-400 flex items-center gap-2">
                                                <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {formatDate(post.publishedAt || post.createdAt)}</span>
                                                <span>·</span>
                                                <span>{timeAgo(post.publishedAt || post.createdAt)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views || 0}</span>
                                        {post.readingTime > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime} phút</span>}
                                        <button onClick={copyLink} className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 lg:px-7 py-6">
                                <div
                                    className="prose prose-sm lg:prose-base max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-l-2 prose-h2:border-efb-red/40 prose-h2:pl-3 prose-p:text-gray-600 prose-p:leading-[1.8] prose-a:text-efb-red prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:mx-auto prose-blockquote:border-l-efb-red prose-strong:text-gray-800 prose-li:text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>

                            {/* Tags */}
                            {post.tags?.length > 0 && (
                                <div className="px-5 lg:px-7 pb-5">
                                    <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-gray-100">
                                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                                        {post.tags.map((tag: string, i: number) => (
                                            <span key={i} className="text-[11px] font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md hover:bg-efb-red/5 hover:text-efb-red transition-colors cursor-default">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share */}
                            <div className="px-5 lg:px-7 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Share2 className="w-3.5 h-3.5 text-gray-400" />
                                    <button onClick={copyLink} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[10px] font-medium text-gray-500 hover:text-efb-red hover:border-efb-red/30 transition-all flex items-center gap-1">
                                        {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Đã copy</> : <><Copy className="w-3 h-3" /> Copy link</>}
                                    </button>
                                </div>
                                <span className="text-[11px] text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views || 0} lượt xem</span>
                            </div>
                        </article>

                        {/* Related */}
                        {related.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-1 h-5 rounded-full bg-efb-red" />
                                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Bài viết liên quan</h2>
                                    </div>
                                    <Link href="/tin-tuc" className="text-[11px] text-efb-red font-medium flex items-center gap-1 hover:underline">
                                        Xem tất cả <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {related.slice(0, 6).map((rp: any) => (
                                        <Link key={rp._id} href={`/tin-tuc/${rp.slug}`} className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                                            <div className="relative aspect-[16/10] overflow-hidden">
                                                {rp.coverImage ? (
                                                    <img src={rp.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Newspaper className="w-8 h-8 text-gray-250" /></div>
                                                )}
                                            </div>
                                            <div className="p-3.5">
                                                <h4 className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors mb-2">{rp.title}</h4>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(rp.publishedAt || rp.createdAt)}</span>
                                                    <span>·</span>
                                                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{rp.views || 0}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-20">
                            <div className="p-4 border-b border-gray-50">
                                <div className="flex items-center gap-2.5 mb-3">
                                    {post.author?.avatar ? (
                                        <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-gray-100 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-efb-red to-efb-red-dark flex items-center justify-center text-white font-medium text-sm">
                                            {(post.author?.name || "A").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{post.author?.name || "Admin"}</p>
                                        <p className="text-[10px] text-gray-400">Tác giả</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-gray-50 rounded-lg py-2">
                                        <p className="text-sm font-semibold text-gray-900">{post.views || 0}</p>
                                        <p className="text-[9px] text-gray-400 uppercase font-medium">Lượt xem</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg py-2">
                                        <p className="text-sm font-semibold text-gray-900">{post.readingTime || 1}</p>
                                        <p className="text-[9px] text-gray-400 uppercase font-medium">Phút đọc</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3">
                                <button onClick={copyLink} className="w-full py-2.5 bg-efb-red/5 text-efb-red text-xs font-medium rounded-lg hover:bg-efb-red/10 transition-colors flex items-center justify-center gap-1.5">
                                    {copied ? <><Check className="w-3.5 h-3.5" /> Đã copy!</> : <><Share2 className="w-3.5 h-3.5" /> Chia sẻ</>}
                                </button>
                            </div>

                            {/* Sidebar related */}
                            {related.length > 0 && (
                                <div className="border-t border-gray-50">
                                    <div className="px-4 py-2.5 flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5 text-efb-red" />
                                        <span className="text-[10px] font-semibold text-gray-900 uppercase tracking-wider">Tin liên quan</span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {related.slice(0, 5).map((rp: any) => (
                                            <Link key={rp._id} href={`/tin-tuc/${rp.slug}`} className="group flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                                                {rp.coverImage ? (
                                                    <img src={rp.coverImage} alt="" className="w-14 h-10 rounded object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-14 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0"><Newspaper className="w-3.5 h-3.5 text-gray-300" /></div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[11px] font-medium text-gray-700 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors">{rp.title}</h4>
                                                    <span className="text-[9px] text-gray-400">{timeAgo(rp.publishedAt || rp.createdAt)}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/tin-tuc" className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 text-xs font-medium text-gray-500 hover:text-efb-red hover:border-efb-red/20 transition-all">
                            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang Tin tức
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll top */}
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-6 right-6 w-10 h-10 bg-efb-red text-white rounded-full shadow-lg flex items-center justify-center hover:bg-efb-red-light transition-colors z-40"
                >
                    <ArrowUp className="w-4 h-4" />
                </motion.button>
            )}
        </div>
    );
}
