'use client';

import React from 'react';
import {
    List,
    X,
    Edit2,
    Trash2,
    Loader2,
    Search,
    RefreshCw
} from 'lucide-react';
import { DanhMuc } from '@/types/danhMuc';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';
import DynamicForm, { FormField } from '@/components/admin/form/DynamicForm';
import { useCategoryManagement } from '@/hooks/admin/category/useCategoryManagement';

export default function CategoryManagementPage() {
    const { showToast, toastNode } = useAdminToast();
    const {
        isLoading, searchTerm, setSearchTerm,
        isFormOpen, setIsFormOpen, editingCategory, deletingCategory, setDeletingCategory,
        isSubmitting, isDeleting,
        fetchCategories, handleAdd, handleEdit, handleDeleteClick,
        handleFormSubmit, handleConfirmDelete, filtered, counts
    } = useCategoryManagement(showToast);

    const categoryFormFields: FormField[] = [
        { key: 'ten_danh_muc', label: 'Tên Danh Mục', type: 'text', placeholder: 'VD: Khai vị, Món chính, Đồ uống...', required: true },
    ];

    const hasModal = isFormOpen || !!deletingCategory;

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<List size={22} className="text-white" />}
                title="Quản Lý Danh Mục"
                subtitle={`Tổng cộng: ${counts.total} danh mục`}
                onAdd={handleAdd}
                addLabel="Thêm Danh Mục"
            />

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                    <div className="relative group w-full md:w-64">
                        <Search
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => fetchCategories(false)}
                        title="Làm mới"
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all shrink-0"
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="p-2.5 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl border border-transparent transition-all shrink-0"
                            title="Xóa tìm kiếm"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <AdminTableCard
                icon={<List size={16} />}
                title="Danh Sách Danh Mục"
                count={filtered.length}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                            <th className="px-6 py-4 w-16 text-center">STT</th>
                            <th className="px-6 py-4">Tên Danh Mục</th>
                            <th className="px-6 py-4 w-48 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <List size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy danh mục</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((category, index) => (
                            <tr key={category.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-center font-bold text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 border border-gray-200 group-hover:border-[#d9a01e]/40 transition-colors shrink-0 text-[#d9a01e]">
                                            <List size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">{category.ten_danh_muc}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">#{category.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button onClick={() => handleEdit(category)}
                                            className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                            title="Chỉnh sửa">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(category)}
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
                <AdminModal onClose={() => { setIsFormOpen(false); setDeletingCategory(null); }} maxWidth={deletingCategory ? 'max-w-sm' : 'max-w-xl'}>
                    {isFormOpen && (
                        <DynamicForm
                            title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                            fields={categoryFormFields}
                            initialData={editingCategory ? editingCategory : {}}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsFormOpen(false)}
                            isLoading={isSubmitting}
                        />
                    )}
                    {deletingCategory && (
                        <AdminDeleteConfirm
                            itemName={`Danh mục "${deletingCategory.ten_danh_muc}"`}
                            itemType=""
                            onConfirm={handleConfirmDelete}
                            onCancel={() => setDeletingCategory(null)}
                            isDeleting={isDeleting}
                        />
                    )}
                </AdminModal>
            )}
        </div>
    );
}
