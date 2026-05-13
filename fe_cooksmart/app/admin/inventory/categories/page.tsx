'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Edit2, Trash2, Loader2 } from 'lucide-react';
import { loaiNguyenLieuService } from '@/services/loaiNguyenLieu.service';
import { LoaiNguyenLieu } from '@/types/loaiNguyenLieu';
import {
    useAdminToast,
    AdminPageHeader,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';
import DynamicForm, { FormField } from '@/components/admin/form/DynamicForm';

type ModalMode = 'add' | 'edit' | 'delete' | null;

export default function LoaiNguyenLieuPage() {
    const [categories, setCategories] = useState<LoaiNguyenLieu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [modal, setModal] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<LoaiNguyenLieu | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { showToast, toastNode } = useAdminToast();

    const closeModal = () => {
        setModal(null);
        setSelected(null);
    };

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await loaiNguyenLieuService.getAll();
            setCategories(res.data);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Lỗi khi tải danh sách loại nguyên liệu', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const payload = {
                ten_loai: data.ten_loai.trim(),
            };

            if (modal === 'edit' && selected) {
                await loaiNguyenLieuService.update(selected.id, payload);
                showToast('Cập nhật thành công!');
            } else {
                await loaiNguyenLieuService.create(payload);
                showToast(`Đã thêm loại nguyên liệu "${data.ten_loai}"!`);
            }
            closeModal();
            fetchCategories();
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
            await loaiNguyenLieuService.delete(selected.id);
            showToast(`Đã xóa loại nguyên liệu "${selected.ten_loai}"!`);
            closeModal();
            fetchCategories();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể xóa loại nguyên liệu này', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = categories.filter(item =>
        item.ten_loai.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categoryFields: FormField[] = [
        { key: 'ten_loai', label: 'Tên Loại Nguyên Liệu', type: 'text', placeholder: 'VD: Thịt, Rau củ, Gia vị...', required: true },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<Layers size={22} className="text-white" />}
                title="Quản Lý Loại Nguyên Liệu"
                subtitle={`${categories.length} danh mục`}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm tên loại..."
                onRefresh={fetchCategories}
                isLoading={isLoading}
                onAdd={() => { setSelected(null); setModal('add'); }}
                addLabel="Thêm Loại Mới"
            />

            <AdminTableCard icon={<Layers size={16} />} title="Danh Sách Loại Nguyên Liệu" count={filtered.length}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4 w-12 text-center">STT</th>
                                <th className="px-6 py-4">Tên Loại Nguyên Liệu</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Layers size={40} className="text-gray-200" />
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy loại nguyên liệu nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item, index) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">
                                            {item.ten_loai}
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
                                                    title="Xóa loại"
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

            {modal && (
                <AdminModal onClose={closeModal} maxWidth={modal === 'delete' ? 'max-w-sm' : 'max-w-xl'}>
                    {(modal === 'add' || modal === 'edit') && (
                        <DynamicForm
                            title={modal === 'edit' ? 'Chỉnh Sửa Loại Nguyên Liệu' : 'Thêm Loại Nguyên Liệu Mới'}
                            fields={categoryFields}
                            initialData={modal === 'edit' ? selected : {}}
                            onSubmit={handleFormSubmit}
                            onCancel={closeModal}
                            isLoading={isSubmitting}
                        />
                    )}
                    {modal === 'delete' && selected && (
                        <AdminDeleteConfirm
                            itemName={selected.ten_loai}
                            itemType="loại nguyên liệu"
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
