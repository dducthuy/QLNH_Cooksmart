'use client';

import React, { useEffect, useState, useCallback } from 'react';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import KitchenTicket from '@/components/kitchen/KitchenTicket';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon } from '@/types/hoaDon';
import { Loader2 } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';

export default function KitchenPage() {
    const [tickets, setTickets] = useState<HoaDon[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    // Hàm kiểm tra xem hóa đơn đã hoàn thành tất cả các món chưa
    const isTicketFullyDone = (ticket: HoaDon) => {
        if (!ticket.ChiTietHoaDons || ticket.ChiTietHoaDons.length === 0) return false;
        return ticket.ChiTietHoaDons.every(item => item.trang_thai_mon === 'DaXong');
    };

    const fetchInitialTickets = useCallback(async () => {
        try {
            setLoading(true);

            const activeOrders = await hoaDonService.getAll({ trang_thai_hd: 'DangPhucVu' });

            const fullTickets = await Promise.all(
                activeOrders.map(t => hoaDonService.getById(t.id))
            );

            // Lọc bỏ những đơn đã hoàn thành tất cả các món
            const activeTickets = fullTickets.filter(t => !isTicketFullyDone(t));

            activeTickets.sort((a, b) => new Date(a.thoi_gian_tao).getTime() - new Date(b.thoi_gian_tao).getTime());
            setTickets(activeTickets);
        } catch (error) {
            console.error("Lỗi lấy đơn ban đầu:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialTickets();
    }, [fetchInitialTickets]);

    useEffect(() => {
        if (!socket) return;

        const joinKitchenRoom = () => {
            console.log(" Joining kitchen room...");
            socket.emit('join_room_bep');
        };

        if (socket.connected) {
            joinKitchenRoom();
        }

        socket.on('connect', joinKitchenRoom);

        socket.on('thong_bao_moi', async (payload: any) => {
            console.log("Bếp nhận được đơn mới:", payload);
            try {
                const newTicket = await hoaDonService.getById(payload.id_hoa_don);


                if (newTicket.trang_thai_hd !== 'DangPhucVu') return;

                setTickets(prev => {
                    const exists = prev.find(t => t.id === newTicket.id);
                    // Nếu đơn mới hoàn thành luôn (vô lý nhưng check cho chắc) thì không thêm
                    if (isTicketFullyDone(newTicket)) {
                        return exists ? prev.filter(t => t.id !== newTicket.id) : prev;
                    }
                    if (exists) {
                        return prev.map(t => t.id === newTicket.id ? newTicket : t);
                    }
                    return [...prev, newTicket];
                });
            } catch (err) {
                console.error("Lỗi cập nhật ticket mới:", err);
            }
        });

        socket.on('trang_thai_mon_da_doi', (payload: any) => {
            console.log("Nhận cập nhật trạng thái món từ socket:", payload);
            setTickets(prev => {
                const updatedTickets = prev.map(ticket => {
                    if (ticket.id === payload.id_hoa_don) {
                        return {
                            ...ticket,
                            ChiTietHoaDons: ticket.ChiTietHoaDons?.map(item =>
                                item.id === payload.id_chi_tiet
                                    ? { ...item, trang_thai_mon: payload.trang_thai_mon }
                                    : item
                            )
                        };
                    }
                    return ticket;
                });
                // Lọc bỏ các hóa đơn đã hoàn thành xong tất cả các món
                return updatedTickets.filter(t => !isTicketFullyDone(t));
            });
        });

        return () => {
            socket.off('connect', joinKitchenRoom);
            socket.off('thong_bao_moi');
            socket.off('trang_thai_mon_da_doi');
        };
    }, [socket]);

    const handleStatusChange = (id_hoa_don: string, id_chi_tiet: string, status: "DangCho" | "DangNau" | "DaXong") => {
        setTickets(prev => {
            const updated = prev.map(ticket => {
                if (ticket.id !== id_hoa_don) return ticket;
                return {
                    ...ticket,
                    ChiTietHoaDons: ticket.ChiTietHoaDons?.map(item =>
                        item.id === id_chi_tiet ? { ...item, trang_thai_mon: status } : item
                    )
                };
            });
            // Tự động ẩn nếu sau khi đổi trạng thái, hóa đơn này xong hết
            return updated.filter(t => !isTicketFullyDone(t));
        });
    };

    return (
        <div className="flex flex-col h-full w-full">
            <KitchenHeader />

            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#111827] p-6 kds-scrollbar">
                {loading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                        <Loader2 size={48} className="animate-spin text-amber-500" />
                        <p className="font-bold uppercase tracking-widest text-sm text-gray-400">Đang tải đơn từ máy chủ...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                        <p className="font-bold uppercase tracking-widest text-2xl text-gray-400 opacity-50">Không Có Đơn Hàng Mới</p>
                    </div>
                ) : (
                    <div className="flex gap-6 h-full items-start w-max">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="w-[340px] shrink-0 h-fit max-h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <KitchenTicket
                                    ticket={ticket}
                                    onStatusChange={(id_chi_tiet, status) => handleStatusChange(ticket.id, id_chi_tiet, status)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
