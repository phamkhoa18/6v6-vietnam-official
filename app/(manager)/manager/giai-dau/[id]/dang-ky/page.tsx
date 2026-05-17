"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle2, XCircle, Search, Loader2, Shield, User, Ban, RefreshCw, UserX, UserPlus, Camera, ImageIcon, X, FileSpreadsheet, UploadCloud, Search as SearchIcon, Plus, Clock, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const statusCfg: Record<string, { label: string; bg: string }> = {
    active: { label: "ĐÃ DUYỆT", bg: "bg-emerald-100 text-emerald-700" },
    eliminated: { label: "BỊ LOẠI", bg: "bg-gray-100 text-gray-600" },
    withdrawn: { label: "RÚT LUI", bg: "bg-amber-100 text-amber-700" },
    disqualified: { label: "TRUẤT QUYỀN", bg: "bg-red-100 text-red-700" },
};

export default function TournamentRegistration() {
    const { id } = useParams() as { id: string };
    const [activeMainTab, setActiveMainTab] = useState<"registrations" | "participants">("registrations");
    const [search, setSearch] = useState("");
    const [participants, setParticipants] = useState<any[]>([]);
    const [gameMode, setGameMode] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState({ name: "", shortName: "", logo: "" });
    const [addTab, setAddTab] = useState<"manual" | "excel">("manual");
    const [roster, setRoster] = useState<{ userId: string; isNew: boolean; name: string; phone: string; avatar: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Registration approval state
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [regLoading, setRegLoading] = useState(false);
    const [regFilter, setRegFilter] = useState("pending");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    
    const maxSlots = gameMode === "1v1" || gameMode === "6v6" ? 1 : parseInt(gameMode.charAt(0)) || 1;

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const token = localStorage.getItem("6v6_token");
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }).then(r => r.json());
                if (res.success) setSearchResults(res.data);
            } catch {}
            finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectUser = (user: any) => {
        if (roster.find(r => r.userId === user._id)) {
            toast.error("VĐV này đã có trong danh sách!");
            return;
        }
        if (roster.length >= maxSlots) {
            toast.error(`Chế độ này chỉ cho phép tối đa ${maxSlots} VĐV`);
            return;
        }
        setRoster([...roster, { userId: user._id, isNew: false, name: user.name, phone: user.phone || "", avatar: user.avatar || "" }]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleQuickCreate = () => {
        if (roster.length >= maxSlots) {
            toast.error(`Chế độ này chỉ cho phép tối đa ${maxSlots} VĐV`);
            return;
        }
        if (!searchQuery.trim()) {
            toast.error("Vui lòng nhập tên VĐV");
            return;
        }
        setRoster([...roster, { userId: `new_${Date.now()}`, isNew: true, name: searchQuery, phone: "", avatar: "" }]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleRemoveRoster = (index: number) => {
        setRoster(roster.filter((_, i) => i !== index));
    };

    const handleUpdateRosterPhone = (index: number, phone: string) => {
        const newRoster = [...roster];
        newRoster[index].phone = phone;
        setRoster(newRoster);
    };


    const load = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/participants`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }).then(r => r.json());
            if (res.success) { setParticipants(res.data.participants); setGameMode(res.data.gameMode); }
        } catch { toast.error("Không thể tải"); }
        finally { setIsLoading(false); }
    };

    const loadRegistrations = async () => {
        setRegLoading(true);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/registrations?status=${regFilter}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }).then(r => r.json());
            if (res.success) setRegistrations(res.data);
        } catch { toast.error("Không thể tải đăng ký"); }
        finally { setRegLoading(false); }
    };

    const handleApprove = async (regId: string) => {
        setProcessingId(regId);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/registrations`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ registrationId: regId, action: "approve" }),
            }).then(r => r.json());
            if (res.success) {
                toast.success("Đã duyệt thành công!");
                loadRegistrations();
                load(); // refresh participants
            } else toast.error(res.message);
        } catch { toast.error("Lỗi"); }
        finally { setProcessingId(null); }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setProcessingId(rejectModal.id);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/registrations`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ registrationId: rejectModal.id, action: "reject", rejectionReason: rejectReason || "Không đạt yêu cầu" }),
            }).then(r => r.json());
            if (res.success) {
                toast.success("Đã từ chối");
                setRejectModal(null);
                setRejectReason("");
                loadRegistrations();
            } else toast.error(res.message);
        } catch { toast.error("Lỗi"); }
        finally { setProcessingId(null); }
    };

    useEffect(() => { load(); loadRegistrations(); }, [id]);
    useEffect(() => { loadRegistrations(); }, [regFilter]);

    const updateStatus = async (pid: string, status: string) => {
        setUpdatingId(pid);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/participants`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ participantId: pid, status }),
            }).then(r => r.json());
            if (res.success) {
                setParticipants(prev => prev.map(p => p._id === pid ? { ...p, status } : p));
                toast.success("Đã cập nhật");
            } else toast.error(res.message);
        } catch { toast.error("Lỗi"); }
        finally { setUpdatingId(null); }
    };

    
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isTeam = gameMode !== "1v1";
        
        if (isTeam && !addForm.name) {
            toast.error("Vui lòng điền tên đội bóng!");
            return;
        }
        if (roster.length < maxSlots) {
            toast.error(`Vui lòng chọn đủ ${maxSlots} VĐV để đăng ký!`);
            return;
        }

        setIsAdding(true);
        try {
            const token = localStorage.getItem("6v6_token");
            const res = await fetch(`/api/tournaments/${id}/participants`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({
                    name: isTeam ? addForm.name : roster[0].name,
                    shortName: addForm.shortName,
                    logo: addForm.logo,
                    players: roster
                }),
            }).then(r => r.json());

            if (res.success) {
                setParticipants([res.data.participant, ...participants]);
                setShowAddModal(false);
                setAddForm({ name: "", shortName: "", logo: "" });
                setRoster([]);
                toast.success("Đã thêm thành công!");
            } else {
                toast.error(res.message || "Có lỗi xảy ra");
            }
        } catch {
            toast.error("Lỗi kết nối");
        } finally {
            setIsAdding(false);
        }
    };

    const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAddForm(prev => ({ ...prev, logo: url }));
        }
    };

    const filtered = useMemo(() => {
        let r = [...participants];
        if (statusFilter !== "all") r = r.filter(p => p.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(p => gameMode === "1v1"
                ? (p.user?.name?.toLowerCase().includes(q) || p.user?.nickname?.toLowerCase().includes(q))
                : (p.name?.toLowerCase().includes(q) || p.captain?.name?.toLowerCase().includes(q)));
        }
        return r;
    }, [participants, statusFilter, search, gameMode]);

    const stats = useMemo(() => ({
        total: participants.length,
        active: participants.filter(p => p.status === "active").length,
        withdrawn: participants.filter(p => p.status === "withdrawn").length,
        eliminated: participants.filter(p => p.status === "eliminated").length,
    }), [participants]);

    const isTeam = gameMode !== "1v1";

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-efb-red" /></div>;

    const pendingCount = registrations.filter(r => r.status === "pending").length;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Quản lý đăng ký</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{isTeam ? "Duyệt và quản lý đội tham gia" : "Duyệt và quản lý cầu thủ"}</p>
                </div>
                <div className="flex items-center gap-2">
                    {activeMainTab === "participants" && <Button onClick={() => setShowAddModal(true)} className="h-9 rounded-xl bg-efb-red hover:bg-red-700 text-white shadow-sm"><UserPlus className="w-4 h-4 mr-1.5" /> Thêm thủ công</Button>}
                    <Button variant="outline" onClick={() => { load(); loadRegistrations(); }} className="h-9 rounded-xl"><RefreshCw className="w-4 h-4 mr-1.5" /> Làm mới</Button>
                </div>
            </div>

            {/* Main Tab Switch */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setActiveMainTab("registrations")} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeMainTab === "registrations" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    <Clock className="w-4 h-4" /> Yêu cầu đăng ký
                    {pendingCount > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">{pendingCount}</span>}
                </button>
                <button onClick={() => setActiveMainTab("participants")} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeMainTab === "participants" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    <Users className="w-4 h-4" /> Đội tham gia ({participants.length})
                </button>
            </div>

            {/* REGISTRATIONS TAB */}
            {activeMainTab === "registrations" && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                        {[{ k: "pending", l: "Chờ duyệt" }, { k: "approved", l: "Đã duyệt" }, { k: "rejected", l: "Bị từ chối" }, { k: "all", l: "Tất cả" }].map(f => (
                            <button key={f.k} onClick={() => setRegFilter(f.k)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${regFilter === f.k ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>{f.l}</button>
                        ))}
                    </div>

                    {regLoading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-efb-red" /></div>
                    ) : registrations.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Không có yêu cầu</h3>
                            <p className="text-sm text-gray-400">Chưa có ai đăng ký hoặc tất cả đã được xử lý</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cầu thủ</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tên đội</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Đồng đội</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ngày ĐK</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {registrations.map((reg: any, i: number) => (
                                            <tr key={reg._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                            {reg.user?.avatar ? <img src={reg.user.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-gray-900 truncate">{reg.playerName || reg.user?.name || "N/A"}</div>
                                                            {reg.user?.phone && <div className="text-[11px] text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{reg.user.phone}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-gray-700 font-medium">{reg.teamName || "—"}</td>
                                                <td className="px-5 py-3 text-gray-600 text-xs">
                                                    {reg.player2 ? <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[11px] font-medium">{reg.player2.name}</span> : "—"}
                                                    {reg.player3 && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[11px] font-medium ml-1">{reg.player3.name}</span>}
                                                </td>
                                                <td className="px-5 py-3 text-gray-500 text-xs">
                                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(reg.createdAt).toLocaleDateString('vi-VN')}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                                        reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        reg.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {reg.status === 'pending' ? 'CHỜ DUYỆT' : reg.status === 'approved' ? 'ĐÃ DUYỆT' : reg.status === 'rejected' ? 'TỪ CHỐI' : reg.status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    {reg.status === 'pending' && (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => handleApprove(reg._id)} disabled={processingId === reg._id} className="h-7 text-[10px] text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                                                {processingId === reg._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-0.5" />}Duyệt
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => setRejectModal({ id: reg._id, name: reg.playerName || reg.user?.name || "" })} disabled={processingId === reg._id} className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50">
                                                                <XCircle className="w-3 h-3 mr-0.5" />Từ chối
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {reg.status === 'rejected' && reg.rejectionReason && (
                                                        <span className="text-[11px] text-red-400 italic">{reg.rejectionReason}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PARTICIPANTS TAB — existing content */}
            {activeMainTab === "participants" && (<>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Tổng", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Đã duyệt", value: stats.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Rút lui", value: stats.withdrawn, icon: UserX, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Bị loại", value: stats.eliminated, icon: Ban, color: "text-red-600", bg: "bg-red-50" },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                        <div><div className="text-xl font-bold text-gray-900">{s.value}</div><div className="text-[10px] text-gray-400 font-medium uppercase">{s.label}</div></div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={isTeam ? "Tìm đội..." : "Tìm cầu thủ..."} className="pl-9 h-10" /></div>
                <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
                    {[{ key: "all", label: "Tất cả" }, { key: "active", label: "Đã duyệt" }, { key: "withdrawn", label: "Rút lui" }].map(f => (
                        <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${statusFilter === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>{f.label}</button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{search ? "Không tìm thấy" : "Chưa có đăng ký"}</h3>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{isTeam ? "Đội" : "Cầu thủ"}</th>
                                    {isTeam && <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Đội trưởng</th>}
                                    {isTeam && <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">SL</th>}
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Seed</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bảng</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((p, i) => (
                                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    {isTeam ? <Shield className="w-4 h-4 text-gray-400" /> : <User className="w-4 h-4 text-gray-400" />}
                                                </div>
                                                <span className="font-semibold text-gray-900">{isTeam ? p.name : (p.user?.name || "N/A")}</span>
                                            </div>
                                        </td>
                                        {isTeam && <td className="px-5 py-3 text-gray-600">{p.captain?.name || "—"}</td>}
                                        {isTeam && <td className="px-5 py-3 text-gray-600">{p.members?.length || 0}</td>}
                                        <td className="px-5 py-3 text-gray-600 font-medium">{p.seed || "—"}</td>
                                        <td className="px-5 py-3">{p.group ? <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold">Bảng {p.group}</span> : "—"}</td>
                                        <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusCfg[p.status]?.bg || "bg-gray-100"}`}>{statusCfg[p.status]?.label || p.status}</span></td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {p.status !== "active" && <Button variant="outline" size="sm" onClick={() => updateStatus(p._id, "active")} disabled={updatingId === p._id} className="h-7 text-[10px] text-emerald-600 border-emerald-200 hover:bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-0.5" />Duyệt</Button>}
                                                {p.status === "active" && <Button variant="outline" size="sm" onClick={() => updateStatus(p._id, "withdrawn")} disabled={updatingId === p._id} className="h-7 text-[10px] text-amber-600 border-amber-200 hover:bg-amber-50"><XCircle className="w-3 h-3 mr-0.5" />Hủy</Button>}
                                                {p.status !== "disqualified" && <Button variant="outline" size="sm" onClick={() => updateStatus(p._id, "disqualified")} disabled={updatingId === p._id} className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50"><Ban className="w-3 h-3" /></Button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </>)}

            
            {/* Modal Thêm */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isAdding && setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Thêm {gameMode === "1v1" ? "Cầu thủ" : "Đội bóng"} <span className="text-sm font-normal text-efb-red px-2 py-0.5 bg-red-50 rounded-full ml-2">{gameMode}</span></h2>
                                        <p className="text-[13px] text-gray-500 mt-0.5">Xây dựng đội hình và liên kết tài khoản</p>
                                    </div>
                                    <button
                                        onClick={() => !isAdding && setShowAddModal(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button 
                                        type="button"
                                        onClick={() => setAddTab("manual")}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${addTab === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Thêm thủ công
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAddTab("excel")}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${addTab === "excel" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        <FileSpreadsheet className="w-4 h-4" /> Từ file Excel
                                    </button>
                                </div>
                            </div>
                            
                            {addTab === "manual" ? (
                                <form id="add-form" onSubmit={handleAddSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 custom-scrollbar">
                                    
                                    {/* THÔNG TIN ĐỘI BÓNG (NẾU KHÔNG PHẢI 1V1) */}
                                    {gameMode !== "1v1" && (
                                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Shield className="w-4 h-4 text-efb-red" /> Thông tin Đội</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-2 space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-700">Tên Đội bóng <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        value={addForm.name}
                                                        onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                                                        placeholder="Nhập tên đội..."
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-700">Viết tắt</label>
                                                    <input 
                                                        type="text" 
                                                        value={addForm.shortName}
                                                        onChange={(e) => setAddForm({...addForm, shortName: e.target.value.toUpperCase().slice(0, 4)})}
                                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase bg-white"
                                                        placeholder="VD: FC"
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-700">Logo Đội bóng <span className="text-gray-400 font-normal">(Tùy chọn)</span></label>
                                                <div className="flex items-start gap-4">
                                                    {addForm.logo ? (
                                                        <div className="relative">
                                                            <img src={addForm.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-200 shadow-sm p-1 bg-white" />
                                                            <button type="button" onClick={() => setAddForm({...addForm, logo: ''})} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer">
                                                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-white">
                                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-600">Tải logo lên</span>
                                                            </div>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DANH SÁCH VĐV (ROSTER) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Đội hình ({roster.length}/{maxSlots})</h3>
                                            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded uppercase">{gameMode === "6v6" ? "Chỉ cần Đội trưởng" : "Phải đủ Slots"}</span>
                                        </div>

                                        {/* Thanh tìm kiếm */}
                                        {roster.length < maxSlots && (
                                            <div className="relative">
                                                <div className="relative">
                                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                                        placeholder="Tìm VĐV bằng SĐT, Mã Player ID hoặc Tên..."
                                                    />
                                                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
                                                </div>

                                                {/* Dropdown Kết quả */}
                                                {searchQuery && !isSearching && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-10 max-h-[250px] overflow-y-auto">
                                                        {searchResults.length > 0 ? (
                                                            <div className="py-1">
                                                                {searchResults.map((user) => (
                                                                    <button
                                                                        key={user._id}
                                                                        type="button"
                                                                        onClick={() => handleSelectUser(user)}
                                                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                                                    >
                                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                                            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                                                                {user.playerId && <span className="bg-gray-100 px-1.5 rounded">{user.playerId}</span>}
                                                                                {user.phone && <span>{user.phone}</span>}
                                                                            </div>
                                                                        </div>
                                                                        <Plus className="w-4 h-4 text-blue-500" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 text-center">
                                                                <p className="text-sm text-gray-500 mb-3">Không tìm thấy VĐV nào trong hệ thống.</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleQuickCreate}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                                                                >
                                                                    <UserPlus className="w-4 h-4" /> Tạo nhanh VĐV "{searchQuery}"
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Danh sách Slots đã chọn */}
                                        <div className="space-y-2 mt-3">
                                            {roster.map((player, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm relative group">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                                                        {player.avatar ? <img src={player.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{player.name}</p>
                                                            {idx === 0 && gameMode !== "1v1" && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Đội trưởng</span>}
                                                            {player.isNew && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Tạo mới</span>}
                                                        </div>
                                                        {player.isNew ? (
                                                            <input 
                                                                type="tel" 
                                                                value={player.phone}
                                                                onChange={(e) => handleUpdateRosterPhone(idx, e.target.value)}
                                                                className="mt-1 w-full max-w-[200px] border-b border-gray-200 pb-0.5 text-xs text-gray-600 focus:outline-none focus:border-blue-500 placeholder:text-gray-300"
                                                                placeholder="Nhập SĐT..."
                                                                required
                                                            />
                                                        ) : (
                                                            <p className="text-xs text-gray-500 mt-0.5">{player.phone || "Không có SĐT"}</p>
                                                        )}
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveRoster(idx)}
                                                        className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {roster.length === 0 && (
                                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <p className="text-sm text-gray-400">Chưa chọn VĐV nào</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-5 sm:p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-100">
                                        <FileSpreadsheet className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">Tải lên danh sách Excel</h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-[250px]">Chức năng đang được phát triển. Vui lòng sử dụng tính năng Thêm thủ công tạm thời.</p>
                                    </div>
                                    <Button variant="outline" className="mt-2 text-emerald-700 border-emerald-200 bg-emerald-50" onClick={() => toast.info("Tính năng đang phát triển")}><UploadCloud className="w-4 h-4 mr-2" /> Chọn file .xlsx</Button>
                                </div>
                            )}

                            <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="px-5 h-10 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                    disabled={isAdding}
                                >
                                    Hủy
                                </button>
                                {addTab === "manual" && (
                                    <button 
                                        type="submit"
                                        form="add-form"
                                        disabled={isAdding}
                                        className="px-6 h-10 rounded-xl text-sm font-semibold text-white bg-emerald-600 shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isAdding ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                                        ) : (
                                            "Lưu thay đổi"
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {rejectModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setRejectModal(null)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-base font-bold text-gray-900">Từ chối đăng ký</h3>
                                <p className="text-sm text-gray-500 mt-1">Từ chối đăng ký của <strong>{rejectModal.name}</strong></p>
                            </div>
                            <div className="p-5 space-y-3">
                                <label className="text-xs font-semibold text-gray-700">Lý do từ chối</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    placeholder="VD: Không đủ điều kiện tham gia..."
                                />
                            </div>
                            <div className="p-5 border-t border-gray-100 flex gap-3">
                                <Button variant="outline" onClick={() => setRejectModal(null)} className="flex-1 rounded-xl h-11">Hủy</Button>
                                <Button onClick={handleReject} disabled={processingId === rejectModal.id} className="flex-1 rounded-xl h-11 bg-red-600 text-white hover:bg-red-700">
                                    {processingId === rejectModal.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}Từ chối
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
