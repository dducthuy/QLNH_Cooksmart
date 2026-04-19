'use client';

import React, { useState } from 'react';
import { ShoppingBag, Minus, Plus, Trash2, Send, CreditCard, Loader2 } from 'lucide-react';
import { usePos } from '@/context/PosContext';
import { hoaDonService } from '@/services/hoaDon.service';
import PaymentModal from './PaymentModal';

export default function OrderCart() {
    const { 
        selectedTable, 
        cart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        activeOrder, 
        isLoadingOrder, 
        refreshActiveOrder,
        hasActiveShift
    } = usePos();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Tính tổng tiền từ cả cart và activeOrder
    const cartTotal = cart.reduce((acc, item) => acc + item.gia_tien * item.so_luong, 0);
    const activeOrderTotal = activeOrder?.tong_tien ? Number(activeOrder.tong_tien) : 0;
    const total = cartTotal + activeOrderTotal;

    const handleGuiBep = async () => {
        if (!selectedTable) {
            alert("Vui lòng chọn bàn trên Sơ đồ bàn trước khi gọi món!");
            return;
        }
        if (cart.length === 0) {
            alert("Vui lòng chọn ít nhất một món ăn!");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                id_ban: selectedTable.id,
                chi_tiet_hoa_don: cart.map(item => ({
                    id_mon_an: item.id_mon_an,
                    so_luong: item.so_luong,
                    ghi_chu: item.ghi_chu
                }))
            };
            
            await hoaDonService.createNoiBo(payload);
            
            alert(`Gửi món thành công cho bàn ${selectedTable.so_ban}!`);
            clearCart();
            await refreshActiveOrder(); // Tải lại đơn hàng để hiển thị món mới vừa gửi
            
        } catch (error: any) {
            console.error("Lỗi gửi bếp:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi đơn xuống bếp!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DangCho': return <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-tight">Đang chờ</span>;
            case 'DangNau': return <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-tight animate-pulse">Đang nấu</span>;
            case 'DaXong': return <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-tight">Đã xong</span>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl shadow-md ${selectedTable ? 'bg-[#d9a01e]' : 'bg-gray-800'}`}>
                        <ShoppingBag size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-gray-800 uppercase tracking-wide">
                            {selectedTable ? selectedTable.so_ban : 'Chưa chọn bàn'}
                        </h2>
                        <p className="text-xs uppercase font-bold text-gray-400 mt-0.5 font-mono">
                            {selectedTable ? `#${selectedTable.id.substring(0, 8)}` : 'Vui lòng chọn bàn'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 pos-scrollbar relative">
                {isLoadingOrder && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#d9a01e]" size={24} />
                    </div>
                )}

                {cart.length === 0 && (!activeOrder || !activeOrder.ChiTietHoaDons || activeOrder.ChiTietHoaDons.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3 py-10">
                        <ShoppingBag size={40} className="text-gray-200" />
                        <span className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Chưa chọn món</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section 1: Món đã gọi (Active Order) */}
                        {activeOrder && activeOrder.ChiTietHoaDons && activeOrder.ChiTietHoaDons.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d9a01e]"></div>
                                    Món đã gọi ({activeOrder.ChiTietHoaDons.length})
                                </h3>
                                <div className="space-y-2.5">
                                    {activeOrder.ChiTietHoaDons.map((item, index) => (
                                        <div key={`active-${item.id}-${index}`} className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-1.5 opacity-80 border-dashed">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-bold text-gray-700 text-sm leading-tight flex-1 line-clamp-2">{item.MonAn?.ten_mon || item.Combo?.ten_combo || 'Món ăn'}</h4>
                                                {getStatusBadge(item.trang_thai_mon)}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-800 bg-white px-2 py-0.5 rounded-md border border-gray-100">x{item.so_luong}</span>
                                                    {item.ghi_chu && <span className="text-[10px] text-gray-400 italic">"{item.ghi_chu}"</span>}
                                                </div>
                                                <p className="text-gray-500 font-bold text-xs">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.MonAn?.gia_tien || item.Combo?.gia_tien || 0) * item.so_luong)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 2: Món mới chọn (Draft items to be sent) */}
                        {cart.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-3 ml-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                    Món mới chọn ({cart.length})
                                </h3>
                                <div className="space-y-3">
                                    {cart.map((item, index) => (
                                        <div key={`cart-${item.id_mon_an}-${index}`} className="p-3 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex flex-col gap-2 group shadow-sm ring-1 ring-blue-500/5">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-800 text-base leading-tight flex-1 pr-2">{item.ten_mon}</h4>
                                                <button 
                                                    onClick={() => removeFromCart(item.id_mon_an)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-lg border border-gray-100 shadow-sm"
                                                >
                                                    <Trash2 size={12}/>
                                                </button>
                                            </div>
                                            <p className="text-[#d9a01e] font-black text-sm">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia_tien)}
                                            </p>
                                            {item.ghi_chu && (
                                                <p className="text-xs text-gray-400 italic font-medium mt-0.5">Ghi chú: {item.ghi_chu}</p>
                                            )}
                                            
                                            <div className="flex justify-between items-center mt-1 pt-2 border-t border-blue-100 border-dashed">
                                                <span className="text-xs uppercase font-bold text-gray-400">SL:</span>
                                                <div className="flex items-center gap-3 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id_mon_an, -1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#d9a01e] transition-colors rounded-lg"
                                                    >
                                                        <Minus size={14}/>
                                                    </button>
                                                    <span className="text-sm font-black w-4 text-center text-gray-800">{item.so_luong}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id_mon_an, 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#d9a01e] transition-colors rounded-lg"
                                                    >
                                                        <Plus size={14}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Summary & Actions Fixed Bottom */}
            <div className="p-5 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-3xl">
                {/* Summary */}
                <div className="space-y-3 mb-5 bg-white p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Tạm tính</span>
                        <span className="text-gray-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
                    </div>
                    {activeOrder && activeOrder.giam_gia > 0 && (
                        <div className="flex justify-between items-center text-xs font-bold text-emerald-500 uppercase tracking-widest">
                            <span>Giảm giá</span>
                            <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeOrder.giam_gia)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 border-dashed">
                        <span className="text-sm font-black text-gray-800 uppercase tracking-widest">Thành Tiền</span>
                        <span className="text-2xl font-black text-[#d9a01e]">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total - (activeOrder?.giam_gia || 0))}
                        </span>
                    </div>
                </div>

                {/* Big Action Buttons */}
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-[40%] py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                        disabled={isSubmitting || !selectedTable || !activeOrder || cart.length > 0 || !hasActiveShift}
                    >
                        <CreditCard size={18} /> <span className="hidden xl:inline">Thanh Toán</span>
                    </button>
                    <button 
                        onClick={handleGuiBep}
                        disabled={isSubmitting || !selectedTable || cart.length === 0}
                        className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Bếp'}
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                totalAmount={total - (activeOrder?.giam_gia || 0)}
                onSuccess={() => {
                    alert("Thanh toán thành công! Bàn đã được làm trống.");
                    setIsPaymentModalOpen(false);
                    clearCart();
                    refreshActiveOrder();
                }}
            />
        </div>
    );
}
