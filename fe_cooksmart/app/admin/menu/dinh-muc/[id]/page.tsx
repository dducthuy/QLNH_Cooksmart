'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    FlaskConical, ArrowLeft, Plus, Trash2, Edit2, Loader2,
    TrendingUp, Package, DollarSign, AlertTriangle, CheckCircle2, ShoppingBag
} from 'lucide-react';
import { dinhMucService, type DinhMucVoiChiPhi } from '@/services/dinhMuc.service';
import { nguyenLieuService } from '@/services/nguyenLieu.service';
import type { NguyenLieu } from '@/types/nguyenLieu';
import {
    useAdminToast,
    AdminModal,
    AdminDeleteConfirm,
} from '@/components/admin/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

function CostBadge({ pct }: { pct: number }) {
    if (pct <= 0) return null;
    const isGood = pct < 40;
    const isMid = pct >= 40 && pct < 60;
    return (
        <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${
                isGood
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : isMid
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-red-50 text-red-600 border-red-200'
            }`}
        >
            {isGood ? <CheckCircle2 size={12} /> : isMid ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
            {pct.toFixed(1)}%
        </span>
    );
}

// ── Trang chính ──────────────────────────────────────────────────────────────
export default function DinhMucPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { showToast, toastNode } = useAdminToast();

    const [isLoading, setIsLoading] = useState(true);
    const [monAn, setMonAn] = useState<{ id: string; ten_mon: string; gia_tien: number } | null>(null);
    const [danhSach, setDanhSach] = useState<DinhMucVoiChiPhi[]>([]);
    const [tongChiPhi, setTongChiPhi] = useState(0);
    const [tyLeCost, setTyLeCost] = useState(0);

    const [nguyenLieus, setNguyenLieus] = useState<NguyenLieu[]>([]);

    // Modal thêm mới
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addNLId, setAddNLId] = useState('');
    const [addLuong, setAddLuong] = useState('');
    const [addDonVi, setAddDonVi] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Modal sửa
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLuong, setEditLuong] = useState('');
    const [editDonVi, setEditDonVi] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Danh sách đơn vị tính phổ biến
    const UNITS = ['g', 'kg', 'ml', 'lít', 'cái', 'quả', 'chai', 'lon', 'phần', 'hộp'];

    const getCompatibleUnits = (baseUnit: string | null | undefined) => {
        if (!baseUnit) return UNITS;
        const bu = baseUnit.toLowerCase().trim();
        if (['kg', 'g', 'kilogram', 'gram'].includes(bu)) return ['g', 'kg'];
        if (['l', 'lít', 'lit', 'ml', 'mililit'].includes(bu)) return ['ml', 'lít'];
        return [baseUnit];
    };

    // Modal xóa
    const [deletingDM, setDeletingDM] = useState<DinhMucVoiChiPhi | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [dmRes, nlRes] = await Promise.all([
                dinhMucService.getByMonAnVoiChiPhi(id),
                nguyenLieuService.getAll(),
            ]);
            setMonAn(dmRes.mon_an);
            setDanhSach(dmRes.data);
            setTongChiPhi(dmRes.tong_chi_phi);
            setTyLeCost(dmRes.ty_le_cost);
            setNguyenLieus(nlRes.data);
        } catch {
            showToast('Không thể tải dữ liệu!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Nguyên liệu chưa được thêm ───────────────────────────────────────────
    const nlChuaCoTrongDM = nguyenLieus.filter(
        (nl) => !danhSach.some((dm) => dm.NguyenLieu?.id === nl.id)
    );

    // ── Thêm định mức ─────────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!addNLId || !addLuong || Number(addLuong) <= 0) {
            showToast('Vui lòng chọn nguyên liệu và nhập lượng hợp lệ', 'error');
            return;
        }
        try {
            setIsAdding(true);
            await dinhMucService.create({
                id_mon_an: id,
                id_nguyen_lieu: addNLId,
                luong_tieu_hao: Number(addLuong),
                don_vi_tinh: addDonVi || undefined
            });
            showToast('Đã thêm định mức thành công!');
            setIsAddOpen(false);
            setAddNLId('');
            setAddLuong('');
            setAddDonVi('');
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Thêm thất bại!', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    // ── Sửa định mức ─────────────────────────────────────────────────────────
    const handleEdit = async () => {
        if (!editingId || !editLuong || Number(editLuong) <= 0) {
            showToast('Lượng tiêu hao phải > 0', 'error');
            return;
        }
        try {
            setIsEditing(true);
            await dinhMucService.update(editingId, { 
                luong_tieu_hao: Number(editLuong),
                don_vi_tinh: editDonVi || undefined
            });
            showToast('Cập nhật thành công!');
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Cập nhật thất bại!', 'error');
        } finally {
            setIsEditing(false);
        }
    };

    // ── Xóa định mức ─────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deletingDM) return;
        try {
            setIsDeleting(true);
            await dinhMucService.delete(deletingDM.id);
            showToast('Đã xóa định mức!');
            setDeletingDM(null);
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Cost bar ──────────────────────────────────────────────────────────────
    const costBarColor =
        tyLeCost < 40 ? 'bg-emerald-500' : tyLeCost < 60 ? 'bg-amber-400' : 'bg-red-500';
    const costBarWidth = Math.min(tyLeCost, 100);

    // ── Render ────────────────────────────────────────────────────────────────
    const hasModal = isAddOpen || !!editingId || !!deletingDM;

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            {/* ── Header ── */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-6 py-5 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#d9a01e,#f5c842)' }}>
                    <FlaskConical size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Định Mức Nguyên Liệu</p>
                    {isLoading ? (
                        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse mt-1" />
                    ) : (
                        <h1 className="text-lg font-black text-gray-800 truncate">{monAn?.ten_mon || '—'}</h1>
                    )}
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    disabled={isLoading || nlChuaCoTrongDM.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#d9a01e,#f5c842)' }}
                >
                    <Plus size={16} />
                    Thêm Nguyên Liệu
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Giá bán */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <ShoppingBag size={16} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá Bán</p>
                            <p className="text-lg font-black text-blue-600">
                                {monAn ? fmt(monAn.gia_tien) : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chi phí nguyên liệu */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Package size={16} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi Phí NL</p>
                            <p className="text-lg font-black text-amber-600">
                                {isLoading ? '...' : fmt(tongChiPhi)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tỷ lệ cost */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                                <DollarSign size={16} className="text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỷ Lệ Cost</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-black text-gray-800">
                                        {isLoading ? '...' : `${tyLeCost.toFixed(1)}%`}
                                    </p>
                                    {!isLoading && <CostBadge pct={tyLeCost} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Progress bar */}
                    {!isLoading && (
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${costBarColor}`}
                                style={{ width: `${costBarWidth}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bảng định mức ── */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-[#d9a01e]"><FlaskConical size={16} /></span>
                        <span className="text-sm font-black text-gray-700 uppercase tracking-widest">
                            Danh Sách Nguyên Liệu
                        </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{danhSach.length} nguyên liệu</span>
                </div>

                <div className="overflow-x-auto" style={{ maxHeight: 480 }}>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                                <th className="px-6 py-4 w-10 text-center">STT</th>
                                <th className="px-6 py-4">Nguyên Liệu</th>
                                <th className="px-6 py-4 text-right">Lượng Tiêu Hao</th>
                                <th className="px-6 py-4 text-right">Đơn Giá Vốn</th>
                                <th className="px-6 py-4 text-right">Thành Tiền</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : danhSach.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FlaskConical size={40} className="text-gray-200" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                Chưa có định mức nào
                                            </p>
                                            <p className="text-xs text-gray-300">
                                                Nhấn &ldquo;Thêm Nguyên Liệu&rdquo; để bắt đầu thiết lập
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : danhSach.map((dm, idx) => (
                                <tr key={dm.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">
                                                {dm.NguyenLieu?.ten_nguyen_lieu || '—'}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-mono">
                                                {dm.NguyenLieu?.don_vi_tinh || 'N/A'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-gray-700">
                                            {dm.luong_tieu_hao}
                                            <span className="text-[10px] text-gray-400 ml-1 font-normal">
                                                {dm.don_vi_tinh || dm.NguyenLieu?.don_vi_tinh || ''}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm text-gray-600 font-mono">
                                            {dm.don_gia_von > 0 ? (
                                                <>
                                                    {fmt(dm.don_gia_von)}
                                                    <span className="text-[10px] text-gray-400 font-sans ml-1">/ {dm.NguyenLieu?.don_vi_tinh || 'đv'}</span>
                                                </>
                                            ) : <span className="text-gray-300 text-xs font-sans">Chưa có giá</span>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-amber-600">
                                            {dm.chi_phi > 0 ? fmt(dm.chi_phi) : '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => {
                                                    setEditingId(dm.id);
                                                    setEditLuong(String(dm.luong_tieu_hao));
                                                    setEditDonVi(dm.don_vi_tinh || dm.NguyenLieu?.don_vi_tinh || '');
                                                }}
                                                className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                                title="Sửa lượng tiêu hao"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingDM(dm)}
                                                className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                                                title="Xóa"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Footer tổng */}
                        {danhSach.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 border-gray-100 bg-gray-50">
                                    <td colSpan={4} className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">
                                        Tổng Chi Phí Nguyên Liệu
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <span className="font-black text-base text-amber-600">{fmt(tongChiPhi)}</span>
                                    </td>
                                    <td />
                                </tr>
                                {monAn && (
                                    <tr className="border-t border-gray-100">
                                        <td colSpan={4} className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">
                                            Lợi Nhuận NL Ước Tính
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`font-black text-base ${monAn.gia_tien - tongChiPhi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {fmt(monAn.gia_tien - tongChiPhi)}
                                            </span>
                                        </td>
                                        <td />
                                    </tr>
                                )}
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* ── Modals ── */}
            {hasModal && (
                <AdminModal
                    onClose={() => {
                        setIsAddOpen(false);
                        setEditingId(null);
                        setDeletingDM(null);
                    }}
                    maxWidth={deletingDM ? 'max-w-sm' : 'max-w-md'}
                >
                    {/* Modal thêm */}
                    {isAddOpen && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Plus size={18} className="text-amber-500" />
                                </div>
                                <h3 className="font-black text-gray-800">Thêm Nguyên Liệu</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                        Nguyên Liệu
                                    </label>
                                    <select
                                        value={addNLId}
                                        onChange={(e) => setAddNLId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d9a01e]/30 focus:border-[#d9a01e] transition-all"
                                    >
                                        <option value="">-- Chọn nguyên liệu --</option>
                                        {nlChuaCoTrongDM.map((nl) => (
                                            <option key={nl.id} value={nl.id}>
                                                {nl.ten_nguyen_lieu} {nl.don_vi_tinh ? `(${nl.don_vi_tinh})` : ''}
                                                {nl.loai_quan_ly === 'TU_DONG' ? ' ⚡' : ' ✏️'}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">⚡ Tự động trừ kho &nbsp;|&nbsp; ✏️ Thủ công</p>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                        Lượng Tiêu Hao
                                        {addNLId && (
                                            <span className="ml-2 font-normal text-gray-400">
                                                ({nguyenLieus.find(n => n.id === addNLId)?.don_vi_tinh || 'đơn vị'})
                                            </span>
                                        )}
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={addLuong}
                                                onChange={(e) => setAddLuong(e.target.value)}
                                                placeholder="VD: 0.15"
                                                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d9a01e]/30 focus:border-[#d9a01e] transition-all"
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <select
                                                value={addDonVi}
                                                onChange={(e) => setAddDonVi(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d9a01e]/30 focus:border-[#d9a01e] transition-all"
                                            >
                                                <option value="">-- Đơn vị --</option>
                                                {getCompatibleUnits(nguyenLieus.find(n => n.id === addNLId)?.don_vi_tinh).map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setIsAddOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={isAdding}
                                    className="flex-1 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg,#d9a01e,#f5c842)' }}
                                >
                                    {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {isAdding ? 'Đang lưu...' : 'Thêm'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Modal sửa */}
                    {editingId && !isAddOpen && !deletingDM && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Edit2 size={18} className="text-blue-500" />
                                </div>
                                <h3 className="font-black text-gray-800">Sửa Lượng Tiêu Hao</h3>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                    Lượng Tiêu Hao Mới
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={editLuong}
                                            onChange={(e) => setEditLuong(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d9a01e]/30 focus:border-[#d9a01e] transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <select
                                            value={editDonVi}
                                            onChange={(e) => setEditDonVi(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d9a01e]/30 focus:border-[#d9a01e] transition-all"
                                        >
                                            <option value="">-- Đơn vị --</option>
                                            {getCompatibleUnits(danhSach.find(d => d.id === editingId)?.NguyenLieu?.don_vi_tinh).map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleEdit}
                                    disabled={isEditing}
                                    className="flex-1 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg,#d9a01e,#f5c842)' }}
                                >
                                    {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} />}
                                    {isEditing ? 'Đang lưu...' : 'Cập Nhật'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Modal xóa */}
                    {deletingDM && (
                        <AdminDeleteConfirm
                            itemName={deletingDM.NguyenLieu?.ten_nguyen_lieu || 'nguyên liệu này'}
                            itemType="định mức"
                            onConfirm={handleDelete}
                            onCancel={() => setDeletingDM(null)}
                            isDeleting={isDeleting}
                        />
                    )}
                </AdminModal>
            )}
        </div>
    );
}
