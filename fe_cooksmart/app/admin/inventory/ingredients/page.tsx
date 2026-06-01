'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PackageSearch, AlertCircle, Edit2, Trash2, Loader2, Search, RefreshCw, X } from 'lucide-react';
import { nguyenLieuService } from '@/services/nguyenLieu.service';
import { loaiNguyenLieuService } from '@/services/loaiNguyenLieu.service';
import { NguyenLieu } from '@/types/nguyenLieu';
import { LoaiNguyenLieu } from '@/types/loaiNguyenLieu';
import {
    useAdminToast,
    AdminPageHeader,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
    AdminFilterTabs,
} from '@/components/admin/ui';
import DynamicForm, { FormField } from '@/components/admin/form/DynamicForm';

type ModalMode = 'add' | 'edit' | 'delete' | null;

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<NguyenLieu[]>([]);
    const [categories, setCategories] = useState<LoaiNguyenLieu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [modal, setModal] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<NguyenLieu | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { showToast, toastNode } = useAdminToast();

    const closeModal = () => {
        setModal(null);
        setSelected(null);
    };

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [ingRes, catRes] = await Promise.all([
                nguyenLieuService.getAll(),
                loaiNguyenLieuService.getAll()
            ]);

            setIngredients(ingRes.data);
            setCategories(catRes.data);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Lỗi khi tải dữ liệu', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const payload = {
                ten_nguyen_lieu: data.ten_nguyen_lieu.trim(),
                id_loai_nguyen_lieu: data.id_loai_nguyen_lieu || null,
                don_vi_tinh: data.don_vi_tinh || null,
                so_luong_ton: Number(data.so_luong_ton || 0),
                gia_nhap_gan_nhat: Number(data.gia_nhap_gan_nhat || 0),
                loai_quan_ly: data.loai_quan_ly || 'THU_CONG'
            };

            if (modal === 'edit' && selected) {
                await nguyenLieuService.update(selected.id, payload);
                showToast('Cập nhật thành công!');
            } else {
                await nguyenLieuService.create(payload);
                showToast(`Đã thêm nguyên liệu "${data.ten_nguyen_lieu}"!`);
            }
            closeModal();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Có lỗi xảy ra khi lưu!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            setIsSubmitting(true);
            await nguyenLieuService.delete(selected.id);
            showToast(`Đã xóa nguyên liệu "${selected.ten_nguyen_lieu}"!`);
            closeModal();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể xóa nguyên liệu này', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = ingredients.filter(item => {
        const matchSearch = item.ten_nguyen_lieu.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'all' || item.id_loai_nguyen_lieu === selectedCategory;
        return matchSearch && matchCategory;
    });

    const lowStockCount = ingredients.filter(i => Number(i.so_luong_ton) <= 5).length;

    const UNITS = ['g', 'kg', 'ml', 'lít', 'cái', 'quả', 'chai', 'lon', 'phần', 'hộp'];

    const ingredientFields: FormField[] = [
        { key: 'ten_nguyen_lieu', label: 'Tên Nguyên Liệu', type: 'text', placeholder: 'VD: Thịt bò bít tết', required: true },
        {
            key: 'id_loai_nguyen_lieu',
            label: 'Loại Nguyên Liệu',
            type: 'select',
            options: categories.map(c => ({ value: c.id, label: c.ten_loai }))
        },
        { 
            key: 'don_vi_tinh', 
            label: 'Đơn Vị Tính', 
            type: 'select', 
            options: [
                { value: '', label: '-- Chọn đơn vị --' },
                ...UNITS.map(u => ({ value: u, label: u }))
            ]
        },
        {
            key: 'loai_quan_ly',
            label: 'Loại Quản Lý Kho',
            type: 'select',
            options: [
                { value: 'TU_DONG', label: 'Tự động trừ kho' },
                { value: 'THU_CONG', label: 'Cập nhật thủ công' }
            ]
        },
        { key: 'so_luong_ton', label: 'Số Lượng Tồn', type: 'number', placeholder: '0' },
        { key: 'gia_nhap_gan_nhat', label: 'Giá Nhập Gần Nhất (VNĐ)', type: 'number', placeholder: '0' },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<PackageSearch size={22} className="text-white" />}
                title="Quản Lý Nguyên Liệu"
                subtitle={`${ingredients.length} mặt hàng • ${lowStockCount} sắp hết`}
                onAdd={() => { setSelected(null); setModal('add'); }}
                addLabel="Thêm Mới"
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
                            <option value="all">Tất cả danh mục</option>
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

            <AdminTableCard icon={<PackageSearch size={16} />} title="Danh Sách Nguyên Liệu" count={filtered.length}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4 w-12 text-center">STT</th>
                                <th className="px-6 py-4">Tên Nguyên Liệu</th>
                                <th className="px-6 py-4">Loại</th>
                                <th className="px-6 py-4 text-center">Đơn Vị</th>
                                <th className="px-6 py-4 text-right">Số Lượng Tồn</th>
                                <th className="px-6 py-4 text-right">Giá Bình Quân</th>
                                <th className="px-6 py-4 text-right">Giá Nhập Gần Nhất</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <PackageSearch size={40} className="text-gray-200" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy nguyên liệu nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item, index) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">
                                            {item.ten_nguyen_lieu}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {item.LoaiNguyenLieu?.ten_loai || '---'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-bold">
                                                {item.don_vi_tinh || '---'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {Number(item.so_luong_ton) <= 5 && (
                                                    <AlertCircle size={14} className="text-red-500 animate-pulse" />
                                                )}
                                                <span className={Number(item.so_luong_ton) <= 5 ? 'text-red-600 font-bold' : 'text-gray-800'}>
                                                    {Number(item.so_luong_ton).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[#d9a01e] font-bold">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.gia_von_binh_quan || 0))}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400 font-medium text-xs">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.gia_nhap_gan_nhat || 0))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => { setSelected(item); setModal('edit'); }}
                                                    className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelected(item); setModal('delete'); }}
                                                    className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                                                    title="Xóa nguyên liệu"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminTableCard>

            {/* Các Modal Thêm/Sửa/Xóa dùng chung */}
            {modal && (
                <AdminModal onClose={closeModal} maxWidth={modal === 'delete' ? 'max-w-sm' : 'max-w-xl'}>
                    {(modal === 'add' || modal === 'edit') && (
                        <DynamicForm
                            title={modal === 'edit' ? 'Chỉnh Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}
                            fields={ingredientFields}
                            initialData={modal === 'edit' && selected ? {
                                ...selected,
                                so_luong_ton: Number(selected.so_luong_ton || 0),
                                gia_nhap_gan_nhat: Number(selected.gia_nhap_gan_nhat || 0)
                            } : {}}
                            onSubmit={handleFormSubmit}
                            onCancel={closeModal}
                            isLoading={isSubmitting}
                        />
                    )}
                    {modal === 'delete' && selected && (
                        <AdminDeleteConfirm
                            itemName={selected.ten_nguyen_lieu}
                            itemType="nguyên liệu"
                            onConfirm={handleDelete}
                            onCancel={closeModal}
                            isDeleting={isSubmitting}
                        />
                    )}
                </AdminModal>
            )}
        </div>
    );
}
