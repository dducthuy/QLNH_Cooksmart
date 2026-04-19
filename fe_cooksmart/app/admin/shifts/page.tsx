'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, RefreshCw, Search, ChevronLeft, ChevronRight,
    AlertTriangle, TrendingUp, Banknote, CreditCard, FileText,
    ShieldCheck, X, Loader2, Eye, Calendar, Clock, CheckCircle,
} from 'lucide-react';
import { adminKetCaService } from '@/services/adminKetCa.service';
import { KetCa, BaoCaoChiTietCa, DashboardSummary } from '@/types/ketCa';

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
const fVND = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

const fDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

// ─────────────────────────────────────────────
//  Badges
// ─────────────────────────────────────────────
function TrangThaiBadge({ ca }: { ca: KetCa }) {
    if (ca.trang_thai_ca === 'DangChay') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang chạy
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Đã kết thúc
        </span>
    );
}

function KiemDuyetBadge({ ca }: { ca: KetCa }) {
    if (ca.trang_thai_ca === 'DangChay') return <span className="text-gray-300 text-xs">—</span>;
    if (ca.da_kiem_duyet) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[11px] font-bold">
                <ShieldCheck size={11} /> Đã duyệt
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[11px] font-bold">
            <AlertTriangle size={11} /> Chờ duyệt
        </span>
    );
}

// ─────────────────────────────────────────────
//  Modal Chi tiết & Kiểm duyệt
// ─────────────────────────────────────────────
function BaoCaoModal({
    ca, onClose, onSuccess, showToast,
}: {
    ca: KetCa;
    onClose: () => void;
    onSuccess: () => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
}) {
    const [report, setReport] = useState<BaoCaoChiTietCa | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ghiChu, setGhiChu] = useState(ca.ghi_chu_kiem_duyet ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        adminKetCaService.getBaoCaoChiTiet(ca.id)
            .then(res => setReport(res.data))
            .catch(() => showToast('Không thể tải báo cáo ca', 'error'))
            .finally(() => setIsLoading(false));
    }, [ca.id]);

    const handleKiemDuyet = async () => {
        try {
            setIsSubmitting(true);
            await adminKetCaService.kiemDuyetCa(ca.id, ghiChu);
            showToast('Kiểm duyệt ca thành công!', 'success');
            onSuccess();
            onClose();
        } catch {
            showToast('Kiểm duyệt thất bại', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tk = report?.thong_ke_tai_chinh;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="bg-gray-900 px-6 py-5 flex justify-between items-center">
                        <div>
                            <h2 className="text-white font-black text-base uppercase tracking-widest">Báo cáo chi tiết ca</h2>
                            <p className="text-gray-400 text-xs mt-0.5 font-mono">
                                {ca.NguoiDung?.ho_ten ?? '—'} · Mở {fDate(ca.thoi_gian_bat_dau)}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                            </div>
                        ) : tk ? (
                            <>
                                {/* Stat grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                                    {[
                                        { label: 'Tổng đơn', value: `${tk.tong_so_don} đơn`, color: 'text-gray-800', bg: 'bg-gray-50', border: 'border-gray-100', icon: <FileText size={15} className="text-gray-400" /> },
                                        { label: 'Doanh thu TM', value: fVND(tk.tong_tien_mat), color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <Banknote size={15} className="text-emerald-500" /> },
                                        { label: 'Chuyển khoản', value: fVND(tk.tong_chuyen_khoan), color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: <CreditCard size={15} className="text-blue-500" /> },
                                        { label: 'Tổng chi tiêu', value: fVND(tk.tong_chi_tieu), color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', icon: <TrendingUp size={15} className="text-red-400" /> },
                                        { label: 'Tiền đầu ca', value: fVND(Number(ca.tien_dau_ca)), color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', icon: <Banknote size={15} className="text-gray-400" /> },
                                        { label: 'Két tiền lý thuyết', value: fVND(tk.tien_mat_ket_ly_thuyet), color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: <ShieldCheck size={15} className="text-amber-500" /> },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                                            <div className="flex items-center gap-1.5 mb-1.5">{s.icon}<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p></div>
                                            <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Chênh lệch */}
                                {ca.trang_thai_ca === 'DaKetThuc' && (
                                    <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 mb-5 ${Number(ca.tien_chenh_lech) < 0 ? 'bg-red-50 border-red-200' : Number(ca.tien_chenh_lech) > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                        {Number(ca.tien_chenh_lech) === 0
                                            ? <CheckCircle size={24} className="text-emerald-500 shrink-0" />
                                            : <AlertTriangle size={24} className={`${Number(ca.tien_chenh_lech) < 0 ? 'text-red-500' : 'text-amber-500'} shrink-0`} />
                                        }
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Chênh lệch cuối ca</p>
                                            <p className={`text-lg font-black ${Number(ca.tien_chenh_lech) < 0 ? 'text-red-600' : Number(ca.tien_chenh_lech) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {Number(ca.tien_chenh_lech) === 0 ? 'Khớp hoàn toàn ✓'
                                                    : `${Number(ca.tien_chenh_lech) > 0 ? 'Thừa' : 'Thiếu'} ${fVND(Math.abs(Number(ca.tien_chenh_lech)))}`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Form kiểm duyệt */}
                                {ca.trang_thai_ca === 'DaKetThuc' && !ca.da_kiem_duyet && (
                                    <div className="border-t border-gray-100 pt-5 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ghi chú kiểm duyệt</p>
                                        <textarea
                                            rows={3}
                                            value={ghiChu}
                                            onChange={e => setGhiChu(e.target.value)}
                                            placeholder="VD: Đã kiểm tra, chênh lệch do sơ suất tiền thối..."
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 outline-none focus:border-[#d9a01e]/50 focus:ring-2 focus:ring-[#d9a01e]/10 transition-all resize-none"
                                        />
                                        <div className="flex gap-3 pt-1">
                                            <button onClick={onClose} disabled={isSubmitting}
                                                className="flex-1 px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                                                Hủy
                                            </button>
                                            <button onClick={handleKiemDuyet} disabled={isSubmitting}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white font-black rounded-xl shadow-md hover:shadow-[#d9a01e]/30 active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                                Xác nhận duyệt
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Thông tin đã duyệt */}
                                {ca.da_kiem_duyet && (
                                    <div className="border-t border-gray-100 pt-5">
                                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-blue-700 tracking-wider mb-1">
                                                    Đã kiểm duyệt · {fDate(ca.thoi_gian_kiem_duyet)}
                                                </p>
                                                <p className="text-sm text-blue-800">{ca.ghi_chu_kiem_duyet || 'Không có ghi chú'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-center text-gray-400 py-10 font-medium">Không thể tải dữ liệu.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Toast (inline)
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
//  Main Page
// ─────────────────────────────────────────────
const LIMIT = 10;

export default function AdminShiftsPage() {
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [shifts, setShifts] = useState<KetCa[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
    const [tuNgay, setTuNgay] = useState('');
    const [denNgay, setDenNgay] = useState('');
    const [page, setPage] = useState(1);
    const [selectedCa, setSelectedCa] = useState<KetCa | null>(null);

    const fetchSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        try {
            const res = await adminKetCaService.getDashboardSummary({
                tuNgay: tuNgay || undefined,
                denNgay: denNgay || undefined,
            });
            setSummary(res.data);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [tuNgay, denNgay]);

    const fetchShifts = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await adminKetCaService.getLichSuCa({
                status: filterStatus === 'all' ? undefined : filterStatus,
                tuNgay: tuNgay || undefined,
                denNgay: denNgay || undefined,
                limit: LIMIT,
                offset: (page - 1) * LIMIT,
            });
            setShifts(res.data);
            setTotal(res.total);
        } catch {
            showToast('Không thể tải danh sách ca', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, tuNgay, denNgay, page]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);
    useEffect(() => { setPage(1); }, [filterStatus, tuNgay, denNgay]);
    useEffect(() => { fetchShifts(); }, [fetchShifts]);

    const handleRefresh = () => { fetchSummary(); fetchShifts(); };

    const filtered = search.trim()
        ? shifts.filter(s => s.NguoiDung?.ho_ten?.toLowerCase().includes(search.toLowerCase()))
        : shifts;

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6 relative pb-10">
            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            {/* ── Header ───────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-2xl shadow-md shadow-[#d9a01e]/20">
                        <ClipboardList size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-wide">Quản Lý Ca Làm Việc</h1>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">
                            {total} ca · {summary?.so_ca_chua_kiem_duyet ?? 0} chờ kiểm duyệt
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative group">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên nhân viên..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all w-56"
                        />
                    </div>
                    {/* Date range */}
                    <div className="flex items-center gap-1">
                        <div className="relative">
                            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)}
                                className="pl-7 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-[#d9a01e]/50 transition-all" />
                        </div>
                        <span className="text-gray-300">→</span>
                        <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)}
                            className="px-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-[#d9a01e]/50 transition-all" />
                    </div>
                    {/* Refresh */}
                    <button onClick={handleRefresh} title="Làm mới"
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all">
                        <RefreshCw size={15} className={isLoading || isLoadingSummary ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ── Stats ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {isLoadingSummary ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse h-20" />
                    ))
                ) : summary ? (
                    <>
                        {[
                            { label: 'Tổng số ca', value: summary.tong_so_ca, display: `${summary.tong_so_ca}`, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
                            { label: 'Tổng doanh thu', value: summary.tong_doanh_thu, display: fVND(summary.tong_doanh_thu), color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { label: 'Chênh lệch tổng', value: summary.tong_chenh_lech, display: fVND(summary.tong_chenh_lech), color: summary.tong_chenh_lech < 0 ? 'text-red-600' : summary.tong_chenh_lech > 0 ? 'text-amber-600' : 'text-gray-400', bg: summary.tong_chenh_lech < 0 ? 'bg-red-50' : summary.tong_chenh_lech > 0 ? 'bg-amber-50' : 'bg-gray-50', border: summary.tong_chenh_lech < 0 ? 'border-red-100' : summary.tong_chenh_lech > 0 ? 'border-amber-100' : 'border-gray-100' },
                            { label: 'Chờ kiểm duyệt', value: summary.so_ca_chua_kiem_duyet, display: `${summary.so_ca_chua_kiem_duyet}`, color: summary.so_ca_chua_kiem_duyet > 0 ? 'text-amber-700' : 'text-gray-400', bg: summary.so_ca_chua_kiem_duyet > 0 ? 'bg-amber-50' : 'bg-gray-50', border: summary.so_ca_chua_kiem_duyet > 0 ? 'border-amber-100' : 'border-gray-100' },
                        ].map(s => (
                            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 shadow-sm`}>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className={`text-2xl font-black ${s.color}`}>{s.display}</p>
                            </div>
                        ))}
                    </>
                ) : null}
            </div>

            {/* ── Filter Tabs ──────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {([
                    { v: 'all', l: 'Tất cả' },
                    { v: 'open', l: '🟢 Đang chạy' },
                    { v: 'closed', l: '⚫ Đã kết thúc' },
                ] as const).map(tab => (
                    <button key={tab.v} onClick={() => setFilterStatus(tab.v)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterStatus === tab.v ? 'bg-[#d9a01e] text-white shadow-md shadow-[#d9a01e]/30' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#d9a01e]/30 hover:text-[#d9a01e]'}`}>
                        {tab.l}
                    </button>
                ))}
            </div>

            {/* ── Table ────────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                {/* Table header bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ClipboardList size={16} className="text-[#d9a01e]" />
                        <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Danh Sách Ca</span>
                    </div>
                    <span className="text-xs text-gray-400">{total} kết quả</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Tiền đầu ca</th>
                                <th className="px-6 py-4">Doanh thu</th>
                                <th className="px-6 py-4">Chênh lệch</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Kiểm duyệt</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <ClipboardList size={40} className="text-gray-200" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy ca nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(ca => (
                                <tr key={ca.id} className="group hover:bg-gray-50/80 transition-colors">
                                    {/* Nhân viên */}
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">
                                                {ca.NguoiDung?.ho_ten ?? '—'}
                                            </p>
                                            <p className="text-[11px] text-gray-400">{ca.NguoiDung?.vai_tro ?? ''}</p>
                                        </div>
                                    </td>
                                    {/* Thời gian */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="flex items-center gap-1 text-[11px] text-gray-600">
                                                <Clock size={10} className="text-emerald-400" /> {fDate(ca.thoi_gian_bat_dau)}
                                            </span>
                                            {ca.thoi_gian_ket_thuc && (
                                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                    <Clock size={10} className="text-gray-300" /> {fDate(ca.thoi_gian_ket_thuc)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    {/* Tiền đầu ca */}
                                    <td className="px-6 py-4 font-bold text-gray-700 text-sm">
                                        {fVND(Number(ca.tien_dau_ca))}
                                    </td>
                                    {/* Doanh thu */}
                                    <td className="px-6 py-4">
                                        <p className="text-emerald-700 font-bold text-sm">{fVND(Number(ca.tong_tien_mat_he_thong))}</p>
                                        <p className="text-blue-500 text-[11px]">CK: {fVND(Number(ca.tong_chuyen_khoan_he_thong))}</p>
                                    </td>
                                    {/* Chênh lệch */}
                                    <td className="px-6 py-4">
                                        {ca.trang_thai_ca === 'DangChay'
                                            ? <span className="text-gray-300 text-xs">—</span>
                                            : <span className={`font-black text-sm ${Number(ca.tien_chenh_lech) < 0 ? 'text-red-600' : Number(ca.tien_chenh_lech) > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                {Number(ca.tien_chenh_lech) === 0 ? '✓ Khớp' : fVND(Number(ca.tien_chenh_lech))}
                                            </span>
                                        }
                                    </td>
                                    {/* Trạng thái */}
                                    <td className="px-6 py-4"><TrangThaiBadge ca={ca} /></td>
                                    {/* Kiểm duyệt */}
                                    <td className="px-6 py-4"><KiemDuyetBadge ca={ca} /></td>
                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => setSelectedCa(ca)}
                                                className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                                title="Xem chi tiết & Kiểm duyệt"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">
                            Trang {page} / {totalPages} · {total} ca
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal ────────────────────────────────────────── */}
            {selectedCa && (
                <BaoCaoModal
                    ca={selectedCa}
                    onClose={() => setSelectedCa(null)}
                    onSuccess={() => { fetchShifts(); fetchSummary(); }}
                    showToast={showToast}
                />
            )}
        </div>
    );
}
