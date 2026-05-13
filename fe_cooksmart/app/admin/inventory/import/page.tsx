'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ClipboardList,
    Eye,
    FileDown,
    Loader2,
    PackageSearch,
    Plus,
    Printer,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { nguyenLieuService } from '@/services/nguyenLieu.service';
import { khoService } from '@/services/kho.service';
import { NguyenLieu } from '@/types/nguyenLieu';
import { PhieuNhapXuatSummary } from '@/types/kho';
import {
    AdminFilterTabs,
    AdminModal,
    AdminPageHeader,
    AdminTableCard,
    useAdminToast,
} from '@/components/admin/ui';
import { PhieuNhapXuatDetail } from '@/types/kho';

type StockMode = 'NHAP_HANG' | 'XUAT_BAN' | 'HUY_HANG';

interface StockLine {
    id_nguyen_lieu: string;
    so_luong: string;
    don_gia: string;
}

const emptyLine = (): StockLine => ({
    id_nguyen_lieu: '',
    so_luong: '',
    don_gia: '',
});

const modeTabs = [
    { value: 'NHAP_HANG', label: 'Nhập kho' },
    { value: 'XUAT_BAN', label: 'Xuất bán' },
    { value: 'HUY_HANG', label: 'Hủy hàng' },
];

const formatMoney = (value: number | string | null | undefined) =>
    `${Number(value || 0).toLocaleString('vi-VN')} d`;

export default function StockImportExportPage() {
    const [ingredients, setIngredients] = useState<NguyenLieu[]>([]);
    const [receipts, setReceipts] = useState<PhieuNhapXuatSummary[]>([]);
    const [mode, setMode] = useState<StockMode>('NHAP_HANG');
    const [lines, setLines] = useState<StockLine[]>([emptyLine()]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<PhieuNhapXuatDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const { showToast, toastNode } = useAdminToast();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [ingredientRes, receiptRes] = await Promise.all([
                nguyenLieuService.getAll(),
                khoService.layDanhSachPhieuNhapXuat({ loai_giao_dich: 'ALL' }),
            ]);
            setIngredients(ingredientRes.data);
            setReceipts(receiptRes.data || []);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Loi khi tai du lieu kho', 'error');
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

    const updateLine = (index: number, key: keyof StockLine, value: string) => {
        setLines((current) => current.map((line, i) => {
            if (i !== index) return line;
            if (key !== 'id_nguyen_lieu') return { ...line, [key]: value };

            const selected = ingredientMap.get(value);
            return {
                ...line,
                id_nguyen_lieu: value,
                don_gia: mode === 'NHAP_HANG'
                    ? String(Number(selected?.gia_nhap_gan_nhat || selected?.gia_von_binh_quan || 0))
                    : line.don_gia,
            };
        }));
    };

    const addLine = () => setLines((current) => [...current, emptyLine()]);

    const removeLine = (index: number) => {
        setLines((current) => current.length === 1 ? [emptyLine()] : current.filter((_, i) => i !== index));
    };

    const resetForm = () => setLines([emptyLine()]);

    const validLines = lines
        .map((line) => ({
            ...line,
            so_luong_num: Number(line.so_luong),
            don_gia_num: Number(line.don_gia),
        }))
        .filter((line) => line.id_nguyen_lieu && line.so_luong_num > 0);

    const totalValue = validLines.reduce((sum, line) => {
        if (mode !== 'NHAP_HANG') return sum;
        return sum + line.so_luong_num * line.don_gia_num;
    }, 0);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (validLines.length === 0) {
            showToast('Vui long chon nguyen lieu va nhap so luong hop le', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            if (mode === 'NHAP_HANG') {
                await khoService.nhapKho({
                    items: validLines.map((line) => ({
                        id_nguyen_lieu: line.id_nguyen_lieu,
                        so_luong_nhap: line.so_luong_num,
                        gia_nhap: line.don_gia_num,
                    })),
                });
                showToast('Nhập kho thành công');
            } else {
                await khoService.xuatKho({
                    items: validLines.map((line) => ({
                        id_nguyen_lieu: line.id_nguyen_lieu,
                        so_luong_xuat: line.so_luong_num,
                        loai_giao_dich: mode,
                    })),
                });
                showToast(mode === 'HUY_HANG' ? 'Đã ghi nhận hủy hàng' : 'Xuất kho thành công');
            }

            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Khong the luu phieu kho', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetail = async (id: string) => {
        try {
            setIsDetailLoading(true);
            setIsModalOpen(true);
            const res = await khoService.layChiTietPhieuNhapXuat(id);
            setSelectedReceipt(res.data);
        } catch (error: any) {
            showToast('Khong the tai chi tiet phieu', 'error');
            setIsModalOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleExportExcel = (receipt: PhieuNhapXuatDetail) => {
        const transType = {
            NHAP_HANG: 'Nhập hàng',
            XUAT_BAN: 'Xuất bán',
            HUY_HANG: 'Hủy hàng',
            KIEM_KE_CHOT_LO: 'Kiểm kê',
        };

        // Create an array of arrays for the header
        const header = [
            [`MÃ PHIẾU: ${receipt.ma_phieu}`],
            [`LOẠI GIAO DỊCH: ${transType[receipt.loai_giao_dich] || receipt.loai_giao_dich}`],
            [`NGƯỜI THỰC HIỆN: ${receipt.NguoiDung?.ho_ten}`],
            [`THỜI GIAN: ${new Date(receipt.thoi_gian).toLocaleString('vi-VN')}`],
            [''], // Empty row
            ['STT', 'Nguyên liệu', 'Số lượng', 'Đơn vị', 'Đơn giá', 'Thành tiền'], // Table header
        ];

        // Map the items data
        const rows = receipt.ChiTiets.map((ct, idx) => [
            idx + 1,
            ct.NguyenLieu?.ten_nguyen_lieu || 'N/A',
            Number(ct.so_luong),
            ct.NguyenLieu?.don_vi_tinh || '-',
            Number(ct.don_gia),
            Number(ct.thanh_tien),
        ]);

        // Combine header and rows
        const wsData = [...header, ...rows];

        // Add total row
        const total = receipt.ChiTiets.reduce((sum, item) => sum + Number(item.thanh_tien || 0), 0);
        wsData.push(['', 'TỔNG CỘNG GIÁ TRỊ', '', '', '', total]);

        // Create worksheet and workbook
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Chi tiet phieu');

        // Set column widths for better readability
        ws['!cols'] = [
            { wch: 5 },  // STT
            { wch: 30 }, // Nguyen lieu
            { wch: 10 }, // So luong
            { wch: 10 }, // Don vi
            { wch: 15 }, // Don gia
            { wch: 20 }, // Thanh tien
        ];

        XLSX.writeFile(wb, `PhieuKho_${receipt.ma_phieu}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredReceipts = receipts.filter((item) => item.loai_giao_dich !== 'KIEM_KE_CHOT_LO');

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<ClipboardList size={22} className="text-white" />}
                title="Nhap / Xuat Kho"
                subtitle={`${ingredients.length} nguyen lieu - ${filteredReceipts.length} phieu gan day`}
                hideSearch
                onRefresh={fetchData}
                isLoading={isLoading}
            />

            <AdminFilterTabs
                tabs={modeTabs}
                active={mode}
                onChange={(value) => setMode(value as StockMode)}
            />

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-[#d9a01e]">
                            {mode === 'NHAP_HANG' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                        </span>
                        <span className="text-sm font-black text-gray-700 uppercase tracking-widest">
                            {mode === 'NHAP_HANG' ? 'Lap phieu nhap kho' : 'Lap phieu xuat kho'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={addLine}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-black uppercase tracking-widest text-gray-600 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all"
                    >
                        <Plus size={15} />
                        Them dong
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4 min-w-64">Nguyen lieu</th>
                                <th className="px-6 py-4 text-right w-40">Ton hien tai</th>
                                <th className="px-6 py-4 text-right w-40">So luong</th>
                                {mode === 'NHAP_HANG' && <th className="px-6 py-4 text-right w-44">Gia nhap</th>}
                                {mode === 'NHAP_HANG' && <th className="px-6 py-4 text-right w-44">Thanh tien</th>}
                                <th className="px-6 py-4 text-right w-24">Xoa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lines.map((line, index) => {
                                const selected = ingredientMap.get(line.id_nguyen_lieu);
                                const lineValue = Number(line.so_luong || 0) * Number(line.don_gia || 0);

                                return (
                                    <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <select
                                                value={line.id_nguyen_lieu}
                                                onChange={(event) => updateLine(index, 'id_nguyen_lieu', event.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e]"
                                                required
                                            >
                                                <option value="">Chon nguyen lieu</option>
                                                {ingredients.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.ten_nguyen_lieu} ({item.don_vi_tinh || '-'})
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                            {selected ? `${Number(selected.so_luong_ton || 0).toLocaleString('vi-VN')} ${selected.don_vi_tinh || ''}` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={line.so_luong}
                                                onChange={(event) => updateLine(index, 'so_luong', event.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-right text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e]"
                                                required
                                            />
                                        </td>
                                        {mode === 'NHAP_HANG' && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={line.don_gia}
                                                    onChange={(event) => updateLine(index, 'don_gia', event.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-right text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e]"
                                                    required
                                                />
                                            </td>
                                        )}
                                        {mode === 'NHAP_HANG' && (
                                            <td className="px-6 py-4 text-right text-sm font-black text-[#d9a01e]">
                                                {formatMoney(lineValue)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(index)}
                                                className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                                                title="Xoa dong"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="text-sm text-gray-500 font-medium">
                        {mode === 'NHAP_HANG' ? `Tong gia tri: ${formatMoney(totalValue)}` : 'Gia xuat kho lay theo gia von binh quan'}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white text-xs font-black uppercase tracking-widest shadow-md hover:shadow-[#d9a01e]/30 disabled:opacity-60 transition-all"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Luu phieu
                    </button>
                </div>
            </form>

            <AdminTableCard icon={<PackageSearch size={16} />} title="Phieu nhap / xuat gan day" count={filteredReceipts.length}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Ma phieu</th>
                            <th className="px-6 py-4">Loai</th>
                            <th className="px-6 py-4">Nguoi thuc hien</th>
                            <th className="px-6 py-4 text-right">Mat hang</th>
                            <th className="px-6 py-4 text-right">Tong gia tri</th>
                            <th className="px-6 py-4 text-right">Thoi gian</th>
                            <th className="px-6 py-4 text-right">Thao tac</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <Loader2 size={30} className="mx-auto animate-spin text-[#d9a01e]" />
                                </td>
                            </tr>
                        ) : filteredReceipts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
                                    Chua co phieu kho
                                </td>
                            </tr>
                        ) : filteredReceipts.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 font-black text-gray-800">{item.ma_phieu}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.loai_giao_dich}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{item.nguoi_thuc_hien}</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-700">{item.so_mat_hang}</td>
                                <td className="px-6 py-4 text-right font-black text-[#d9a01e]">{formatMoney(item.tong_gia_tri)}</td>
                                <td className="px-6 py-4 text-right text-xs text-gray-400 font-bold">
                                    {new Date(item.thoi_gian).toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleViewDetail(item.id)}
                                        className="p-2 bg-gray-100 hover:bg-[#d9a01e]/10 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                        title="Xem chi tiet"
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
                <AdminModal onClose={() => setIsModalOpen(false)} maxWidth="max-w-4xl">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 print:shadow-none print:border-none">
                        {isDetailLoading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 size={40} className="animate-spin text-[#d9a01e]" />
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Dang tai chi tiet...</span>
                            </div>
                        ) : selectedReceipt ? (
                            <>
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50 print:hidden">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-[#d9a01e] rounded-2xl text-white shadow-lg shadow-[#d9a01e]/20">
                                            <ClipboardList size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Chi tiết phiếu kho</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedReceipt.ma_phieu}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleExportExcel(selectedReceipt)}
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
                                            In hóa đơn
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
                                <div className="p-10 print:p-0 bg-white" id="printable-receipt">
                                    <div className="hidden print:block text-center mb-10 border-b-2 border-gray-900 pb-6">
                                        <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-1">COOKSMART RESTAURANT</h1>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Hệ thống quản lý nhà hàng chuyên nghiệp</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Địa chỉ: 123 Đường ABC, Quận X, TP. Hồ Chí Minh | Hotline: 1900 xxxx</p>
                                    </div>

                                    <div className="text-center mb-10">
                                        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800">
                                            {selectedReceipt.loai_giao_dich === 'NHAP_HANG' ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO'}
                                        </h2>
                                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Mã số: {selectedReceipt.ma_phieu}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-12 mb-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại phiếu:</span>
                                                <span className="text-xs font-black text-gray-800 uppercase">
                                                    {selectedReceipt.loai_giao_dich === 'NHAP_HANG' ? 'Nhập hàng' : selectedReceipt.loai_giao_dich === 'XUAT_BAN' ? 'Xuất bán' : 'Hủy hàng'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày lập:</span>
                                                <span className="text-xs font-bold text-gray-700">{new Date(selectedReceipt.thoi_gian).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giờ lập:</span>
                                                <span className="text-xs font-bold text-gray-700">{new Date(selectedReceipt.thoi_gian).toLocaleTimeString('vi-VN')}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Người thực hiện:</span>
                                                <span className="text-xs font-black text-gray-800 uppercase">{selectedReceipt.NguoiDung?.ho_ten}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái:</span>
                                                <span className="text-xs font-black text-green-600 uppercase">Đã hoàn tất</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kho:</span>
                                                <span className="text-xs font-bold text-gray-700">Kho trung tâm</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-2 border-gray-900 rounded-2xl overflow-hidden mb-8">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-900 text-[10px] font-black text-white uppercase tracking-widest">
                                                    <th className="px-5 py-3 w-12 text-center">STT</th>
                                                    <th className="px-5 py-3">Tên nguyên liệu</th>
                                                    <th className="px-5 py-3 text-center w-24">Đơn vị</th>
                                                    <th className="px-5 py-3 text-right w-24">Số lượng</th>
                                                    <th className="px-5 py-3 text-right w-32">Đơn giá</th>
                                                    <th className="px-5 py-3 text-right w-32">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedReceipt.ChiTiets.map((ct, idx) => (
                                                    <tr key={ct.id} className="text-xs text-gray-800">
                                                        <td className="px-5 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
                                                        <td className="px-5 py-4 font-black uppercase tracking-tight">{ct.NguyenLieu?.ten_nguyen_lieu}</td>
                                                        <td className="px-5 py-4 text-center font-bold text-gray-500">{ct.NguyenLieu?.don_vi_tinh || '-'}</td>
                                                        <td className="px-5 py-4 text-right font-black">{ct.so_luong}</td>
                                                        <td className="px-5 py-4 text-right font-bold text-gray-600">{formatMoney(ct.don_gia)}</td>
                                                        <td className="px-5 py-4 text-right font-black text-gray-900">{formatMoney(ct.thanh_tien)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50 font-black">
                                                    <td colSpan={5} className="px-5 py-5 text-right text-[10px] uppercase tracking-widest text-gray-500">Tổng cộng giá trị thanh toán:</td>
                                                    <td className="px-5 py-5 text-right text-lg text-gray-900 border-l border-gray-100">{formatMoney(selectedReceipt.ChiTiets.reduce((sum, item) => sum + Number(item.thanh_tien || 0), 0))}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {selectedReceipt.ghi_chu && (
                                        <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-200">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ghi chú:</span>
                                            <p className="text-sm text-gray-600 italic">"{selectedReceipt.ghi_chu}"</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-8 mt-12 text-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-20">Người lập phiếu</p>
                                            <p className="text-xs font-black text-gray-800 uppercase">{selectedReceipt.NguoiDung?.ho_ten}</p>
                                            <p className="text-[9px] text-gray-400">(Ký và ghi rõ họ tên)</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-20">Người giao hàng</p>
                                            <div className="w-20 h-px bg-gray-200 mx-auto mb-2" />
                                            <p className="text-[9px] text-gray-400">(Ký và ghi rõ họ tên)</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-20">Thủ kho</p>
                                            <div className="w-20 h-px bg-gray-200 mx-auto mb-2" />
                                            <p className="text-[9px] text-gray-400">(Ký và ghi rõ họ tên)</p>
                                        </div>
                                    </div>

                                    <div className="hidden print:block text-center mt-20 pt-10 border-t border-dashed border-gray-200">
                                        <p className="text-[10px] text-gray-400 italic">Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ của CookSmart!</p>
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
