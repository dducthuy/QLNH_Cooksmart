import { useEffect, useState, useCallback, useRef } from 'react';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon, TrangThaiMon } from '@/types/hoaDon';
import { hasActiveItems, hasVisibleItems } from './utils';
import { useKitchenSocket } from './useKitchenSocket';

export function useKitchenTickets() {
    const [tickets, setTickets] = useState<HoaDon[]>([]);
    const [loading, setLoading] = useState(true);

    const readyTicketIdsRef = useRef<Set<string>>(new Set());

    const fetchInitialTickets = useCallback(async () => {
        try {
            setLoading(true);
            const activeOrders = await hoaDonService.getAll({ trang_thai_hd: 'DangPhucVu' });
            const fullTickets = await Promise.all(activeOrders.map(t => hoaDonService.getById(t.id)));

            const visible = fullTickets.filter(t =>
                hasActiveItems(t) || readyTicketIdsRef.current.has(t.id)
            );
            visible.sort((a, b) => new Date(a.thoi_gian_tao).getTime() - new Date(b.thoi_gian_tao).getTime());
            setTickets(visible);
        } catch (err) {
            console.error("Lỗi tải đơn ban đầu:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialTickets();
    }, [fetchInitialTickets]);

    const handleStatusChange = useCallback((id_hoa_don: string, id_chi_tiet: string, status: TrangThaiMon) => {
        setTickets(prev => {
            const updated = prev.map(ticket => {
                if (ticket.id !== id_hoa_don) return ticket;
                const newCT = ticket.ChiTietHoaDons?.map(item =>
                    item.id === id_chi_tiet ? { ...item, trang_thai_mon: status } : item
                );

                const hasDaXong = newCT?.some(i => i.trang_thai_mon === 'DaXong');
                if (hasDaXong) readyTicketIdsRef.current.add(id_hoa_don);

                return { ...ticket, ChiTietHoaDons: newCT };
            });

            return updated.filter(t => hasVisibleItems(t));
        });
    }, []);

    useKitchenSocket(setTickets, readyTicketIdsRef, fetchInitialTickets);

    return { tickets, loading, handleStatusChange };
}
