'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, CreditCard, Plus, Clock, Loader2 } from 'lucide-react';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon } from '@/types/hoaDon';

interface TableOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: any; // { id, so_ban, status }
}

export default function TableOrderModal({ isOpen, onClose, table }: TableOrderModalProps) {
    const [invoice, setInvoice] = useState<HoaDon | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !table || table.status === 'Trống') {
            setInvoice(null);
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            try {
                // Fetch invoices for this table
                const invoices = await hoaDonService.getAll({ id_ban: table.id });
                let active = invoices.find(i => i.trang_thai_hd === 'DangPhucVu' || i.trang_thai_hd === 'ChoXuLy');
                
                if (active) {
                    // Fetch full detail with items
                    const details = await hoaDonService.getById(active.id);
                    setInvoice(details);
                } else {
                    setInvoice(null);
                }
            } catch (err) {
                console.error("Lỗi khi tải hóa đơn:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [isOpen, table]);

    if (!isOpen || !table) return null;

    const hasOrder = table.status !== 'Trống';
    
    let total = 0;
    let orderItems: any[] = [];
    
    if (invoice && invoice.ChiTietHoaDons) {
        orderItems = invoice.ChiTietHoaDons.map((ct: any) => ({
            id: ct.id,
            name: ct.MonAn?.ten_mon || ct.Combo?.ten_combo || 'Món ăn',
            price: Number(ct.MonAn?.gia_tien || ct.Combo?.gia_tien || 0),
            quantity: ct.so_luong,
            note: ct.ghi_chu || ''
        }));
        total = Number(invoice.tong_tien) || 0;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shadow-sm ${table.status === 'Trống' ? 'bg-gray-100 text-gray-500' :
                                table.status === 'Chờ thanh toán' ? 'bg-red-50 text-red-500' : 'bg-[#d9a01e]/10 text-[#d9a01e]'
                            }`}>
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">{table.so_ban}</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${table.status === 'Trống' ? 'bg-gray-300' :
                                        table.status === 'Chờ thanh toán' ? 'bg-red-500 animate-pulse' :
                                            'bg-[#d9a01e]'
                                    }`}></span>
                                <p className="text-[11px] uppercase font-bold text-gray-500 tracking-wider w-[100px]">{table.status}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[50vh] overflow-y-auto pos-scrollbar bg-gray-50/50">
                    {!hasOrder ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                            <div className="p-4 bg-gray-100 rounded-full text-gray-300 mb-2">
                                <ShoppingBag size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-600">Bàn hiện đang trống</p>
                            <p className="text-xs text-gray-400 max-w-xs">Nhấn vào "Mở Bàn" bên dưới để bắt đầu order món cho khách.</p>
                        </div>
                    ) : loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                            <Loader2 className="animate-spin text-[#d9a01e]" size={32} />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải đơn hàng...</p>
                        </div>
                    ) : !invoice ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                            <p className="text-sm font-bold text-gray-500">Bàn này chưa có hóa đơn hệ thống</p>
                            <p className="text-xs text-gray-400">Có thể khách chưa bắt đầu gọi món.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest pb-2 mb-2 border-b border-gray-200">
                                <span>Chi tiết gọi món</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(invoice.thoi_gian_tao).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            {orderItems.map((item) => (
                                <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-2 shadow-sm">
                                    <div className="flex justify-between items-start gap-4">
                                        <h4 className="font-bold text-gray-800 text-sm leading-tight flex-1">{item.name}</h4>
                                        <span className="text-xs font-black text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">x{item.quantity}</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-1">
                                        <div className="flex-1">
                                            {item.note && (
                                                <p className="text-[10px] text-gray-400 italic">Ghi chú: {item.note}</p>
                                            )}
                                        </div>
                                        <p className="text-[#d9a01e] font-black text-sm">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Actions */}
                <div className="p-5 border-t border-gray-100 bg-white">
                    {hasOrder && (
                        <div className="flex justify-between items-center px-1 mb-5">
                            <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Tạm tính</span>
                            <span className="text-2xl font-black text-[#d9a01e]">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {!hasOrder ? (
                            <button className="col-span-2 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-[#d9a01e] hover:bg-[#c89117] text-white shadow-lg shadow-[#d9a01e]/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Plus size={16} /> Mở Bàn Mới
                            </button>
                        ) : (
                            <>
                                <button className="py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Plus size={16} /> Thêm Món
                                </button>
                                <button className="py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <CreditCard size={16} /> Thanh Toán
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
