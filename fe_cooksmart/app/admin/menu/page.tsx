'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Edit2, Trash2, Loader2, FlaskConical, Search, X, RefreshCw } from 'lucide-react';
import DynamicForm, { FormField } from '@/components/admin/form/DynamicForm';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminFilterTabs,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';
import { useMenuManagement } from '@/hooks/admin/menu/useMenuManagement';

export default function MenuManagementPage() {
    const { showToast, toastNode } = useAdminToast();
    const router = useRouter();

    const {
        dishes, categories, isLoading, isFormOpen, setIsFormOpen,
        editingDish, deletingDish, setDeletingDish, isDeleting, isSubmitting,
        searchTerm, setSearchTerm, filterCategory, setFilterCategory,
        fetchData, handleAdd, handleEdit, handleSubmit, handleConfirmDelete, filteredDishes
    } = useMenuManagement(showToast);

    const formFields: FormField[] = [
        { key: 'ten_mon', label: 'Tên Món Ăn', type: 'text', placeholder: 'Ví dụ: Bún Bò Huế', required: true },
        { key: 'gia_tien', label: 'Giá Tiền (VNĐ)', type: 'number', placeholder: 'Ví dụ: 55000', required: true },
        {
            key: 'id_danh_muc',
            label: 'Danh Mục',
            type: 'select',
            placeholder: 'Chọn danh mục',
            options: categories.map(c => ({ label: c.ten_danh_muc, value: c.id })),
        },
        { key: 'hinh_anh_mon', label: 'Hình Ảnh', type: 'image' },
        { key: 'mo_ta_ai', label: 'Mô Tả', type: 'textarea', placeholder: 'Nội dung mô tả món ăn...' },
        { key: 'con_hang', label: 'Trạng thái', type: 'checkbox' },
    ];

    // ── Stat items ──
    const statItems = [
        { label: 'Tổng Món', value: dishes.length, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Còn Bán', value: dishes.filter(d => d.con_hang).length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Ngừng Bán', value: dishes.filter(d => !d.con_hang).length, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    ];

    // ── Filter tabs ──
    const filterTabs = [
        { value: 'all', label: 'Tất cả' },
        ...categories.map(c => ({ value: c.id, label: c.ten_danh_muc })),
    ];

    const hasModal = isFormOpen || !!deletingDish;

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            {/* Header */}
            <AdminPageHeader
                icon={<ChefHat size={22} className="text-white" />}
                title="Quản Lý Thực Đơn"
                subtitle={`${dishes.length} món • ${dishes.filter(d => d.con_hang).length} còn bán`}
                onAdd={handleAdd}
                addLabel="Thêm Món"
            />

            {/* Stat Cards */}
            <AdminStatCards items={statItems} cols={3} />

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Lọc danh mục:</label>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:max-w-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#d9a01e] focus:bg-white transition-all"
                    >
                        {filterTabs.map(tab => (
                            <option key={tab.value} value={tab.value}>{tab.label}</option>
                        ))}
                    </select>
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
                            placeholder="Tìm kiếm món ăn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchData}
                        title="Làm mới"
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all shrink-0"
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {(searchTerm || filterCategory !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}
                            className="p-2.5 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl border border-transparent transition-all shrink-0"
                            title="Xóa tìm kiếm và lọc"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <AdminTableCard
                icon={<ChefHat size={16} />}
                title="Danh Sách Món Ăn"
                count={filteredDishes.length}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                            <th className="px-6 py-4 w-12 text-center">STT</th>
                            <th className="px-6 py-4">Món Ăn</th>
                            <th className="px-6 py-4">Danh Mục</th>
                            <th className="px-6 py-4">Giá Tiền</th>
                            <th className="px-6 py-4">Trạng Thái</th>
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
                        ) : filteredDishes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <ChefHat size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy món ăn</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredDishes.map((dish, index) => (
                            <tr key={dish.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-center font-bold text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-[#d9a01e]/40 transition-colors shrink-0">
                                            {dish.hinh_anh_mon
                                                ? <img src={dish.hinh_anh_mon} alt={dish.ten_mon} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-black">NA</div>
                                            }
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">{dish.ten_mon}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">#{dish.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {dish.DanhMuc?.ten_danh_muc || 'Chưa phân loại'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-[#d9a01e]">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(dish.gia_tien))}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${dish.con_hang ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-500 bg-red-50 border-red-200'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${dish.con_hang ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                                        {dish.con_hang ? 'Còn bán' : 'Ngừng bán'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button
                                            onClick={() => router.push(`/admin/menu/dinh-muc/${dish.id}`)}
                                            className="p-2 bg-gray-100 hover:bg-purple-50 text-gray-500 hover:text-purple-600 rounded-xl border border-gray-200 hover:border-purple-200 transition-all"
                                            title="Định mức nguyên liệu"
                                        >
                                            <FlaskConical size={14} />
                                        </button>
                                        <button onClick={() => handleEdit(dish)}
                                            className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                            title="Chỉnh sửa">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => setDeletingDish(dish)}
                                            className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                                            title="Xóa">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminTableCard>

            {/* Modals */}
            {hasModal && (
                <AdminModal onClose={() => { setIsFormOpen(false); setDeletingDish(null); }} maxWidth={deletingDish ? 'max-w-sm' : 'max-w-2xl'}>
                    {isFormOpen && (
                        <DynamicForm
                            title={editingDish ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
                            fields={formFields}
                            initialData={editingDish ? { ...editingDish, gia_tien: Number(editingDish.gia_tien) } : { con_hang: true }}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsFormOpen(false)}
                            isLoading={isSubmitting}
                        />
                    )}
                    {deletingDish && (
                        <AdminDeleteConfirm
                            itemName={deletingDish.ten_mon}
                            itemType="món"
                            onConfirm={handleConfirmDelete}
                            onCancel={() => setDeletingDish(null)}
                            isDeleting={isDeleting}
                        />
                    )}
                </AdminModal>
            )}
        </div>
    );
}
