import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon, TrangThaiMon } from '@/types/hoaDon';
import { hasVisibleItems } from './utils';

export function useKitchenSocket(
    setTickets: React.Dispatch<React.SetStateAction<HoaDon[]>>,
    readyTicketIdsRef: React.MutableRefObject<Set<string>>,
    fetchInitialTickets: () => Promise<void>
) {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const joinRoom = () => socket.emit('join_room_bep');
        if (socket.connected) joinRoom();
        socket.on('connect', joinRoom);

        socket.on('thong_bao_moi', async (payload: any) => {
            try {
                const t = await hoaDonService.getById(payload.id_hoa_don);
                if (t.trang_thai_hd !== 'DangPhucVu') return;
                setTickets(prev => {
                    const exists = prev.find(x => x.id === t.id);
                    if (exists) return prev.map(x => x.id === t.id ? t : x);
                    return [...prev, t];
                });
            } catch (err) { console.error(err); }
        });

        socket.on('trang_thai_mon_da_doi', (payload: any) => {
            const status = payload.trang_thai_mon as TrangThaiMon;
            setTickets(prev =>
                prev.map(ticket => {
                    if (ticket.id !== payload.id_hoa_don) return ticket;
                    const newCT = ticket.ChiTietHoaDons?.map(item =>
                        item.id === payload.id_chi_tiet ? { ...item, trang_thai_mon: status } : item
                    );
                    const hasDaXong = newCT?.some(i => i.trang_thai_mon === 'DaXong');
                    if (hasDaXong) readyTicketIdsRef.current.add(ticket.id);
                    return { ...ticket, ChiTietHoaDons: newCT };
                })
            );
        });

        socket.on('mon_da_lay_di', (payload: any) => {
            setTickets(prev => {
                const updated = prev.map(ticket => {
                    if (ticket.id !== payload.id_hoa_don) return ticket;
                    return {
                        ...ticket,
                        ChiTietHoaDons: ticket.ChiTietHoaDons?.map(item =>
                            item.id === payload.id_chi_tiet
                                ? { ...item, trang_thai_mon: 'DaLayDi' as TrangThaiMon }
                                : item
                        )
                    };
                });
                return updated.filter(t => hasVisibleItems(t));
            });
        });

        socket.on('ticket_hoan_tat', (payload: any) => {
            readyTicketIdsRef.current.delete(payload.id_hoa_don);
            setTickets(prev => prev.filter(t => t.id !== payload.id_hoa_don));
        });

        socket.on('lam_moi_danh_sach_bep', fetchInitialTickets);

        return () => {
            socket.off('connect', joinRoom);
            socket.off('thong_bao_moi');
            socket.off('trang_thai_mon_da_doi');
            socket.off('mon_da_lay_di');
            socket.off('ticket_hoan_tat');
            socket.off('lam_moi_danh_sach_bep');
        };
    }, [socket, setTickets, readyTicketIdsRef, fetchInitialTickets]);
}
