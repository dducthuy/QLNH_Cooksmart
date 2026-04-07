'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat, Edit2, Trash2, Loader2 } from 'lucide-react';
import { dishService } from '@/services/dish.service';
import { categoryService } from '@/services/category.service';
import { MonAn } from '@/types/monAn';
import { DanhMuc } from '@/types/danhMuc';
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

export default function MenuManagementPage() {
    const [dishes, setDishes] = useState<MonAn[]>([]);
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDish, setEditingDish] = useState<MonAn | null>(null);
    const [deletingDish, setDeletingDish] = useState<MonAn | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const { showToast, toastNode } = useAdminToast();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [dishesData, categoriesData] = await Promise.all([
                dishService.getAll(),
                categoryService.getAll(),
            ]);
            setDishes(dishesData);
            setCategories(categoriesData);
        } catch {
            showToast('Không thể tải dữ liệu!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = () => { setEditingDish(null); setIsFormOpen(true); };
    const handleEdit = (dish: MonAn) => { setEditingDish(dish); setIsFormOpen(true); };

    const handleSubmit = async (data: any) => {
        try {
            if (editingDish) {
                await dishService.update(editingDish.id, data);
                showToast(`Đã cập nhật "${data.ten_mon}" thành công!`);
            } else {
                await dishService.create(data);
                showToast(`Đã thêm "${data.ten_mon}" thành công!`);
            }
            setIsFormOpen(false);
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingDish) return;
        try {
            setIsDeleting(true);
            await dishService.delete(deletingDish.id);
            showToast(`Đã xóa "${deletingDish.ten_mon}" thành công!`);
            setDeletingDish(null);
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

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

    // ── Filter ──
    const filtered = dishes.filter((d) => {
        const matchSearch = d.ten_mon.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'all' || d.DanhMuc?.id === filterCategory;
        return matchSearch && matchCat;
    });

    // ── Stat items ──
    const statItems = [
        { label: 'Tổng Món', value: dishes.length, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Còn Hàng', value: dishes.filter(d => d.con_hang).length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Hết Hàng', value: dishes.filter(d => !d.con_hang).length, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
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
                subtitle={`${dishes.length} món • ${dishes.filter(d => d.con_hang).length} còn hàng`}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm kiếm món ăn..."
                onRefresh={fetchData}
                isLoading={isLoading}
                onAdd={handleAdd}
                addLabel="Thêm Món"
            />

            {/* Stat Cards */}
            <AdminStatCards items={statItems} cols={3} />

            {/* Filter Tabs */}
            <AdminFilterTabs
                tabs={filterTabs}
                active={filterCategory}
                onChange={setFilterCategory}
            />

            {/* Table */}
            <AdminTableCard
                icon={<ChefHat size={16} />}
                title="Danh Sách Món Ăn"
                count={filtered.length}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
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
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <ChefHat size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy món ăn</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((dish) => (
                            <tr key={dish.id} className="group hover:bg-gray-50/80 transition-colors">
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
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dish.gia_tien)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${dish.con_hang ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-500 bg-red-50 border-red-200'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${dish.con_hang ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                                        {dish.con_hang ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1.5">
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
                <AdminModal onClose={() => { setIsFormOpen(false); setDeletingDish(null); }} maxWidth="max-w-2xl">
                    {isFormOpen && (
                        <DynamicForm
                            title={editingDish ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
                            fields={formFields}
                            initialData={editingDish}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsFormOpen(false)}
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
