'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, AlertTriangle, TrendingUp, Banknote, CreditCard, FileText,
    ShieldCheck, Loader2, Eye, Calendar, Clock, CheckCircle, X, Search, RefreshCw,
} from 'lucide-react';
import { adminKetCaService } from '@/services/adminKetCa.service';
import { KetCa, BaoCaoChiTietCa, DashboardSummary } from '@/types/ketCa';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminFilterTabs,
    AdminTableCard,
    AdminModal,
} from '@/components/admin/ui';
import { useShiftManagement } from '@/hooks/admin/shift/useShiftManagement';
import { useShiftReport } from '@/hooks/admin/shift/useShiftReport';

const fVND = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

const fDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

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
    showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
    const { report, isLoading, ghiChu, setGhiChu, isSubmitting, handleKiemDuyet } = useShiftReport(ca, onSuccess, onClose, showToast);

    const tk = report?.thong_ke_tai_chinh;

    return (
        <div className="bg-white rounded-3xl overflow-hidden flex flex-col h-full max-h-[85vh]">
            <div className="bg-gray-900 px-6 py-5 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-white font-black text-base uppercase tracking-widest">Báo cáo chi tiết ca</h2>
                    <p className="text-gray-400 text-xs mt-0.5 font-mono">
                        {ca.NguoiDung?.ho_ten ?? '—'} · Mở {fDate(ca.thoi_gian_bat_dau)}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
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
    );
}

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
const LIMIT = 10;

export default function AdminShiftsPage() {
    const { showToast, toastNode } = useAdminToast();
    const {
        summary, isLoadingSummary, total, isLoading,
        search, setSearch, filterStatus, setFilterStatus, tuNgay, setTuNgay, denNgay, setDenNgay,
        page, setPage, selectedCa, setSelectedCa, LIMIT, totalPages, filtered, handleRefresh,
        fetchSummary, fetchShifts
    } = useShiftManagement(showToast);

    const statItems = [
        { label: 'Tổng số ca', value: summary?.tong_so_ca ?? 0, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Tổng doanh thu', value: fVND(summary?.tong_doanh_thu ?? 0), color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Chênh lệch tổng', value: fVND(summary?.tong_chenh_lech ?? 0), color: (summary?.tong_chenh_lech ?? 0) < 0 ? 'text-red-600' : (summary?.tong_chenh_lech ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400', bg: (summary?.tong_chenh_lech ?? 0) < 0 ? 'bg-red-50' : (summary?.tong_chenh_lech ?? 0) > 0 ? 'bg-amber-50' : 'bg-gray-50', border: (summary?.tong_chenh_lech ?? 0) < 0 ? 'border-red-100' : (summary?.tong_chenh_lech ?? 0) > 0 ? 'border-amber-100' : 'border-gray-100' },
        { label: 'Chờ kiểm duyệt', value: summary?.so_ca_chua_kiem_duyet ?? 0, color: (summary?.so_ca_chua_kiem_duyet ?? 0) > 0 ? 'text-amber-700' : 'text-gray-400', bg: (summary?.so_ca_chua_kiem_duyet ?? 0) > 0 ? 'bg-amber-50' : 'bg-gray-50', border: (summary?.so_ca_chua_kiem_duyet ?? 0) > 0 ? 'border-amber-100' : 'border-gray-100' },
    ];

    const filterTabs = [
        { value: 'all', label: 'Tất cả' },
        { value: 'open', label: ' Đang chạy' },
        { value: 'closed', label: ' Đã kết thúc' },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<ClipboardList size={22} className="text-white" />}
                title="Quản Lý Ca Làm Việc"
                subtitle={`${total} ca · ${summary?.so_ca_chua_kiem_duyet ?? 0} chờ kiểm duyệt`}
            />

            {isLoadingSummary ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse h-20" />
                    ))}
                </div>
            ) : summary && (
                <AdminStatCards items={statItems} cols={4} />
            )}

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Trạng thái:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="w-full sm:w-36 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#d9a01e] focus:bg-white transition-all"
                        >
                            {filterTabs.map(tab => (
                                <option key={tab.value} value={tab.value}>{tab.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date range filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Ngày:</label>
                        <div className="flex items-center gap-1">
                            <div className="relative">
                                <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)}
                                    className="pl-7 pr-2 py-2 text-gray-600 text-xs font-bold uppercase tracking-widest bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d9a01e] focus:bg-white transition-all shadow-sm w-32" />
                            </div>
                            <span className="text-gray-300 font-black">→</span>
                            <div className="relative">
                                <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)}
                                    className="pl-7 pr-2 py-2 text-gray-600 text-xs font-bold uppercase tracking-widest bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d9a01e] focus:bg-white transition-all shadow-sm w-32" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search, Refresh & Reset */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative group w-full md:w-52">
                        <Search
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Tìm theo tên nhân viên..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleRefresh}
                        title="Làm mới"
                        className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all shrink-0"
                    >
                        <RefreshCw size={15} className={isLoading || isLoadingSummary ? 'animate-spin' : ''} />
                    </button>
                    {(search || filterStatus !== 'all' || tuNgay || denNgay) && (
                        <button
                            onClick={() => { setSearch(''); setFilterStatus('all'); setTuNgay(''); setDenNgay(''); }}
                            className="p-2 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl border border-transparent transition-all shrink-0"
                            title="Xóa tìm kiếm và lọc"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            <AdminTableCard icon={<ClipboardList size={16} />} title="Danh Sách Ca" count={total}>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                            <th className="px-6 py-4 w-12 text-center">STT</th>
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
                                <td colSpan={9} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <ClipboardList size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy ca nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((ca, index) => (
                            <tr key={ca.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-center font-bold text-gray-400">
                                    {(page - 1) * LIMIT + index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">
                                            {ca.NguoiDung?.ho_ten ?? '—'}
                                        </p>
                                        <p className="text-[11px] text-gray-400">{ca.NguoiDung?.vai_tro ?? ''}</p>
                                    </div>
                                </td>
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
                                <td className="px-6 py-4 font-bold text-gray-700 text-sm">
                                    {fVND(Number(ca.tien_dau_ca))}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-emerald-700 font-bold text-sm">{fVND(Number(ca.tong_tien_mat_he_thong))}</p>
                                    <p className="text-blue-500 text-[11px]">CK: {fVND(Number(ca.tong_chuyen_khoan_he_thong))}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {ca.trang_thai_ca === 'DangChay'
                                        ? <span className="text-gray-300 text-xs">—</span>
                                        : <span className={`font-black text-sm ${Number(ca.tien_chenh_lech) < 0 ? 'text-red-600' : Number(ca.tien_chenh_lech) > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                            {Number(ca.tien_chenh_lech) === 0 ? '✓ Khớp' : fVND(Number(ca.tien_chenh_lech))}
                                        </span>
                                    }
                                </td>
                                <td className="px-6 py-4"><TrangThaiBadge ca={ca} /></td>
                                <td className="px-6 py-4"><KiemDuyetBadge ca={ca} /></td>
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
            </AdminTableCard>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-400 font-medium">
                        Trang {page} / {totalPages} · {total} ca
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-4 py-2 rounded-xl font-bold bg-white border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 transition-all text-xs">
                            Trang Trước
                        </button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl font-bold bg-white border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 transition-all text-xs">
                            Trang Tiếp
                        </button>
                    </div>
                </div>
            )}

            {selectedCa && (
                <AdminModal onClose={() => setSelectedCa(null)} maxWidth="max-w-2xl">
                    <BaoCaoModal
                        ca={selectedCa}
                        onClose={() => setSelectedCa(null)}
                        onSuccess={() => { fetchShifts(); fetchSummary(); }}
                        showToast={showToast}
                    />
                </AdminModal>
            )}
        </div>
    );
}
