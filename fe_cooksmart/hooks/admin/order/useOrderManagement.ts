import { useState, useEffect, useCallback } from 'react';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon } from '@/types/hoaDon';

export function useOrderManagement(showToast: (msg: string, type?: 'success' | 'error') => void) {
    const [orders, setOrders] = useState<HoaDon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [tuNgay, setTuNgay] = useState('');
    const [denNgay, setDenNgay] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await hoaDonService.getAll();
            setOrders(data);
        } catch {
            showToast('Không thể tải danh sách đơn hàng!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filteredOrders = orders.filter((o) => {
        const matchSearch =
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.BanAn?.so_ban || 'Mang về').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.trang_thai_hd === filterStatus;

        let matchDate = true;
        const itemDate = new Date(o.thoi_gian_tao);

        if (tuNgay) {
            const [year, month, day] = tuNgay.split('-').map(Number);
            const fromDate = new Date(year, month - 1, day, 0, 0, 0, 0);
            matchDate = matchDate && itemDate >= fromDate;
        }
        if (denNgay) {
            const [year, month, day] = denNgay.split('-').map(Number);
            const toDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            matchDate = matchDate && itemDate <= toDate;
        }

        return matchSearch && matchStatus && matchDate;
    });

    const counts = {
        total: orders.length,
        choxuly: orders.filter((o) => o.trang_thai_hd === 'ChoXuLy').length,
        dangphucvu: orders.filter((o) => o.trang_thai_hd === 'DangPhucVu').length,
        dathanhtoan: orders.filter((o) => o.trang_thai_hd === 'DaThanhToan').length,
        huy: orders.filter((o) => o.trang_thai_hd === 'DaHuy').length,
    };

    return {
        orders, isLoading, searchTerm, setSearchTerm,
        filterStatus, setFilterStatus, tuNgay, setTuNgay, denNgay, setDenNgay,
        selectedOrderId, setSelectedOrderId, fetchOrders, filteredOrders, counts
    };
}
