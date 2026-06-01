'use client';

import React from 'react';
import { 
    Tag, 
    Calendar,
    DollarSign,
    Percent,
    Edit2,
    Trash2,
    Loader2
} from 'lucide-react';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';
import DynamicForm, { FormField } from '@/components/admin/form/DynamicForm';
import { usePromotionManagement } from '@/hooks/admin/promotion/usePromotionManagement';

export default function PromotionsPage() {
    const { showToast, toastNode } = useAdminToast();
    const {
        promotions, isLoading, searchTerm, setSearchTerm, filterStatus, setFilterStatus,
        isFormOpen, setIsFormOpen, editingPromotion, deletingPromotion, setDeletingPromotion,
        isSubmitting, isDeleting,
        fetchPromotions, handleAdd, handleEdit, handleDeleteClick,
        handleFormSubmit, handleConfirmDelete, filtered, statItems
    } = usePromotionManagement(showToast);

    const hasModal = isFormOpen || !!deletingPromotion;

    const promotionFormFields: FormField[] = [
        { key: 'ma_km', label: 'Mã Khuyến Mãi', type: 'text', placeholder: 'VD: SUMMER20, GIAM10K...', required: true },
        { key: 'ten_km', label: 'Tên Khuyến Mãi', type: 'text', placeholder: 'VD: Khai trương giảm giá 10%', required: true },
        { 
            key: 'loai_km', 
            label: 'Loại Khuyến Mãi', 
            type: 'select', 
            options: [
                { value: 'PhanTram', label: 'Phần trăm (%)' },
                { value: 'SoTien', label: 'Số tiền (VNĐ)' },
            ],
            required: true 
        },
        { key: 'gia_tri_km', label: 'Giá Trị', type: 'number', placeholder: 'VD: 10 (nếu là %), 50000 (nếu là VNĐ)', required: true },
        { key: 'gia_tri_dh_toi_thieu', label: 'Đơn Tối Thiểu (VNĐ)', type: 'number', placeholder: 'VD: 200000', required: true },
        { key: 'ngay_bat_dau', label: 'Ngày Bắt Đầu', type: 'date', required: true },
        { key: 'ngay_ket_thuc', label: 'Ngày Kết Thúc', type: 'date', required: true },
        { key: 'so_luong', label: 'Lượt Dùng Tối Đa', type: 'number', placeholder: 'VD: 100 (Để 0 nếu không giới hạn)', required: true },
        { key: 'trang_thai', label: 'Trạng Thái Hoạt Động', type: 'checkbox' },
    ];

    const formatDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<Tag size={22} className="text-white" />}
                title="Quản Lý Khuyến Mãi"
                subtitle="Thiết lập các chương trình giảm giá"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm kiếm khuyến mãi..."
                onAdd={handleAdd}
                addLabel="Tạo Mới"
                isLoading={isLoading}
                onRefresh={() => fetchPromotions(false)}
            />

            <AdminStatCards items={statItems} cols={3} />

            <AdminTableCard
                icon={<Tag size={16} />}
                title="Danh Sách Khuyến Mãi"
                count={filtered.length}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                            <th className="px-6 py-4 w-12 text-center">STT</th>
                            <th className="px-6 py-4">Mã</th>
                            <th className="px-6 py-4">Tên Khuyến Mãi</th>
                            <th className="px-6 py-4">Loại</th>
                            <th className="px-6 py-4">Giá Trị</th>
                            <th className="px-6 py-4">Đơn Tối Thiểu</th>
                            <th className="px-6 py-4">Lượt Dùng</th>
                            <th className="px-6 py-4">Thời Gian</th>
                            <th className="px-6 py-4 text-right">Thao Tác</th>
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
                                        <Tag size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy khuyến mãi</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((promo, index) => (
                            <tr key={promo.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-center font-bold text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md text-[11px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">{promo.ma_km}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#d9a01e]/10 border border-[#d9a01e]/20 flex items-center justify-center shrink-0">
                                            <Tag size={18} className="text-[#d9a01e]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">{promo.ten_km}</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${promo.trang_thai ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {promo.trang_thai ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {promo.loai_km === 'PhanTram' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[11px] uppercase tracking-wider">
                                            <Percent size={12} /> Phần trăm
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[11px] uppercase tracking-wider">
                                            <DollarSign size={12} /> Số tiền
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-[#d9a01e]">
                                        {promo.loai_km === 'PhanTram' 
                                            ? `${Number(promo.gia_tri_km)}%` 
                                            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(promo.gia_tri_km))}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-gray-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(promo.gia_tri_dh_toi_thieu))}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-700">
                                            {promo.da_dung} / {promo.so_luong === 0 ? '∞' : promo.so_luong}
                                        </span>
                                        {promo.so_luong > 0 && (
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                                                <div 
                                                    className={`h-1.5 rounded-full ${promo.da_dung >= promo.so_luong ? 'bg-red-500' : 'bg-[#d9a01e]'}`} 
                                                    style={{ width: `${Math.min(100, (promo.da_dung / promo.so_luong) * 100)}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                        <Calendar size={12} className="text-gray-400" /> {formatDate(promo.ngay_bat_dau)} - {formatDate(promo.ngay_ket_thuc)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button 
                                            onClick={() => handleEdit(promo)}
                                            className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(promo)}
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
                </table>
            </AdminTableCard>

            {hasModal && (
                <AdminModal onClose={() => { setIsFormOpen(false); setDeletingPromotion(null); }} maxWidth={deletingPromotion ? 'max-w-sm' : 'max-w-xl'}>
                    {isFormOpen && (
                        <DynamicForm
                            title={editingPromotion ? 'Chỉnh Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới'}
                            fields={promotionFormFields}
                            initialData={editingPromotion ? {
                                ...editingPromotion,
                                gia_tri_km: Number(editingPromotion.gia_tri_km),
                                gia_tri_dh_toi_thieu: Number(editingPromotion.gia_tri_dh_toi_thieu),
                                ngay_bat_dau: editingPromotion.ngay_bat_dau ? new Date(editingPromotion.ngay_bat_dau).toISOString().split('T')[0] : '',
                                ngay_ket_thuc: editingPromotion.ngay_ket_thuc ? new Date(editingPromotion.ngay_ket_thuc).toISOString().split('T')[0] : ''
                            } : { trang_thai: true, loai_km: 'PhanTram' }}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsFormOpen(false)}
                            isLoading={isSubmitting}
                        />
                    )}
                    {deletingPromotion && (
                        <AdminDeleteConfirm
                            itemName={`Khuyến mãi "${deletingPromotion.ten_km}"`}
                            itemType=""
                            onConfirm={handleConfirmDelete}
                            onCancel={() => setDeletingPromotion(null)}
                            isDeleting={isDeleting}
                        />
                    )}
                </AdminModal>
            )}
        </div>
    );
}
