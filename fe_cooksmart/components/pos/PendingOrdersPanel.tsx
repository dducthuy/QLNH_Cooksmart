'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, CheckCircle2, XCircle, Loader2,
    UtensilsCrossed, RefreshCw, Clock, Bell, X
} from 'lucide-react';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon } from '@/types/hoaDon';
import { io } from 'socket.io-client';

const vnd = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    return `${Math.floor(mins / 60)} giờ trước`;
}

export default function PendingOrdersPanel() {
    const [pendingOrders, setPendingOrders] = useState<HoaDon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [hasNewOrder, setHasNewOrder] = useState(false);

    const fetchPending = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await hoaDonService.getAll({ trang_thai_hd: 'ChoXuLy' });
            setPendingOrders(data);
        } catch {
            console.error('Lỗi tải đơn chờ duyệt');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    // Lắng nghe Socket khi có đơn QR mới
    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
        socket.on('don_qr_cho_duyet', () => {
            setHasNewOrder(true);
            fetchPending(); // Tự refresh danh sách
        });
        return () => { socket.disconnect(); };
    }, [fetchPending]);

    const handleApprove = async (hoaDonId: string) => {
        try {
            setProcessingId(hoaDonId);
            await hoaDonService.updateStatus(hoaDonId, { trang_thai_hd: 'DangPhucVu' });
            setPendingOrders(prev => prev.filter(o => o.id !== hoaDonId));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Lỗi duyệt đơn!');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (hoaDonId: string) => {
        if (!confirm('Hủy đơn này? Khách hàng sẽ cần đặt lại.')) return;
        try {
            setProcessingId(hoaDonId);
            await hoaDonService.updateStatus(hoaDonId, { trang_thai_hd: 'DaHuy' });
            setPendingOrders(prev => prev.filter(o => o.id !== hoaDonId));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Lỗi hủy đơn!');
        } finally {
            setProcessingId(null);
        }
    };

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 lg:bottom-8 right-6 lg:right-auto lg:left-8 z-50 p-4 rounded-2xl shadow-2xl transition-all ${
                    pendingOrders.length > 0 
                    ? 'bg-violet-600 hover:bg-violet-700 text-white animate-bounce' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
                <div className="relative">
                    <Bell size={24} />
                    {pendingOrders.length > 0 && (
                        <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                            {pendingOrders.length}
                        </span>
                    )}
                </div>
            </button>

            {/* Drawer Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 shrink-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-md shadow-violet-200">
                                        <ClipboardList size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                            Đơn Chờ Duyệt
                                            {pendingOrders.length > 0 && (
                                                <span className="bg-violet-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                    {pendingOrders.length}
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Đơn khách quét QR</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { fetchPending(); setHasNewOrder(false); }}
                                        className={`p-2 rounded-xl border transition-all ${hasNewOrder ? 'bg-violet-50 border-violet-200 text-violet-600 animate-pulse' : 'border-gray-100 text-gray-400 hover:text-violet-500'}`}
                                        title="Làm mới"
                                    >
                                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 pos-scrollbar space-y-3">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
                                    <Loader2 size={28} className="animate-spin text-violet-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Đang tải...</span>
                                </div>
                            ) : pendingOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                        <ClipboardList size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Không có đơn chờ</p>
                                    <p className="text-[10px] text-gray-300">Đơn QR của khách sẽ hiện ở đây</p>
                                </div>
                            ) : (
                                pendingOrders.map(order => (
                                    <div key={order.id} className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden ring-1 ring-violet-500/10">
                                        {/* Top strip */}
                                        <div className="h-1 w-full bg-gradient-to-r from-violet-400 to-purple-500" />
                                        <div className="p-3.5">
                                            {/* Header row */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-black text-gray-800 text-base leading-none">
                                                        {order.BanAn?.so_ban ?? 'Bàn không xác định'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Clock size={10} className="text-gray-400" />
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {timeAgo(order.thoi_gian_tao)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-600 border border-violet-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    <Bell size={9} className="animate-pulse" />
                                                    Chờ duyệt
                                                </span>
                                            </div>

                                            {/* Dishes */}
                                            {order.ChiTietHoaDons && order.ChiTietHoaDons.length > 0 && (
                                                <div className="bg-gray-50 rounded-xl p-2.5 mb-3 space-y-1">
                                                    {order.ChiTietHoaDons.slice(0, 3).map((ct: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs">
                                                            <UtensilsCrossed size={10} className="text-gray-400 shrink-0" />
                                                            <span className="text-gray-700 font-medium flex-1 truncate">
                                                                {ct.MonAn?.ten_mon || ct.Combo?.ten_combo || 'Món ăn'}
                                                            </span>
                                                            <span className="font-black text-gray-600">x{ct.so_luong}</span>
                                                        </div>
                                                    ))}
                                                    {order.ChiTietHoaDons.length > 3 && (
                                                        <p className="text-[10px] text-gray-400 italic pl-4">
                                                            +{order.ChiTietHoaDons.length - 3} món khác...
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Total */}
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</span>
                                                <span className="font-black text-gray-800 text-sm">{vnd(Number(order.tong_tien))}</span>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReject(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all disabled:opacity-50 uppercase tracking-wider"
                                                >
                                                    {processingId === order.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-md hover:shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wider"
                                                >
                                                    {processingId === order.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                                    Duyệt
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
