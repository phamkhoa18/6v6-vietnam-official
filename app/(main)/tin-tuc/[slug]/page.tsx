"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, Eye, Tag, Share2, Link2, MessageCircle,
    Newspaper, ChevronRight, Loader2, Check,
    TrendingUp, ArrowUp, ArrowRight, X, Flame
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
    const [shareModalOpen, setShareModalOpen] = useState(false);

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

    const handleSharePlatform = (platform: string) => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);
        let shareUrl = "";
        
        switch (platform) {
            case "facebook": shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
            case "twitter": shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`; break;
            case "zalo": shareUrl = `https://zalo.me/share?url=${url}`; break;
            case "linkedin": shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
        }
        
        if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=500");
    };

    const timeAgo = (date: string) => {
        try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi }); } catch { return ""; }
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

    // Split related posts: First 5 for Sidebar (Trending), Next 3 for Bottom (Related)
    // If not enough posts, we just reuse them to show the UI
    const trendingPosts = related.slice(0, 5);
    const bottomRelatedPosts = related.length > 5 ? related.slice(5, 8) : related.slice(0, 3);

    return (
        <div className="min-h-screen bg-white pt-[72px] font-sans pb-16">
            {/* Reading Progress Bar (Fixed below Navbar) */}
            <div className="fixed top-[72px] left-0 right-0 h-[3px] bg-transparent z-50">
                <div className="h-full bg-gradient-to-r from-efb-red to-efb-red-dark transition-all duration-150 ease-out" style={{ width: `${readProgress}%` }} />
            </div>

            <div className="max-w-[1200px] mx-auto px-4 lg:px-6 pt-4">
                
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-5 overflow-hidden">
                    <Link href="/" className="font-medium hover:text-efb-red transition-colors flex-shrink-0">Trang chủ</Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <Link href="/tin-tuc" className="font-medium hover:text-efb-red transition-colors flex-shrink-0">Tin tức</Link>
                    {post.categoryRef && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                            <Link href={`/tin-tuc?category=${post.categoryRef.slug || post.category}`} className="font-medium hover:text-efb-red transition-colors flex-shrink-0">
                                {post.categoryRef.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-gray-600 font-medium truncate">{post.title}</span>
                </nav>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* ===== LEFT COLUMN: Main Article ===== */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8">
                        <article>
                            {/* Article Header */}
                            <header className="mb-6">
                                <h1 className="text-3xl lg:text-[34px] font-semibold text-gray-900 leading-[1.3] mb-4">
                                    {post.title}
                                </h1>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-gray-100">
                                    {/* Author & Time */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            {post.author?.avatar ? (
                                                <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-efb-red flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                                    {(post.author?.name || "A").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-[13px] font-semibold text-gray-800 line-clamp-1">{post.author?.name || "Admin"}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                                            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 whitespace-nowrap">
                                                <Clock className="w-3.5 h-3.5" />
                                                {timeAgo(post.publishedAt || post.createdAt)}
                                            </div>
                                            {post.views > 0 && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 whitespace-nowrap">
                                                        <Eye className="w-3.5 h-3.5" /> {post.views} lượt xem
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Horizontal Share Buttons (Mobile/Tablet fallback, also visible on desktop) */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setShareModalOpen(true)} className="w-8 h-8 rounded-full bg-red-50 text-efb-red hover:bg-efb-red hover:text-white flex items-center justify-center transition-all">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={copyLink} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-all">
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {/* Sapo (Excerpt) */}
                            {post.excerpt && (
                                <p className="text-[16px] lg:text-[18px] font-medium text-gray-700 leading-relaxed mb-6">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Main Layout Grid inside Article for Vertical Share Bar */}
                            <div className="relative flex gap-6">
                                {/* Vertical Share Bar (Sticky on Desktop) */}
                                <div className="hidden md:block w-[40px] flex-shrink-0">
                                    <div className="sticky top-[100px] flex flex-col gap-3">
                                        <div className="text-[10px] font-semibold text-gray-400 uppercase text-center mb-1">Share</div>
                                        <button onClick={() => setShareModalOpen(true)} className="w-10 h-10 rounded-full bg-red-50 text-efb-red hover:bg-efb-red hover:text-white flex items-center justify-center transition-all shadow-sm">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={copyLink} className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-all group relative">
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
                                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Copy Link</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 min-w-0">
                                    {/* Cover Image */}
                                    {post.coverImage && (
                                        <figure className="mb-8">
                                            <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                                                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                            </div>
                                            <figcaption className="mt-2 text-[13px] text-gray-500 text-center italic">
                                                Ảnh minh họa: 6v6 Vietnam Official
                                            </figcaption>
                                        </figure>
                                    )}

                                    {/* HTML Content */}
                                    <div
                                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 prose-p:text-gray-800 prose-p:leading-[1.8] prose-p:text-[17px] prose-a:text-efb-red prose-a:font-medium hover:prose-a:underline prose-img:rounded-xl prose-img:mx-auto prose-blockquote:border-l-4 prose-blockquote:border-efb-red prose-blockquote:bg-gray-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:rounded-r-xl prose-strong:text-gray-900 prose-li:text-gray-800"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                    />
                                    
                                    {/* Tags */}
                                    {post.tags?.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap pt-8 mt-8 border-t border-gray-100">
                                            <Tag className="w-4 h-4 text-gray-400" />
                                            <span className="text-[13px] font-semibold text-gray-900 uppercase mr-1">Chủ đề:</span>
                                            {post.tags.map((tag: string, i: number) => (
                                                <span key={i} className="text-[12px] font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-efb-red hover:text-white transition-colors cursor-pointer">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* ===== BOTTOM SECTION: RELATED POSTS ===== */}
                            {bottomRelatedPosts.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1.5 h-6 bg-efb-red rounded-sm" />
                                        <h3 className="text-[18px] font-semibold text-gray-900 uppercase">Bài viết liên quan</h3>
                                    </div>
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {bottomRelatedPosts.map((rp: any) => (
                                            <Link key={`bottom-${rp._id}`} href={`/tin-tuc/${rp.slug}`} className="group block">
                                                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
                                                    {rp.coverImage ? (
                                                        <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <Newspaper className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                                </div>
                                                <h4 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-efb-red transition-colors mb-1.5">
                                                    {rp.title}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(rp.publishedAt || rp.createdAt)}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </article>
                    </motion.div>

                    {/* ===== RIGHT COLUMN: Sidebar ===== */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-[96px] space-y-8">
                            
                            {/* Tin nổi bật — Sports Style */}
                            {trendingPosts.length > 0 && (
                                <div className="rounded-xl overflow-hidden shadow-md">
                                    {/* Header — dark sports bar */}
                                    <div className="bg-[#0F172A] px-5 py-3.5 flex items-center gap-2.5 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-efb-red" />
                                        <Flame className="w-4.5 h-4.5 text-efb-gold" />
                                        <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">Tin nổi bật</h3>
                                    </div>
                                    {/* List */}
                                    <div className="bg-white">
                                        {trendingPosts.map((rp: any, i: number) => (
                                            <Link key={`sidebar-${rp._id}`} href={`/tin-tuc/${rp.slug}`}
                                                className={`group flex items-start gap-3 px-4 py-3.5 hover:bg-red-50/50 transition-colors ${i < trendingPosts.length - 1 ? 'border-b border-gray-100' : ''}`}
                                            >
                                                <span className={`text-[20px] font-extrabold leading-none mt-2 flex-shrink-0 ${i < 3 ? 'text-efb-red' : 'text-gray-300'}`}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    {rp.coverImage ? (
                                                        <img src={rp.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                            <Newspaper className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors mb-1">
                                                        {rp.title}
                                                    </h4>
                                                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {timeAgo(rp.publishedAt || rp.createdAt)}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Promotional Banner */}
                            <div className="bg-gradient-to-br from-[#0F172A] to-gray-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg border border-gray-800">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-efb-red/20 rounded-full blur-2xl" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-efb-gold/20 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-semibold mb-2 text-efb-gold">Giải Đấu 6v6</h3>
                                    <p className="text-sm text-gray-300 font-medium leading-relaxed mb-5">Đăng ký tham gia hệ thống giải đấu bóng đá phong trào chuyên nghiệp nhất Việt Nam.</p>
                                    <Link href="/giai-dau" className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-efb-red text-white text-sm font-semibold rounded-lg hover:bg-efb-red-light transition-all">
                                        Đăng ký ngay <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Apple-style Premium Share Modal */}
            <AnimatePresence>
                {shareModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
                        {/* Glassmorphism Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            transition={{ duration: 0.2 }}
                            onClick={() => setShareModalOpen(false)} 
                            className="absolute inset-0 bg-black/40 backdrop-blur-md" 
                        />
                        
                        {/* Modal Panel (Apple Bottom Sheet on Mobile, Centered on Desktop) */}
                        <motion.div 
                            initial={{ opacity: 0, y: "100%" }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: "100%" }} 
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/20 pb-safe sm:pb-0"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 relative z-10">
                                <h3 className="text-[17px] font-semibold text-gray-900">Chia sẻ bài viết</h3>
                                <button onClick={() => setShareModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {/* SEO Card Preview */}
                            <div className="px-6 pb-6">
                                <div className="flex gap-3.5 bg-[#F2F2F7]/80 p-3.5 rounded-2xl border border-black/5">
                                    {post.coverImage ? (
                                        <div className="w-[60px] h-[60px] rounded-[14px] overflow-hidden flex-shrink-0 bg-white shadow-sm border border-black/5">
                                            <img src={post.coverImage} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-[60px] h-[60px] rounded-[14px] bg-white shadow-sm border border-black/5 flex items-center justify-center flex-shrink-0">
                                            <Newspaper className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-[11px] font-medium text-gray-500 uppercase mb-0.5">6v6vietnam.vn</p>
                                        <h4 className="text-[14px] font-semibold text-gray-900 line-clamp-2 leading-snug">{post.title}</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Share Options Grid */}
                            <div className="px-6 pb-8 sm:pb-8">
                                <div className="grid grid-cols-4 gap-4">
                                    <button onClick={() => handleSharePlatform('facebook')} className="flex flex-col items-center gap-2 group">
                                        <div className="w-14 h-14 rounded-[16px] bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                                            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-600">Facebook</span>
                                    </button>
                                    <button onClick={() => handleSharePlatform('zalo')} className="flex flex-col items-center gap-2 group">
                                        <div className="w-14 h-14 rounded-[16px] bg-[#0068FF] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                                            <MessageCircle className="w-7 h-7" />
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-600">Zalo</span>
                                    </button>
                                    <button onClick={() => handleSharePlatform('twitter')} className="flex flex-col items-center gap-2 group">
                                        <div className="w-14 h-14 rounded-[16px] bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.126H5.078z"/></svg>
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-600">X (Twitter)</span>
                                    </button>
                                    <button onClick={copyLink} className="flex flex-col items-center gap-2 group relative">
                                        <div className="w-14 h-14 rounded-[16px] bg-[#F2F2F7] text-gray-700 flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-105 transition-transform duration-300">
                                            {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Link2 className="w-6 h-6" />}
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-600">{copied ? "Đã chép" : "Sao chép"}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Scroll top */}
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-6 right-6 w-11 h-11 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-efb-red transition-colors z-40"
                >
                    <ArrowUp className="w-5 h-5" />
                </motion.button>
            )}
        </div>
    );
}
