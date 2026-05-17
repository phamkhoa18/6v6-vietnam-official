"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Newspaper, ArrowRight, Clock, Eye, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const timeAgo = (d: string) => {
    try { return formatDistanceToNow(new Date(d), { addSuffix: true, locale: vi }); } catch { return ""; }
};

export function NewsShowcase() {
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/posts?limit=7&status=published")
            .then(r => r.json())
            .then(data => { if (data.success) setPosts(data.data.posts || []); })
            .catch(() => {});
    }, []);

    if (posts.length === 0) return null;

    const hero = posts[0];
    const side = posts.slice(1, 3);
    const list = posts.slice(3, 7);

    return (
        <section className="py-16 lg:py-24 bg-white relative">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3"><div className="w-1 h-6 rounded-full bg-efb-red" /><Flame className="w-4 h-4 text-efb-red" /><span className="text-xs font-semibold text-efb-red uppercase tracking-wider">Tin mới nhất</span></div>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Tin tức & Cập nhật</h2>
                    </div>
                    <Link href="/tin-tuc" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-efb-red hover:text-white hover:bg-efb-red border border-efb-red/20 hover:border-efb-red rounded-lg transition-all group">Xem tất cả<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></Link>
                </motion.div>
                <div className="grid lg:grid-cols-12 gap-5">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7">
                        <Link href={`/tin-tuc/${hero.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[16/10]">
                            {hero.coverImage ? (
                                <img src={hero.coverImage} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center"><Newspaper className="w-16 h-16 text-white/10" /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
                                {hero.isPinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-efb-red text-white text-[10px] font-semibold rounded uppercase tracking-wider mb-2.5"><Flame className="w-2.5 h-2.5" /> HOT</span>}
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4">{hero.title}</h3>
                                {hero.excerpt && <p className="text-sm text-white/60 line-clamp-2 mb-3 max-w-lg">{hero.excerpt}</p>}
                                <div className="flex items-center gap-3 text-[11px] text-white/40">
                                    <span className="font-medium text-white/60">{hero.author?.name || "Admin"}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(hero.publishedAt || hero.createdAt)}</span>
                                    {hero.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {hero.views}</span>}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        {side.map((p, i) => (
                            <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }} className="flex-1">
                                <Link href={`/tin-tuc/${p.slug}`} className="group block relative rounded-xl overflow-hidden h-full min-h-[160px]">
                                    {p.coverImage ? (
                                        <img src={p.coverImage} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"><Newspaper className="w-10 h-10 text-white/10" /></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">{p.title}</h4>
                                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/40"><span>{timeAgo(p.publishedAt || p.createdAt)}</span><span>·</span><span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {p.views || 0}</span></div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
                {list.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-5">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {list.map((p) => (
                                <Link key={p._id} href={`/tin-tuc/${p.slug}`} className="group flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-gray-100/80 border border-transparent hover:border-gray-100 transition-all duration-300">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                        {p.coverImage ? (
                                            <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"><Newspaper className="w-5 h-5 text-gray-400" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h5 className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-efb-red transition-colors">{p.title}</h5>
                                        <span className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {timeAgo(p.publishedAt || p.createdAt)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
                <div className="mt-6 sm:hidden text-center"><Link href="/tin-tuc" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-efb-red border border-efb-red/20 rounded-lg hover:bg-efb-red/5 transition-colors">Xem tất cả tin tức <ArrowRight className="w-3.5 h-3.5" /></Link></div>
            </div>
        </section>
    );
}
