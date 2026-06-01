'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ClipboardCheck,
    Eye,
    FileDown,
    Loader2,
    PackageSearch,
    Printer,
    Save,
    Search,
    RefreshCw,
    X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { nguyenLieuService } from '@/services/nguyenLieu.service';
import { khoService } from '@/services/kho.service';
import { loaiNguyenLieuService } from '@/services/loaiNguyenLieu.service';
import { NguyenLieu } from '@/types/nguyenLieu';
import { LoaiNguyenLieu } from '@/types/loaiNguyenLieu';
import { PhieuKiemKeSummary } from '@/types/kho';
import {
    AdminModal,
    AdminPageHeader,
    AdminTableCard,
    useAdminToast,
} from '@/components/admin/ui';
import { PhieuKiemKeDetail } from '@/types/kho';

interface AuditLine {
    id_nguyen_lieu: string;
    so_luong_thuc_te: string;
}

const formatMoney = (value: number | string | null | undefined) =>
    `${Number(value || 0).toLocaleString('vi-VN')} d`;

export default function StockAuditPage() {
    const [ingredients, setIngredients] = useState<NguyenLieu[]>([]);
    const [categories, setCategories] = useState<LoaiNguyenLieu[]>([]);
    const [audits, setAudits] = useState<PhieuKiemKeSummary[]>([]);
    const [lines, setLines] = useState<AuditLine[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<PhieuKiemKeDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const { showToast, toastNode } = useAdminToast();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [ingredientRes, auditRes, catRes] = await Promise.all([
                nguyenLieuService.getAll(),
                khoService.layDanhSachPhieuKiemKe(),
                loaiNguyenLieuService.getAll(),
            ]);
            const loadedIngredients = ingredientRes.data || [];
            setIngredients(loadedIngredients);
            setCategories(catRes.data || []);
            setAudits(auditRes.data || []);
            setLines(loadedIngredients.map((item) => ({
                id_nguyen_lieu: item.id,
                so_luong_thuc_te: String(Number(item.so_luong_ton || 0)),
            })));
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Lỗi khi tải dữ liệu kiểm kê', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const ingredientMap = useMemo(() => {
        const map = new Map<string, NguyenLieu>();
        ingredients.forEach((item) => map.set(item.id, item));
        return map;
    }, [ingredients]);

    const updateActualQuantity = (id: string, value: string) => {
        setLines((current) => current.map((line) => (
            line.id_nguyen_lieu === id ? { ...line, so_luong_thuc_te: value } : line
        )));
    };

    const auditRows = lines.map((line) => {
        const ingredient = ingredientMap.get(line.id_nguyen_lieu);
        const systemQuantity = Number(ingredient?.so_luong_ton || 0);
        const actualQuantity = Number(line.so_luong_thuc_te || 0);
        const difference = systemQuantity - actualQuantity;
        const unitCost = Number(ingredient?.gia_von_binh_quan || ingredient?.gia_nhap_gan_nhat || 0);

        return {
            ...line,
            ingredient,
            systemQuantity,
            actualQuantity,
            difference,
            lossValue: difference * unitCost,
        };
    });

    const changedRows = auditRows.filter((row) => row.ingredient && row.actualQuantity >= 0 && row.actualQuantity !== row.systemQuantity);
    const totalDifference = auditRows.reduce((sum, row) => sum + row.difference, 0);
    const totalLossValue = auditRows.reduce((sum, row) => sum + row.lossValue, 0);

    const displayAuditRows = auditRows.filter(row => {
        const matchSearch = row.ingredient?.ten_nguyen_lieu.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'all' || row.ingredient?.id_loai_nguyen_lieu === selectedCategory;
        return matchSearch && matchCategory;
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const submitRows = auditRows.filter((row) => row.ingredient && row.actualQuantity >= 0);

        if (submitRows.length === 0) {
            showToast('Không có nguyên liệu để kiểm kê', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            await khoService.kiemKeKho({
                items: submitRows.map((row) => ({
                    id_nguyen_lieu: row.id_nguyen_lieu,
                    so_luong_thuc_te: row.actualQuantity,
                })),
            });
            showToast('Kiểm kê kho thành công');
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể chốt kiểm kê', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetail = async (id: string) => {
        try {
            setIsDetailLoading(true);
            setIsModalOpen(true);
            const res = await khoService.layChiTietPhieuKiemKe(id);
            setSelectedAudit(res.data);
        } catch (error: any) {
            showToast('Không thể tải chi tiết phiếu kiểm kê', 'error');
            setIsModalOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleExportExcel = (receipt: PhieuKiemKeDetail) => {
        // Header info
        const header = [
            [`MÃ PHIẾU KIỂM KÊ: ${receipt.ma_phieu}`],
            [`NGƯỜI TẠO: ${receipt.NguoiDung?.ho_ten}`],
            [`THỜI GIAN: ${new Date(receipt.thoi_gian).toLocaleString('vi-VN')}`],
            [''],
            ['STT', 'Nguyên liệu', 'Đơn vị', 'Tồn hệ thống', 'Tồn thực tế', 'Chênh lệch', 'Giá trị lệch'],
        ];

        // Rows
        const rows = receipt.ChiTietHaoHuts.map((ct, idx) => [
            idx + 1,
            ct.NguyenLieu?.ten_nguyen_lieu || 'N/A',
            ct.NguyenLieu?.don_vi_tinh || '-',
            Number(ct.luong_ban_ly_thuyet),
            Number(ct.luong_du_thuc_te),
            Number(ct.luong_hao_hut),
            Number(ct.gia_tri_hao_hut),
        ]);

        const wsData = [...header, ...rows];

        // Total
        const totalValue = receipt.ChiTietHaoHuts.reduce((sum, item) => sum + Number(item.gia_tri_hao_hut || 0), 0);
        wsData.push(['', 'TỔNG CỘNG GIÁ TRỊ LỆCH', '', '', '', '', totalValue]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết kiểm kê');

        ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];

        XLSX.writeFile(wb, `KiemKe_${receipt.ma_phieu}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<ClipboardCheck size={22} className="text-white" />}
                title="Kiểm Kê Kho"
                subtitle={`${ingredients.length} nguyên liệu - chênh lệch ${totalDifference.toLocaleString('vi-VN')}`}
            />

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Danh mục:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full sm:w-48 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#d9a01e] focus:bg-white transition-all"
                        >
                            <option value="all">Tất cả loại nguyên liệu</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.ten_loai}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search, Refresh & Reset */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative group w-full md:w-56">
                        <Search
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Tìm tên nguyên liệu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all"
                        />
                    </div>
                    {(searchTerm || selectedCategory !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                            className="p-2.5 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl border border-transparent transition-all shrink-0"
                            title="Xóa tìm kiếm và lọc"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-[#d9a01e]"><ClipboardCheck size={16} /></span>
                        <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Bảng kiểm kê thực tế</span>
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Giá trị lệch: {formatMoney(totalLossValue)}
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Nguyên liệu</th>
                                <th className="px-6 py-4 text-center">Đơn vị</th>
                                <th className="px-6 py-4 text-right">Tồn hệ thống</th>
                                <th className="px-6 py-4 text-right">Tồn thực tế</th>
                                <th className="px-6 py-4 text-right">Chênh lệch</th>
                                <th className="px-6 py-4 text-right">Giá trị lệch</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <Loader2 size={34} className="mx-auto animate-spin text-[#d9a01e]" />
                                    </td>
                                </tr>
                            ) : displayAuditRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        Không tìm thấy nguyên liệu
                                    </td>
                                </tr>
                            ) : displayAuditRows.map((row) => (
                                <tr key={row.id_nguyen_lieu} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800">{row.ingredient?.ten_nguyen_lieu}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-bold">
                                            {row.ingredient?.don_vi_tinh || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-700">
                                        {row.systemQuantity.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row.so_luong_thuc_te}
                                            onChange={(event) => updateActualQuantity(row.id_nguyen_lieu, event.target.value)}
                                            className="ml-auto block w-36 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-right text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e]"
                                            required
                                        />
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black ${row.difference === 0 ? 'text-gray-400' : row.difference > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {row.difference.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-[#d9a01e]">
                                        {formatMoney(row.lossValue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading || ingredients.length === 0}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white text-xs font-black uppercase tracking-widest shadow-md hover:shadow-[#d9a01e]/30 disabled:opacity-60 transition-all"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Chốt kiểm kê
                    </button>
                </div>
            </form>

            <AdminTableCard icon={<PackageSearch size={16} />} title="Phiếu kiểm kê gần đây" count={audits.length}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Mã phiếu</th>
                            <th className="px-6 py-4">Người tạo</th>
                            <th className="px-6 py-4 text-right">Tổng SL lệch</th>
                            <th className="px-6 py-4 text-right">Tổng giá trị lệch</th>
                            <th className="px-6 py-4 text-right">Thời gian</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {audits.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
                                    Chưa có phiếu kiểm kê
                                </td>
                            </tr>
                        ) : audits.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 font-black text-gray-800">{item.ma_phieu}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{item.nguoi_tao}</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-700">{Number(item.tong_sl_lech || 0).toLocaleString('vi-VN')}</td>
                                <td className="px-6 py-4 text-right font-black text-[#d9a01e]">{formatMoney(item.tong_gia_tri_lech)}</td>
                                <td className="px-6 py-4 text-right text-xs text-gray-400 font-bold">
                                    {new Date(item.thoi_gian).toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleViewDetail(item.id)}
                                        className="p-2 bg-gray-100 hover:bg-[#d9a01e]/10 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminTableCard>

            {isModalOpen && (
                <AdminModal onClose={() => setIsModalOpen(false)} maxWidth="max-w-5xl">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 print:shadow-none print:border-none">
                        {isDetailLoading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 size={40} className="animate-spin text-[#d9a01e]" />
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Đang tải chi tiết...</span>
                            </div>
                        ) : selectedAudit ? (
                            <>
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50 print:hidden">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-[#d9a01e] rounded-2xl text-white shadow-lg shadow-[#d9a01e]/20">
                                            <ClipboardCheck size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Chi tiết kiểm kê</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedAudit.ma_phieu}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleExportExcel(selectedAudit)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-100 transition-all"
                                        >
                                            <FileDown size={14} />
                                            Xuất Excel
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                                        >
                                            <Printer size={14} />
                                            In biên bản
                                        </button>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2.5 bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-200 transition-all ml-2"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Printable Content */}
                                <div className="p-10 print:p-0 bg-white" id="printable-audit">
                                    <div className="hidden print:block text-center mb-10 border-b-2 border-gray-900 pb-6">
                                        <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-1">COOKSMART RESTAURANT</h1>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Biên bản kiểm kê kho định kỳ</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Địa chỉ: 123 Đường ABC, Quận X, TP. Hồ Chí Minh | Hotline: 1900 xxxx</p>
                                    </div>

                                    <div className="text-center mb-10">
                                        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800">BIÊN BẢN KIỂM KÊ KHO</h2>
                                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Mã số: {selectedAudit.ma_phieu}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-12 mb-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày kiểm kê:</span>
                                                <span className="text-xs font-bold text-gray-700">{new Date(selectedAudit.thoi_gian).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian chốt:</span>
                                                <span className="text-xs font-bold text-gray-700">{new Date(selectedAudit.thoi_gian).toLocaleTimeString('vi-VN')}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Người kiểm kê:</span>
                                                <span className="text-xs font-black text-gray-800 uppercase">{selectedAudit.NguoiDung?.ho_ten}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái:</span>
                                                <span className="text-xs font-black text-green-600 uppercase">Đã chốt sổ</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-2 border-gray-900 rounded-2xl overflow-hidden mb-8">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-900 text-[10px] font-black text-white uppercase tracking-widest">
                                                    <th className="px-4 py-3 w-10 text-center">STT</th>
                                                    <th className="px-4 py-3">Tên nguyên liệu</th>
                                                    <th className="px-4 py-3 text-center">Đơn vị</th>
                                                    <th className="px-4 py-3 text-right">Tồn HT</th>
                                                    <th className="px-4 py-3 text-right">Thực tế</th>
                                                    <th className="px-4 py-3 text-right">Chênh lệch</th>
                                                    <th className="px-4 py-3 text-right">Giá trị lệch</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedAudit.ChiTietHaoHuts.map((ct, idx) => (
                                                    <tr key={ct.id} className="text-xs text-gray-800">
                                                        <td className="px-4 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
                                                        <td className="px-4 py-4 font-black uppercase tracking-tight">{ct.NguyenLieu?.ten_nguyen_lieu}</td>
                                                        <td className="px-4 py-4 text-center font-bold text-gray-500">{ct.NguyenLieu?.don_vi_tinh || '-'}</td>
                                                        <td className="px-4 py-4 text-right font-bold">{Number(ct.luong_ban_ly_thuyet)}</td>
                                                        <td className="px-4 py-4 text-right font-bold text-blue-600">{Number(ct.luong_du_thuc_te)}</td>
                                                        <td className={`px-4 py-4 text-right font-black ${Number(ct.luong_hao_hut) === 0 ? 'text-gray-400' : Number(ct.luong_hao_hut) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {Number(ct.luong_hao_hut)}
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-black text-gray-900">{formatMoney(ct.gia_tri_hao_hut)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50 font-black">
                                                    <td colSpan={6} className="px-4 py-5 text-right text-[10px] uppercase tracking-widest text-gray-500">Tổng cộng giá trị chênh lệch:</td>
                                                    <td className="px-4 py-5 text-right text-lg text-[#d9a01e] border-l border-gray-100">
                                                        {formatMoney(selectedAudit.ChiTietHaoHuts.reduce((sum, item) => sum + Number(item.gia_tri_hao_hut || 0), 0))}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 mt-12 text-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-20">Người kiểm kê</p>
                                            <p className="text-xs font-black text-gray-800 uppercase">{selectedAudit.NguoiDung?.ho_ten}</p>
                                            <p className="text-[9px] text-gray-400">(Ký và ghi rõ họ tên)</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-20">Quản lý kho</p>
                                            <div className="w-20 h-px bg-gray-200 mx-auto mb-2" />
                                            <p className="text-[9px] text-gray-400">(Ký và ghi rõ họ tên)</p>
                                        </div>
                                    </div>

                                    <div className="hidden print:block text-center mt-20 pt-10 border-t border-dashed border-gray-200">
                                        <p className="text-[10px] text-gray-400 italic">Dữ liệu kiểm kê đã được cập nhật vào hệ thống báo cáo tài chính.</p>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </AdminModal>
            )}
        </div>
    );
}
