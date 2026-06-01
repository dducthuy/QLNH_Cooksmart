import { useState, useEffect, useCallback } from 'react';
import { dishService } from '@/services/dish.service';
import { categoryService } from '@/services/category.service';
import { MonAn } from '@/types/monAn';
import { DanhMuc } from '@/types/danhMuc';
import { useSocket } from '@/context/SocketContext';

export function useMenuManagement(showToast: (msg: string, type?: 'success' | 'error') => void) {
    const [dishes, setDishes] = useState<MonAn[]>([]);
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDish, setEditingDish] = useState<MonAn | null>(null);
    const [deletingDish, setDeletingDish] = useState<MonAn | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const { socket } = useSocket();

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
            setIsSubmitting(true);
            if (editingDish) {
                await dishService.update(editingDish.id, data);
                showToast(`Đã cập nhật "${data.ten_mon}" thành công!`);
            } else {
                await dishService.create(data);
                showToast(`Đã thêm "${data.ten_mon}" thành công!`);
            }
            setIsFormOpen(false);
            if (socket) socket.emit('cap_nhat_menu');
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingDish) return;
        try {
            setIsDeleting(true);
            await dishService.delete(deletingDish.id);
            showToast(`Đã xóa "${deletingDish.ten_mon}" thành công!`);
            if (socket) socket.emit('cap_nhat_menu');
            setDeletingDish(null);
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredDishes = dishes.filter((d) => {
        const matchSearch = d.ten_mon.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'all' || d.DanhMuc?.id === filterCategory;
        return matchSearch && matchCat;
    });

    return {
        dishes, categories, isLoading, isFormOpen, setIsFormOpen,
        editingDish, deletingDish, setDeletingDish, isDeleting, isSubmitting,
        searchTerm, setSearchTerm, filterCategory, setFilterCategory,
        fetchData, handleAdd, handleEdit, handleSubmit, handleConfirmDelete, filteredDishes
    };
}
