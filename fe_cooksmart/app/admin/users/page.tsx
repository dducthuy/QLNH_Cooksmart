'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    CheckCircle,
    X,
    Save,
    RefreshCw,
    ShieldCheck,
    UtensilsCrossed,
    ChefHat,
    KeyRound,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff,
} from 'lucide-react';
import { nguoiDungService } from '@/services/nguoiDung.service';
import { NguoiDung, VaiTro } from '@/types/nguoiDung';

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
const VAI_TRO_CONFIG: Record<VaiTro, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    Admin: {
        label: 'Quản Trị',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: <ShieldCheck size={13} />,
    },
    PhucVu: {
        label: 'Phục Vụ',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: <UtensilsCrossed size={13} />,
    },
    Bep: {
        label: 'Bếp',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: <ChefHat size={13} />,
    },
};

const VAI_TRO_OPTIONS: { value: VaiTro; label: string }[] = [
    { value: 'Admin', label: 'Quản Trị Viên' },
    { value: 'PhucVu', label: 'Nhân Viên Phục Vụ' },
    { value: 'Bep', label: 'Nhân Viên Bếp' },
];

// ─────────────────────────────────────────────
//  Avatar helper
// ─────────────────────────────────────────────
function Avatar({ nguoiDung }: { nguoiDung: NguoiDung }) {
    const initials = (nguoiDung.ho_ten || nguoiDung.ten_dang_nhap).charAt(0).toUpperCase();
    const colorMap: Record<VaiTro, string> = {
        Admin: 'from-purple-500 to-purple-700',
        PhucVu: 'from-blue-500 to-blue-700',
        Bep: 'from-amber-500 to-amber-700',
    };

    return (
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[nguoiDung.vai_tro]} flex items-center justify-center text-white font-black text-base shadow-sm`}>
            {initials}
        </div>
    );
}

// ─────────────────────────────────────────────
//  Toast
// ─────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
    return (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            {msg}
        </div>
    );
}

// ─────────────────────────────────────────────
//  Form Thêm / Sửa
// ─────────────────────────────────────────────
function UserForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    initialData: NguoiDung | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const isEdit = !!initialData;
    const [form, setForm] = useState({
        ten_dang_nhap: initialData?.ten_dang_nhap ?? '',
        ho_ten: initialData?.ho_ten ?? '',
        vai_tro: (initialData?.vai_tro ?? 'PhucVu') as VaiTro,
        mat_khau: '',
    });
    const [showPw, setShowPw] = useState(false);

    const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e] focus:ring-2 focus:ring-[#d9a01e]/10 transition-all placeholder:text-gray-400';
    const labelCls = 'block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            ten_dang_nhap: form.ten_dang_nhap.trim(),
            ho_ten: form.ho_ten.trim() || null,
            vai_tro: form.vai_tro,
        };
        if (!isEdit) payload.mat_khau = form.mat_khau;
        onSubmit(payload);
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">
                        {isEdit ? 'Chỉnh Sửa' : 'Thêm Người Dùng'}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Tên đăng nhập */}
                    <div>
                        <label className={labelCls}>Tên Đăng Nhập <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="VD: nhanvien01"
                            value={form.ten_dang_nhap}
                            onChange={(e) => setForm({ ...form, ten_dang_nhap: e.target.value })}
                            className={inputCls}
                        />
                    </div>

                    {/* Họ tên */}
                    <div>
                        <label className={labelCls}>Họ & Tên</label>
                        <input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={form.ho_ten}
                            onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
                            className={inputCls}
                        />
                    </div>

                    {/* Vai trò */}
                    <div>
                        <label className={labelCls}>Vai Trò <span className="text-red-500">*</span></label>
                        <select
                            value={form.vai_tro}
                            onChange={(e) => setForm({ ...form, vai_tro: e.target.value as VaiTro })}
                            className={`${inputCls} appearance-none cursor-pointer`}
                        >
                            {VAI_TRO_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mật khẩu – chỉ khi tạo mới */}
                    {!isEdit && (
                        <div>
                            <label className={labelCls}>Mật Khẩu <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    placeholder="Ít nhất 6 ký tự"
                                    value={form.mat_khau}
                                    onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
                                    className={`${inputCls} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onCancel} disabled={isSubmitting}
                        className="flex-1 px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                        Hủy
                    </button>
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white hover:shadow-lg hover:shadow-[#d9a01e]/30 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /><span>Lưu</span></>}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Form Đổi Mật Khẩu
// ─────────────────────────────────────────────
function ResetPasswordForm({
    nguoiDung,
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    nguoiDung: NguoiDung;
    onSubmit: (newPw: string) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [pw, setPw] = useState('');
    const [showPw, setShowPw] = useState(false);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">Đặt Lại Mật Khẩu</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Tài khoản: <span className="font-bold text-gray-600">{nguoiDung.ten_dang_nhap}</span></p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all"><X size={18} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onSubmit(pw); }} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Mật Khẩu Mới <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input
                            type={showPw ? 'text' : 'password'}
                            required minLength={6}
                            placeholder="Ít nhất 6 ký tự"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e] focus:ring-2 focus:ring-[#d9a01e]/10 transition-all pr-10"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button type="button" onClick={onCancel} disabled={isSubmitting}
                        className="flex-1 px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                        Hủy
                    </button>
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 px-5 py-2.5 rounded-xl font-black bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white hover:shadow-lg hover:shadow-[#d9a01e]/30 transition-all text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><KeyRound size={14} /><span>Đặt Lại</span></>}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Delete Confirm
// ─────────────────────────────────────────────
function DeleteConfirm({ nguoiDung, onConfirm, onCancel, isDeleting }: {
    nguoiDung: NguoiDung; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm mx-auto">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-800">Xác Nhận Xóa</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Xóa tài khoản <span className="font-black text-gray-700">"{nguoiDung.ten_dang_nhap}"</span>?<br />
                        <span className="text-xs text-red-400">Hành động này không thể hoàn tác.</span>
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onCancel} disabled={isDeleting}
                    className="flex-1 px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-xs uppercase tracking-widest">
                    Hủy
                </button>
                <button onClick={onConfirm} disabled={isDeleting}
                    className="flex-1 px-5 py-2.5 rounded-xl font-black bg-red-500 hover:bg-red-600 text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /><span>Xóa</span></>}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
type ModalMode = 'add' | 'edit' | 'reset-pw' | 'delete' | null;

export default function UserManagementPage() {
    const [users, setUsers] = useState<NguoiDung[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<VaiTro | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const [modal, setModal] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<NguoiDung | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const closeModal = () => { setModal(null); setSelected(null); };

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await nguoiDungService.getAll();
            setUsers(data);
        } catch {
            showToast('Không thể tải danh sách người dùng!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Handlers ──
    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            if (modal === 'edit' && selected) {
                await nguoiDungService.update(selected.id, data);
                showToast('Cập nhật thành công!');
            } else {
                await nguoiDungService.create(data);
                showToast(`Đã tạo tài khoản "${data.ten_dang_nhap}"!`);
            }
            closeModal();
            fetchUsers();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPw = async (newPw: string) => {
        if (!selected) return;
        try {
            setIsSubmitting(true);
            await nguoiDungService.resetPassword(selected.id, newPw);
            showToast('Đặt lại mật khẩu thành công!');
            closeModal();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: NguoiDung) => {
        try {
            const result = await nguoiDungService.toggleStatus(user.id);
            showToast(result.trang_thai ? 'Đã kích hoạt tài khoản!' : 'Đã vô hiệu hóa tài khoản!');
            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, trang_thai: result.trang_thai } : u));
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Thất bại!', 'error');
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            setIsSubmitting(true);
            await nguoiDungService.delete(selected.id);
            showToast(`Đã xóa tài khoản "${selected.ten_dang_nhap}"!`);
            closeModal();
            fetchUsers();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Filter ──
    const filtered = users.filter((u) => {
        const matchSearch =
            u.ten_dang_nhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.ho_ten ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'all' || u.vai_tro === filterRole;
        const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' ? u.trang_thai : !u.trang_thai);
        return matchSearch && matchRole && matchStatus;
    });

    // ── Counts ──
    const counts = {
        total: users.length,
        admin: users.filter((u) => u.vai_tro === 'Admin').length,
        phucVu: users.filter((u) => u.vai_tro === 'PhucVu').length,
        bep: users.filter((u) => u.vai_tro === 'Bep').length,
        active: users.filter((u) => u.trang_thai).length,
    };

    const hasModal = modal !== null;

    return (
        <div className="space-y-6 relative pb-10">
            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-2xl shadow-md shadow-[#d9a01e]/20">
                        <Users size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-wide">Quản Lý Người Dùng</h1>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">{counts.total} tài khoản • {counts.active} đang hoạt động</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative group">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm tên đăng nhập, họ tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all w-60"
                        />
                    </div>
                    <button onClick={fetchUsers} title="Làm mới"
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all">
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => { setSelected(null); setModal('add'); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white font-black rounded-xl shadow-md hover:shadow-[#d9a01e]/30 active:scale-95 transition-all uppercase tracking-widest text-xs">
                        <Plus size={16} /> Thêm
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Tổng', value: counts.total, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
                    { label: 'Quản Trị', value: counts.admin, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
                    { label: 'Phục Vụ', value: counts.phucVu, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Bếp', value: counts.bep, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: 'Hoạt Động', value: counts.active, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 shadow-sm`}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {/* Role filter */}
                {(['all', 'Admin', 'PhucVu', 'Bep'] as const).map((r) => (
                    <button key={r} onClick={() => setFilterRole(r as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterRole === r ? 'bg-[#d9a01e] text-white shadow-md shadow-[#d9a01e]/30' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#d9a01e]/30 hover:text-[#d9a01e]'}`}>
                        {r === 'all' ? 'Tất cả' : r === 'Admin' ? 'Quản Trị' : r === 'PhucVu' ? 'Phục Vụ' : 'Bếp'}
                    </button>
                ))}
                <div className="w-px bg-gray-200 mx-1" />
                {/* Status filter */}
                {([
                    { v: 'all', l: 'Mọi trạng thái' },
                    { v: 'active', l: '✅ Hoạt động' },
                    { v: 'inactive', l: '🔒 Đã khóa' },
                ] as const).map((s) => (
                    <button key={s.v} onClick={() => setFilterStatus(s.v)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold tracking-widest transition-all ${filterStatus === s.v ? 'bg-gray-700 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}>
                        {s.l}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#d9a01e]" />
                        <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Danh Sách</span>
                    </div>
                    <span className="text-xs text-gray-400">{filtered.length} kết quả</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Người Dùng</th>
                                <th className="px-6 py-4">Vai Trò</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users size={40} className="text-gray-200" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy người dùng</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((user) => {
                                const roleCfg = VAI_TRO_CONFIG[user.vai_tro];
                                return (
                                    <tr key={user.id} className="group hover:bg-gray-50/80 transition-colors">
                                        {/* Người dùng */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar nguoiDung={user} />
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">{user.ho_ten || '—'}</p>
                                                    <p className="text-xs text-gray-400 font-mono">@{user.ten_dang_nhap}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vai trò */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${roleCfg.color} ${roleCfg.bg} ${roleCfg.border}`}>
                                                {roleCfg.icon} {roleCfg.label}
                                            </span>
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${user.trang_thai ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'}`}
                                                title="Nhấn để bật/tắt"
                                            >
                                                {user.trang_thai
                                                    ? <><ToggleRight size={15} /> Hoạt động</>
                                                    : <><ToggleLeft size={15} /> Bị khóa</>
                                                }
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Sửa */}
                                                <button
                                                    onClick={() => { setSelected(user); setModal('edit'); }}
                                                    className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                {/* Đổi mật khẩu */}
                                                <button
                                                    onClick={() => { setSelected(user); setModal('reset-pw'); }}
                                                    className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl border border-gray-200 hover:border-blue-200 transition-all"
                                                    title="Đặt lại mật khẩu"
                                                >
                                                    <KeyRound size={14} />
                                                </button>
                                                {/* Xóa */}
                                                <button
                                                    onClick={() => { setSelected(user); setModal('delete'); }}
                                                    className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                                                    title="Xóa tài khoản"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {hasModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative w-full max-w-lg">
                        {(modal === 'add' || modal === 'edit') && (
                            <UserForm
                                initialData={modal === 'edit' ? selected : null}
                                onSubmit={handleFormSubmit}
                                onCancel={closeModal}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {modal === 'reset-pw' && selected && (
                            <ResetPasswordForm
                                nguoiDung={selected}
                                onSubmit={handleResetPw}
                                onCancel={closeModal}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {modal === 'delete' && selected && (
                            <DeleteConfirm
                                nguoiDung={selected}
                                onConfirm={handleDelete}
                                onCancel={closeModal}
                                isDeleting={isSubmitting}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
