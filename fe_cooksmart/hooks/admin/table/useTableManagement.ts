import { useState, useEffect, useCallback } from 'react';
import { banAnService } from '@/services/banAn.service';
import { BanAn, TrangThaiBan } from '@/types/banAn';
import { useSocket } from '@/context/SocketContext';

export function useTableManagement(showToast: (msg: string, type?: 'success' | 'error') => void) {
    const [tables, setTables] = useState<BanAn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<TrangThaiBan | 'all'>('all');

    const { socket } = useSocket();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<BanAn | null>(null);
    const [deletingTable, setDeletingTable] = useState<BanAn | null>(null);
    const [qrTable, setQrTable] = useState<BanAn | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTables = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await banAnService.getAll();
            setTables(data);
        } catch {
            if (!silent) showToast('Không thể tải danh sách bàn!', 'error');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchTables(); }, [fetchTables]);

    useEffect(() => {
        if (!socket) return;
        
        const handleSocketUpdate = () => {
            fetchTables(true); // silent fetch
        };

        socket.on('cap_nhat_trang_thai_ban', handleSocketUpdate);
        return () => {
            socket.off('cap_nhat_trang_thai_ban', handleSocketUpdate);
        };
    }, [socket, fetchTables]);

    const handleAdd = () => { setEditingTable(null); setIsFormOpen(true); };
    const handleEdit = (ban: BanAn) => { setEditingTable(ban); setIsFormOpen(true); };
    const handleDeleteClick = (ban: BanAn) => setDeletingTable(ban);
    const handleShowQR = (ban: BanAn) => setQrTable(ban);

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const payload = {
                so_ban: data.so_ban.trim(),
                vi_tri: data.vi_tri?.trim() || null,
                ma_qr_code: data.ma_qr_code?.trim() || null,
                trang_thai_ban: data.trang_thai_ban,
            };
            if (editingTable) {
                await banAnService.update(editingTable.id, payload);
                showToast(`Đã cập nhật Bàn ${data.so_ban} thành công!`);
            } else {
                await banAnService.create(payload);
                showToast(`Đã thêm Bàn ${data.so_ban} thành công!`);
            }
            setIsFormOpen(false);
            fetchTables();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingTable) return;
        try {
            setIsDeleting(true);
            await banAnService.delete(deletingTable.id);
            showToast(`Đã xóa Bàn ${deletingTable.so_ban} thành công!`);
            setDeletingTable(null);
            fetchTables();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = tables.filter((t) => {
        const matchSearch = t.so_ban.toLowerCase().includes(searchTerm.toLowerCase()) || (t.vi_tri ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || t.trang_thai_ban === filterStatus;
        return matchSearch && matchStatus;
    });

    const counts = {
        total: tables.length,
        trong: tables.filter((t) => t.trang_thai_ban === 'Trong').length,
        dangPhucVu: tables.filter((t) => t.trang_thai_ban === 'DangPhucVu').length,
        datTruoc: tables.filter((t) => t.trang_thai_ban === 'DatTruoc').length,
    };

    return {
        tables, isLoading, searchTerm, setSearchTerm, filterStatus, setFilterStatus,
        isFormOpen, setIsFormOpen, editingTable, deletingTable, setDeletingTable,
        qrTable, setQrTable, isSubmitting, isDeleting,
        fetchTables, handleAdd, handleEdit, handleDeleteClick, handleShowQR,
        handleFormSubmit, handleConfirmDelete, filtered, counts
    };
}
