'use client';

import React, { useState } from 'react';
import { Clock, CheckSquare, Loader2 } from 'lucide-react';
import { HoaDon } from '@/types/hoaDon';
import { hoaDonService } from '@/services/hoaDon.service';

export default function KitchenTicket({ ticket, onStatusChange }: { ticket: HoaDon, onStatusChange: (id_chi_tiet: string, status: "DangCho" | "DangNau" | "DaXong") => void }) {
    const isUrgent = new Date().getTime() - new Date(ticket.thoi_gian_tao).getTime() > 15 * 60 * 1000; // > 15 min
    const allDone = ticket.ChiTietHoaDons?.every(item => item.trang_thai_mon === 'DaXong');

    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const getBorderColor = () => {
        if (allDone) return 'border-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]';
        if (isUrgent) return 'border-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]';
        return 'border-gray-700 hover:border-amber-500/50';
    };

    const getHeaderColor = () => {
        if (allDone) return 'bg-emerald-500 text-white';
        if (isUrgent) return 'bg-red-500 text-white';
        return 'bg-gray-800 text-amber-500 border-b border-gray-700';
    };

    const formatTime = (timeStr: string) => {
        const d = new Date(timeStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleItemClick = async (item: any) => {
        if (item.trang_thai_mon === 'DaXong') return;

        let nextStatus: "DangCho" | "DangNau" | "DaXong" = 'DangNau';
        if (item.trang_thai_mon === 'DangCho') nextStatus = 'DangNau';
        else if (item.trang_thai_mon === 'DangNau') nextStatus = 'DaXong';

        try {
            setIsUpdating(item.id);
            await hoaDonService.updateItemStatus(item.id, nextStatus);
            onStatusChange(item.id, nextStatus);
        } catch (error) {
            console.error("Lỗi cập nhật món:", error);
            alert("Lỗi cập nhật trạng thái món!");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleCompleteAll = async () => {
        const pendingItems = ticket.ChiTietHoaDons?.filter(item => item.trang_thai_mon !== 'DaXong') || [];
        if (pendingItems.length === 0) return;

        try {
            setIsUpdating('all');
            await Promise.all(pendingItems.map(item => hoaDonService.updateItemStatus(item.id, 'DaXong')));
            pendingItems.forEach(item => onStatusChange(item.id, 'DaXong'));
        } catch (error) {
            console.error("Lỗi đổi tất cả món:", error);
            alert("Lỗi khi hoàn thành tất cả món!");
        } finally {
            setIsUpdating(null);
        }
    };

    // Sắp xếp món theo trạng thái: Đang chờ -> Đang nấu -> Đã xong
    const sortedItems = [...(ticket.ChiTietHoaDons || [])].sort((a, b) => {
        const order = { 'DangCho': 0, 'DangNau': 1, 'DaXong': 2 };
        return (order[a.trang_thai_mon as keyof typeof order] || 0) - (order[b.trang_thai_mon as keyof typeof order] || 0);
    });

    const pendingItems = sortedItems.filter(i => i.trang_thai_mon === 'DangCho');
    const cookingItems = sortedItems.filter(i => i.trang_thai_mon === 'DangNau');
    const doneItems = sortedItems.filter(i => i.trang_thai_mon === 'DaXong');

    return (
        <div className={`flex flex-col bg-gray-900 border-2 rounded-2xl overflow-hidden transition-all ${getBorderColor()}`}>
            {/* Card Header */}
            <div className={`p-4 flex items-center justify-between ${getHeaderColor()}`}>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black leading-none">{ticket.BanAn?.so_ban || 'Mang Về'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
                    <Clock size={14} />
                    <span className="text-xs font-mono font-bold">{formatTime(ticket.thoi_gian_tao)}</span>
                </div>
            </div>

            {/* Card Body - Món Ăn */}
            <div className="flex-1 p-2 space-y-4 max-h-[500px] overflow-y-auto kds-scrollbar">
                {/* Group: Đang chờ */}
                {pendingItems.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-2 pb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chờ chuẩn bị</span>
                        </div>
                        {pendingItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                disabled={isUpdating === item.id || isUpdating === 'all'}
                                className="w-full text-left p-3 rounded-xl border bg-gray-800 border-gray-700 hover:border-gray-500 flex items-start gap-3 transition-colors active:scale-95"
                            >
                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm border bg-gray-700 border-gray-600 text-white">
                                    {isUpdating === item.id ? <Loader2 size={14} className="animate-spin" /> : <span><span className="text-xs mr-0.5">x</span>{item.so_luong}</span>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-100">{item.MonAn?.ten_mon || item.Combo?.ten_combo || 'Món ăn'}</p>
                                    {item.ghi_chu && <p className="text-[11px] text-amber-400 italic mt-0.5 font-medium">Lưu ý: {item.ghi_chu}</p>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Group: Đang nấu */}
                {cookingItems.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-2 pb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Đang thực hiện</span>
                        </div>
                        {cookingItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                disabled={isUpdating === item.id || isUpdating === 'all'}
                                className="w-full text-left p-3 rounded-xl border bg-amber-900/20 border-amber-500/30 hover:border-amber-500/50 flex items-start gap-3 transition-colors active:scale-95"
                            >
                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm border bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20">
                                    {isUpdating === item.id ? <Loader2 size={14} className="animate-spin" /> : <span><span className="text-xs mr-0.5">x</span>{item.so_luong}</span>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-amber-50">{item.MonAn?.ten_mon || item.Combo?.ten_combo || 'Món ăn'}</p>
                                    {item.ghi_chu && <p className="text-[11px] text-amber-300 italic mt-0.5 font-medium">Lưu ý: {item.ghi_chu}</p>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Group: Đã xong */}
                {doneItems.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-2 pb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Hoàn thành</span>
                        </div>
                        {doneItems.map(item => (
                            <div
                                key={item.id}
                                className="w-full text-left p-3 rounded-xl border bg-emerald-900/10 border-emerald-500/20 flex items-start gap-3 opacity-60 grayscale-[0.3]"
                            >
                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm border bg-emerald-500/50 border-emerald-500/30 text-emerald-50">
                                    <span><span className="text-xs mr-0.5">x</span>{item.so_luong}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-400 line-through">{item.MonAn?.ten_mon || item.Combo?.ten_combo || 'Món ăn'}</p>
                                </div>
                                <CheckSquare size={18} className="text-emerald-500 shrink-0 mt-1" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Card Footer - Thao Tác Nhanh Toàn Hóa Đơn */}
            {!allDone && (
                <div className="p-2 border-t border-gray-800 bg-gray-900 shrink-0 flex gap-2">
                    <button
                        onClick={handleCompleteAll}
                        disabled={isUpdating === 'all'}
                        className="flex-1 py-3 text-xs flex items-center justify-center gap-2 font-black uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isUpdating === 'all' && <Loader2 size={14} className="animate-spin" />}
                        Xong Tất Cả
                    </button>
                </div>
            )}
        </div>
    );
}
