'use client';

import React, { useEffect, useState } from 'react';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import KitchenTicket from '@/components/kitchen/KitchenTicket';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon } from '@/types/hoaDon';
import { io } from 'socket.io-client';
import { Loader2 } from 'lucide-react';

export default function KitchenPage() {
    const [tickets, setTickets] = useState<HoaDon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialTickets = async () => {
            try {
                // Lấy đơn hàng đang phục vụ và chờ xử lý
                const [choXuLy, dangPhucVu] = await Promise.all([
                    hoaDonService.getAll({ trang_thai_hd: 'ChoXuLy' }),
                    hoaDonService.getAll({ trang_thai_hd: 'DangPhucVu' })
                ]);
                
                const allActive = [...choXuLy, ...dangPhucVu];
                
                // Fetch chi tiết cho tất cả
                const fullTickets = await Promise.all(
                    allActive.map(t => hoaDonService.getById(t.id))
                );
                
                // Sort by thoi_gian_tao (cũ nhất lên đầu)
                fullTickets.sort((a, b) => new Date(a.thoi_gian_tao).getTime() - new Date(b.thoi_gian_tao).getTime());
                
                setTickets(fullTickets);
            } catch (error) {
                console.error("Lỗi lấy đơn ban đầu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialTickets();

        // Lắng nghe socket
        const socket = io('http://localhost:5000'); 

        socket.on('connect', () => {
            console.log("KDS connected to socket:", socket.id);
        });

        socket.on('thong_bao_moi', async (payload: any) => {
            console.log("Bếp nhận được đơn mới:", payload);
            try {
                // Lấy thông tin chi tiết hóa đơn mới
                const newTicket = await hoaDonService.getById(payload.id_hoa_don);
                setTickets(prev => {
                    const exists = prev.find(t => t.id === newTicket.id);
                    if (exists) {
                        return prev.map(t => t.id === newTicket.id ? newTicket : t);
                    }
                    return [...prev, newTicket];
                });
            } catch (err) {
                console.error("Lỗi cập nhật ticket mới:", err);
            }
        });

        socket.on('cap_nhat_trang_thai_mon', (payload: any) => {
            console.log("Nhận cập nhật trạng thái món từ client khác:", payload);
            setTickets(prev => prev.map(ticket => {
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
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleStatusChange = (id_hoa_don: string, id_chi_tiet: string, status: "DangCho" | "DangNau" | "DaXong") => {
        setTickets(prev => prev.map(ticket => {
            if (ticket.id !== id_hoa_don) return ticket;
            return {
                ...ticket,
                ChiTietHoaDons: ticket.ChiTietHoaDons?.map(item => 
                    item.id === id_chi_tiet ? { ...item, trang_thai_mon: status } : item
                )
            };
        }));
    };

    return (
        <div className="flex flex-col h-full w-full">
            <KitchenHeader />
            
            {/* Kanban Grid */}
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
                            <div key={ticket.id} className="w-[340px] shrink-0 h-fit max-h-full">
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
