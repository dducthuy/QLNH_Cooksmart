import { useState, useEffect, useCallback } from 'react';
import { banAnService } from '@/services/banAn.service';
import { hoaDonService } from '@/services/hoaDon.service';
import { comboService } from '@/services/combo.service';
import { dishService } from '@/services/dish.service';
import { categoryService } from '@/services/category.service';
import { BanAn } from '@/types/banAn';
import { useSocket } from '@/context/SocketContext';

export function useMenuData(tableId: string | null) {
    const [tableInfo, setTableInfo] = useState<BanAn | null>(null);
    const [monAnList, setMonAnList] = useState<any[]>([]);
    const [comboList, setComboList] = useState<any[]>([]);
    const [danhMucList, setDanhMucList] = useState<any[]>([]);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { socket } = useSocket();

    const loadData = useCallback(async () => {
        if (!tableId) { setIsLoading(false); return; }
        try {
            const [table, monAn, danhMuc, order, combos] = await Promise.all([
                banAnService.getById(tableId),
                dishService.getAll(),
                categoryService.getAll(),
                hoaDonService.getActiveByTable(tableId),
                comboService.getPublic()
            ]);
            setTableInfo(table);
            setMonAnList(monAn);
            setDanhMucList(danhMuc);
            setActiveOrder(order);
            setComboList(combos);
        } catch (err) {
            console.error(err);
            setError('Không thể tải dữ liệu. Vui lòng quét lại mã QR.');
        } finally {
            setIsLoading(false);
        }
    }, [tableId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!socket || !tableId) return;
        const handleMenuUpdate = () => loadData();
        const handleOrderUpdate = () => hoaDonService.getActiveByTable(tableId).then(setActiveOrder).catch(console.error);

        socket.on('cap_nhat_menu', handleMenuUpdate);
        socket.on('trang_thai_mon_da_doi', handleOrderUpdate);

        return () => {
            socket.off('cap_nhat_menu', handleMenuUpdate);
            socket.off('trang_thai_mon_da_doi', handleOrderUpdate);
        };
    }, [socket, tableId, loadData]);

    return { tableInfo, monAnList, comboList, danhMucList, activeOrder, isLoading, error, setError };
}
