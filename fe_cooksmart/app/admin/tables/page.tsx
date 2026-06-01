'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    LayoutGrid,
    UtensilsCrossed,
    Clock,
    CheckCircle,
    X,
    MapPin,
    QrCode,
    Download,
    Link2,
    Copy,
    Edit2,
    Trash2,
    Loader2,
    Search,
    RefreshCw
} from 'lucide-react';
import { BanAn, TrangThaiBan } from '@/types/banAn';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminFilterTabs,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';
import DynamicForm, { FormField } from '@/components/admin/form/DynamicForm';
import { useTableManagement } from '@/hooks/admin/table/useTableManagement';
import { useTableQR } from '@/hooks/admin/table/useTableQR';

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

const TRANG_THAI_OPTIONS = [
    { value: 'Trong', label: 'Trống' },
    { value: 'DangPhucVu', label: 'Đang phục vụ' },
    { value: 'DatTruoc', label: 'Đặt trước' },
];

function QRModal({ ban, onClose }: { ban: BanAn; onClose: () => void }) {
    const { qrData, isLoadingQR, copied, handleDownload, handleCopyLink } = useTableQR(ban);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mã QR Gọi Món</p>
                            <h2 className="text-xl font-black mt-0.5">Bàn {ban.so_ban}</h2>
                            {ban.vi_tri && <p className="text-xs text-gray-400 mt-0.5">{ban.vi_tri}</p>}
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-center p-8 bg-gray-50">
                    {isLoadingQR ? (
                        <div className="w-48 h-48 flex items-center justify-center">
                            <Loader2 size={32} className="animate-spin text-amber-400" />
                        </div>
                    ) : qrData ? (
                        <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100">
                            <img src={qrData.qr_code} alt={`QR Bàn ${ban.so_ban}`} className="w-48 h-48 object-contain" />
                        </div>
                    ) : (
                        <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                            <QrCode size={40} className="text-gray-300" />
                            <p className="text-xs font-bold">Không thể tải QR</p>
                        </div>
                    )}
                </div>
                {qrData && (
                    <div className="mx-5 mb-4 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        <Link2 size={13} className="text-gray-400 shrink-0" />
                        <p className="text-[11px] text-gray-500 font-mono truncate flex-1">{qrData.order_url}</p>
                    </div>
                )}
                <div className="flex gap-2 px-5 pb-5">
                    <button onClick={handleCopyLink} disabled={!qrData}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all disabled:opacity-40 uppercase tracking-wider"
                    >
                        {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? 'Đã copy!' : 'Copy Link'}
                    </button>
                    <button onClick={handleDownload} disabled={!qrData}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 uppercase tracking-wider"
                    >
                        <Download size={14} /> Tải Ảnh QR
                    </button>
                </div>
            </div>
        </div>
    );
}

function TableCard({
    ban,
    onEdit,
    onDelete,
    onShowQR,
}: {
    ban: BanAn;
    onEdit: (ban: BanAn) => void;
    onDelete: (ban: BanAn) => void;
    onShowQR: (ban: BanAn) => void;
}) {
    const cfg = STATUS_CONFIG[ban.trang_thai_ban];
    const canDelete = ban.trang_thai_ban !== 'DangPhucVu';

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#d9a01e]/30 transition-all duration-300 overflow-hidden">
            <div className={`h-1.5 w-full ${ban.trang_thai_ban === 'Trong' ? 'bg-emerald-400' : ban.trang_thai_ban === 'DangPhucVu' ? 'bg-amber-400' : 'bg-blue-400'}`} />
            <div className="p-5">
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
                <div className="space-y-2 mb-5">
                    {ban.vi_tri && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate">{ban.vi_tri}</span>
                        </div>
                    )}
                    {ban.ma_qr_code && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <QrCode size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate font-mono text-xs">{ban.ma_qr_code}</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button onClick={() => onEdit(ban)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-[#d9a01e]/10 hover:text-[#d9a01e] rounded-xl border border-gray-100 hover:border-[#d9a01e]/30 transition-all"><Edit2 size={13} /> Sửa</button>
                    <button onClick={() => onShowQR(ban)} className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl border border-violet-100 hover:border-violet-200 transition-all" title="Xem mã QR"><QrCode size={13} /></button>
                    <button onClick={() => onDelete(ban)} disabled={!canDelete} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border transition-all ${canDelete ? 'text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-500 border-gray-100 hover:border-red-200' : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'}`} title={!canDelete ? 'Không thể xóa bàn đang phục vụ' : ''}><Trash2 size={13} /> Xóa</button>
                </div>
            </div>
        </div>
    );
}

export default function TableManagementPage() {
    const { showToast, toastNode } = useAdminToast();
    const {
        isLoading, searchTerm, setSearchTerm, filterStatus, setFilterStatus,
        isFormOpen, setIsFormOpen, editingTable, deletingTable, setDeletingTable,
        qrTable, setQrTable, isSubmitting, isDeleting,
        fetchTables, handleAdd, handleEdit, handleDeleteClick, handleShowQR,
        handleFormSubmit, handleConfirmDelete, filtered, counts
    } = useTableManagement(showToast);

    const statItems = [
        { label: 'Tổng bàn', value: counts.total, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Đang trống', value: counts.trong, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Đang phục vụ', value: counts.dangPhucVu, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        { label: 'Đặt trước', value: counts.datTruoc, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    ];

    const filterTabs = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Trong', label: 'Trống' },
        { value: 'DangPhucVu', label: 'Đang phục vụ' },
        { value: 'DatTruoc', label: 'Đặt trước' },
    ];

    const tableFormFields: FormField[] = [
        { key: 'so_ban', label: 'Số Bàn', type: 'text', placeholder: 'VD: B01, B02...', required: true },
        { key: 'vi_tri', label: 'Vị Trí', type: 'text', placeholder: 'VD: Tầng 1, Ngoài trời...' },
        { key: 'ma_qr_code', label: 'Mã QR Code', type: 'text', placeholder: 'Mã QR (tuỳ chọn)' },
        { key: 'trang_thai_ban', label: 'Trạng Thái', type: 'select', options: TRANG_THAI_OPTIONS, required: true },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<LayoutGrid size={22} className="text-white" />}
                title="Quản Lý Bàn Ăn"
                subtitle={`Tổng cộng: ${counts.total} bàn`}
                onAdd={handleAdd}
                addLabel="Thêm Bàn"
            />

            <AdminStatCards items={statItems} cols={4} />

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Trạng thái:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as TrangThaiBan | 'all')}
                            className="w-full sm:w-36 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#d9a01e] focus:bg-white transition-all"
                        >
                            {filterTabs.map(tab => (
                                <option key={tab.value} value={tab.value}>{tab.label}</option>
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
                            placeholder="Tìm số bàn, vị trí..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchTables}
                        title="Làm mới"
                        className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all shrink-0"
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {(searchTerm || filterStatus !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="p-2.5 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl border border-transparent transition-all shrink-0"
                            title="Xóa tìm kiếm và lọc"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

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
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={16} className="text-[#d9a01e]" />
                            <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Sơ Đồ Bàn</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{filtered.length} bàn đang hiển thị</span>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-6" style={{ maxHeight: '520px' }}>
                        <div className="grid grid-cols-5 gap-4">
                            {filtered.map((ban) => (
                                <TableCard key={ban.id} ban={ban} onEdit={handleEdit} onDelete={handleDeleteClick} onShowQR={handleShowQR} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {(isFormOpen || deletingTable) && (
                <AdminModal onClose={() => { setIsFormOpen(false); setDeletingTable(null); }} maxWidth={deletingTable ? 'max-w-sm' : 'max-w-xl'}>
                    {isFormOpen && (
                        <DynamicForm
                            title={editingTable ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}
                            fields={tableFormFields}
                            initialData={editingTable ? editingTable : { trang_thai_ban: 'Trong' }}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsFormOpen(false)}
                            isLoading={isSubmitting}
                        />
                    )}
                    {deletingTable && (
                        <AdminDeleteConfirm
                            itemName={`Bàn ${deletingTable.so_ban}`}
                            itemType=""
                            onConfirm={handleConfirmDelete}
                            onCancel={() => setDeletingTable(null)}
                            isDeleting={isDeleting}
                        />
                    )}
                </AdminModal>
            )}

            {qrTable && <QRModal ban={qrTable} onClose={() => setQrTable(null)} />}
        </div>
    );
}
