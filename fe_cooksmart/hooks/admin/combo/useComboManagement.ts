import { useState, useEffect, useCallback } from 'react';
import { comboService } from '@/services/combo.service';
import { dishService } from '@/services/dish.service';
import { Combo } from '@/types/combo';
import { MonAn } from '@/types/monAn';
import { useSocket } from '@/context/SocketContext';

export function useComboManagement(showToast: (msg: string, type?: 'success' | 'error') => void) {
    const [combos, setCombos] = useState<Combo[]>([]);
    const [dishes, setDishes] = useState<MonAn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
    const [viewingCombo, setViewingCombo] = useState<Combo | null>(null);
    const [deletingCombo, setDeletingCombo] = useState<Combo | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { socket } = useSocket();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [combosData, dishesData] = await Promise.all([
                comboService.getAll(),
                dishService.getAll(),
            ]);
            setCombos(combosData);
            setDishes(dishesData);
        } catch {
            showToast('Không thể tải dữ liệu!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = () => { setEditingCombo(null); setIsFormOpen(true); };
    const handleEdit = (combo: Combo) => { setEditingCombo(combo); setIsFormOpen(true); };

    const handleConfirmDelete = async () => {
        if (!deletingCombo) return;
        try {
            setIsDeleting(true);
            await comboService.delete(deletingCombo.id);
            showToast(`Đã xóa "${deletingCombo.ten_combo}" thành công!`);
            if (socket) socket.emit('cap_nhat_menu');
            setDeletingCombo(null);
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredCombos = combos.filter((c) =>
        c.ten_combo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSuccess = () => {
        setIsFormOpen(false);
        fetchData();
        if (socket) socket.emit('cap_nhat_menu');
    };

    return {
        combos, dishes, isLoading, isFormOpen, setIsFormOpen,
        editingCombo, setEditingCombo, viewingCombo, setViewingCombo,
        deletingCombo, setDeletingCombo, isDeleting, searchTerm, setSearchTerm,
        handleAdd, handleEdit, handleConfirmDelete, filteredCombos, handleSuccess, fetchData
    };
}
