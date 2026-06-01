import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '@/services/category.service';
import { DanhMuc } from '@/types/danhMuc';

export function useCategoryManagement(showToast: (msg: string, type?: 'success' | 'error') => void) {
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DanhMuc | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<DanhMuc | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await categoryService.getAll();
            setCategories(data);
        } catch {
            if (!silent) showToast('Không thể tải danh sách danh mục!', 'error');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleAdd = () => { setEditingCategory(null); setIsFormOpen(true); };
    const handleEdit = (category: DanhMuc) => { setEditingCategory(category); setIsFormOpen(true); };
    const handleDeleteClick = (category: DanhMuc) => setDeletingCategory(category);

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const payload = {
                ten_danh_muc: data.ten_danh_muc.trim(),
            };
            if (editingCategory) {
                await categoryService.update(editingCategory.id, payload);
                showToast(`Đã cập nhật danh mục "${data.ten_danh_muc}" thành công!`);
            } else {
                await categoryService.create(payload);
                showToast(`Đã thêm danh mục "${data.ten_danh_muc}" thành công!`);
            }
            setIsFormOpen(false);
            fetchCategories();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingCategory) return;
        try {
            setIsDeleting(true);
            await categoryService.delete(deletingCategory.id);
            showToast(`Đã xóa danh mục "${deletingCategory.ten_danh_muc}" thành công!`);
            setDeletingCategory(null);
            fetchCategories();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = categories.filter((c) => {
        return c.ten_danh_muc.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const counts = {
        total: categories.length,
    };

    return {
        categories, isLoading, searchTerm, setSearchTerm,
        isFormOpen, setIsFormOpen, editingCategory, deletingCategory, setDeletingCategory,
        isSubmitting, isDeleting,
        fetchCategories, handleAdd, handleEdit, handleDeleteClick,
        handleFormSubmit, handleConfirmDelete, filtered, counts
    };
}
