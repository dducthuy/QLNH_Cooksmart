'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    LayoutGrid,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    UtensilsCrossed,
    Clock,
    CheckCircle,
    X,
    Save,
    RefreshCw,
    MapPin,
    QrCode,
} from 'lucide-react';
import { banAnService } from '@/services/banAn.service';
import { BanAn, TrangThaiBan } from '@/types/banAn';

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
const STATUS_CONFIG: Record<TrangThaiBan, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
    Trong: {
        label: 'Trống',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: <CheckCircle size={14} />,
    },
    DangPhucVu: {
        label: 'Đang phục vụ',
        color: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
        icon: <UtensilsCrossed size={14} />,
    },
    DatTruoc: {
        label: 'Đặt trước',
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200',
        dot: 'bg-blue-500',
        icon: <Clock size={14} />,
    },
};

const TRANG_THAI_OPTIONS: { value: TrangThaiBan; label: string }[] = [
    { value: 'Trong', label: 'Trống' },
    { value: 'DangPhucVu', label: 'Đang phục vụ' },
    { value: 'DatTruoc', label: 'Đặt trước' },
];

// ─────────────────────────────────────────────
//  TableCard
// ─────────────────────────────────────────────
function TableCard({
    ban,
    onEdit,
    onDelete,
}: {
    ban: BanAn;
    onEdit: (ban: BanAn) => void;
    onDelete: (ban: BanAn) => void;
}) {
    const cfg = STATUS_CONFIG[ban.trang_thai_ban];
    const canDelete = ban.trang_thai_ban !== 'DangPhucVu';

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#d9a01e]/30 transition-all duration-300 overflow-hidden">
            {/* Top colour strip */}
            <div className={`h-1.5 w-full ${ban.trang_thai_ban === 'Trong' ? 'bg-emerald-400' : ban.trang_thai_ban === 'DangPhucVu' ? 'bg-amber-400' : 'bg-blue-400'}`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <LayoutGrid size={16} className="text-[#d9a01e]" />
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Bàn</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 leading-none">{ban.so_ban}</h3>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${cfg.color} ${cfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                        {cfg.label}
                    </span>
                </div>

                {/* Info rows */}
                <div className="space-y-2 mb-5">
                    {ban.vi_tri && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate">{ban.vi_tri}</span>
                        </div>
                    )}
                    {ban.ma_qr_code ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <QrCode size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate font-mono text-xs">{ban.ma_qr_code}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-300 italic">
                            <QrCode size={13} className="shrink-0" />
                            <span>Chưa có mã QR</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                        onClick={() => onEdit(ban)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-[#d9a01e]/10 hover:text-[#d9a01e] rounded-xl border border-gray-100 hover:border-[#d9a01e]/30 transition-all"
                    >
                        <Edit2 size={13} /> Sửa
                    </button>
                    <button
                        onClick={() => onDelete(ban)}
                        disabled={!canDelete}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                            canDelete
                                ? 'text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-500 border-gray-100 hover:border-red-200'
                                : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
                        }`}
                        title={!canDelete ? 'Không thể xóa bàn đang phục vụ' : ''}
                    >
                        <Trash2 size={13} /> Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Modal Form
// ─────────────────────────────────────────────
function TableForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    initialData: Partial<BanAn> | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState({
        so_ban: initialData?.so_ban ?? '',
        vi_tri: initialData?.vi_tri ?? '',
        ma_qr_code: initialData?.ma_qr_code ?? '',
        trang_thai_ban: (initialData?.trang_thai_ban ?? 'Trong') as TrangThaiBan,
    });

    const inputCls =
        'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e] focus:ring-2 focus:ring-[#d9a01e]/10 transition-all placeholder:text-gray-400';
    const labelCls = 'block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            so_ban: form.so_ban.trim(),
            vi_tri: form.vi_tri.trim() || null,
            ma_qr_code: form.ma_qr_code.trim() || null,
            trang_thai_ban: form.trang_thai_ban,
        });
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider">
                        {initialData?.id ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Số bàn */}
                    <div>
                        <label className={labelCls}>Số Bàn <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="VD: B01, B02..."
                            value={form.so_ban}
                            onChange={(e) => setForm({ ...form, so_ban: e.target.value })}
                            className={inputCls}
                        />
                    </div>

                    {/* Vị trí */}
                    <div>
                        <label className={labelCls}>Vị Trí</label>
                        <input
                            type="text"
                            placeholder="VD: Tầng 1, Ngoài trời..."
                            value={form.vi_tri}
                            onChange={(e) => setForm({ ...form, vi_tri: e.target.value })}
                            className={inputCls}
                        />
                    </div>

                    {/* Mã QR */}
                    <div>
                        <label className={labelCls}>Mã QR Code</label>
                        <input
                            type="text"
                            placeholder="Mã QR (tuỳ chọn)"
                            value={form.ma_qr_code}
                            onChange={(e) => setForm({ ...form, ma_qr_code: e.target.value })}
                            className={inputCls}
                        />
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label className={labelCls}>Trạng Thái</label>
                        <select
                            value={form.trang_thai_ban}
                            onChange={(e) => setForm({ ...form, trang_thai_ban: e.target.value as TrangThaiBan })}
                            className={`${inputCls} cursor-pointer appearance-none`}
                        >
                            {TRANG_THAI_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-gray-200 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white hover:shadow-lg hover:shadow-[#d9a01e]/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /><span>Lưu Lại</span></>}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Delete Confirm Modal
// ─────────────────────────────────────────────
function DeleteConfirm({
    ban,
    onConfirm,
    onCancel,
    isDeleting,
}: {
    ban: BanAn;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
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
                        Bạn có chắc muốn xóa <span className="font-black text-gray-700">Bàn {ban.so_ban}</span>?
                        <br />
                        <span className="text-xs text-red-400">Hành động này không thể hoàn tác.</span>
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-xs uppercase tracking-widest"
                >
                    Hủy
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-5 py-2.5 rounded-xl font-black bg-red-500 hover:bg-red-600 text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /><span>Xóa</span></>}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
export default function TableManagementPage() {
    const [tables, setTables] = useState<BanAn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<TrangThaiBan | 'all'>('all');

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<BanAn | null>(null);
    const [deletingTable, setDeletingTable] = useState<BanAn | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchTables = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await banAnService.getAll();
            setTables(data);
        } catch {
            showToast('Không thể tải danh sách bàn!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchTables(); }, [fetchTables]);

    const handleAdd = () => { setEditingTable(null); setIsFormOpen(true); };
    const handleEdit = (ban: BanAn) => { setEditingTable(ban); setIsFormOpen(true); };
    const handleDeleteClick = (ban: BanAn) => setDeletingTable(ban);

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            if (editingTable) {
                await banAnService.update(editingTable.id, data);
                showToast(`Đã cập nhật Bàn ${data.so_ban} thành công!`);
            } else {
                await banAnService.create(data);
                showToast(`Đã thêm Bàn ${data.so_ban} thành công!`);
            }
            setIsFormOpen(false);
            fetchTables();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingTable) return;
        try {
            setIsDeleting(true);
            await banAnService.delete(deletingTable.id);
            showToast(`Đã xóa Bàn ${deletingTable.so_ban} thành công!`);
            setDeletingTable(null);
            fetchTables();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── filter ──
    const filtered = tables.filter((t) => {
        const matchSearch = t.so_ban.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.vi_tri ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || t.trang_thai_ban === filterStatus;
        return matchSearch && matchStatus;
    });

    // ── stat counts ──
    const counts = {
        total: tables.length,
        trong: tables.filter((t) => t.trang_thai_ban === 'Trong').length,
        dangPhucVu: tables.filter((t) => t.trang_thai_ban === 'DangPhucVu').length,
        datTruoc: tables.filter((t) => t.trang_thai_ban === 'DatTruoc').length,
    };

    return (
        <div className="space-y-6 relative pb-10">
            {/* ── Toast ── */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-2xl shadow-md shadow-[#d9a01e]/20">
                        <LayoutGrid size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-wide">Quản Lý Bàn Ăn</h1>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Tổng cộng: {counts.total} bàn</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative group">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm số bàn, vị trí..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all w-52"
                        />
                    </div>
                    {/* Refresh */}
                    <button
                        onClick={fetchTables}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all"
                        title="Làm mới"
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {/* Add */}
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white font-black rounded-xl shadow-md hover:shadow-[#d9a01e]/30 active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                        <Plus size={16} /> Thêm Bàn
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng bàn', value: counts.total, color: 'text-gray-800', bg: 'bg-white', borderColor: 'border-gray-100' },
                    { label: 'Đang trống', value: counts.trong, color: 'text-emerald-600', bg: 'bg-emerald-50', borderColor: 'border-emerald-100' },
                    { label: 'Đang phục vụ', value: counts.dangPhucVu, color: 'text-amber-600', bg: 'bg-amber-50', borderColor: 'border-amber-100' },
                    { label: 'Đặt trước', value: counts.datTruoc, color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-blue-100' },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} border ${s.borderColor} rounded-2xl p-4 shadow-sm`}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Filter Tabs ── */}
            <div className="flex gap-2 flex-wrap">
                {([
                    { value: 'all', label: 'Tất cả' },
                    { value: 'Trong', label: 'Trống' },
                    { value: 'DangPhucVu', label: 'Đang phục vụ' },
                    { value: 'DatTruoc', label: 'Đặt trước' },
                ] as const).map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilterStatus(tab.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            filterStatus === tab.value
                                ? 'bg-[#d9a01e] text-white shadow-md shadow-[#d9a01e]/30'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#d9a01e]/30 hover:text-[#d9a01e]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Table Grid ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 size={40} className="animate-spin text-[#d9a01e]" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <LayoutGrid size={48} className="text-gray-200" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy bàn nào</p>
                </div>
            ) : (
                /* ── Scrollable container – 5 bàn / hàng ── */
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    {/* Header của khối */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={16} className="text-[#d9a01e]" />
                            <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Sơ Đồ Bàn</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{filtered.length} bàn đang hiển thị</span>
                    </div>

                    {/* Scrollable area – dọc */}
                    <div className="overflow-y-auto custom-scrollbar p-6" style={{ maxHeight: '520px' }}>
                        {/* Grid 5 cột cố định */}
                        <div className="grid grid-cols-5 gap-4">
                            {filtered.map((ban) => (
                                <TableCard key={ban.id} ban={ban} onEdit={handleEdit} onDelete={handleDeleteClick} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            {(isFormOpen || deletingTable) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => { setIsFormOpen(false); setDeletingTable(null); }} />
                    <div className="relative w-full max-w-lg">
                        {isFormOpen && (
                            <TableForm
                                initialData={editingTable}
                                onSubmit={handleFormSubmit}
                                onCancel={() => setIsFormOpen(false)}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {deletingTable && (
                            <DeleteConfirm
                                ban={deletingTable}
                                onConfirm={handleConfirmDelete}
                                onCancel={() => setDeletingTable(null)}
                                isDeleting={isDeleting}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
