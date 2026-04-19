'use client';

import React, { useState, useEffect } from 'react';
import { X, Wallet, QrCode, CheckCircle2, Loader2, DollarSign } from 'lucide-react';
import { hoaDonService } from '@/services/hoaDon.service';
import { usePos } from '@/context/PosContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, totalAmount, onSuccess }: PaymentModalProps) {
    const { activeOrder, selectedTable } = usePos();
    const [paymentMethod, setPaymentMethod] = useState<'TienMat' | 'ChuyenKhoan'>('TienMat');
    const [cashGiven, setCashGiven] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dữ liệu ngân hàng ảo hoặc hardcode (Ngân hàng BIDV, STK: 123456789, Tên: NGUYEN VAN A)
    const BANK_ID = "BIDV";
    const ACCOUNT_NO = "123456789";
    const ACCOUNT_NAME = "NGUYEN VAN A";

    // Format tiền VND
    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Auto-focus ô nhập tiền khi mở modal
    useEffect(() => {
        if (isOpen && paymentMethod === 'TienMat') {
            setCashGiven('');
        }
    }, [isOpen, paymentMethod]);

    if (!isOpen) return null;

    const cashAmount = parseInt(cashGiven.replace(/\D/g, '')) || 0;
    const changeAmount = cashAmount - totalAmount;
    const isCashValid = cashAmount >= totalAmount;

    // QR Code tự động qua API VietQR
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.jpg?amount=<AMOUNT>&addInfo=<INFO>&accountName=<ACCOUNT_NAME>
    const qrInfo = `Thanh toan ban ${selectedTable?.so_ban}`;
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.jpg?amount=${totalAmount}&addInfo=${encodeURIComponent(qrInfo)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    const handleQuickCash = (amount: number) => {
        setCashGiven(amount.toString());
    };

    const handlePayment = async () => {
        if (!activeOrder?.id) {
            alert("Lỗi: Không tìm thấy hóa đơn hợp lệ để thanh toán!");
            return;
        }

        try {
            setIsSubmitting(true);
            await hoaDonService.updateStatus(activeOrder.id, {
                trang_thai_hd: 'DaThanhToan',
                phuong_thuc_tt: paymentMethod
            });
            onSuccess(); // Sẽ gọi refresh, clear cart và tắt modal
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            alert("Thanh toán thất bại, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="bg-gray-50 flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">
                            Thanh Toán: {selectedTable?.so_ban}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">Hóa đơn #{activeOrder?.id?.substring(0, 8)}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full md:h-[500px]">
                    {/* Left Column: Tùy chọn Thanh toan */}
                    <div className="w-full md:w-[40%] bg-white border-r border-gray-100 flex flex-col">
                        <div className="p-6">
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Phương Thức</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setPaymentMethod('TienMat')}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                        paymentMethod === 'TienMat' 
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <Wallet size={20} className={paymentMethod === 'TienMat' ? 'text-emerald-500' : 'text-gray-400'} />
                                    <span className="font-bold">Tiền mặt</span>
                                    {paymentMethod === 'TienMat' && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
                                </button>
                                
                                <button
                                    onClick={() => setPaymentMethod('ChuyenKhoan')}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                        paymentMethod === 'ChuyenKhoan' 
                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <QrCode size={20} className={paymentMethod === 'ChuyenKhoan' ? 'text-blue-500' : 'text-gray-400'} />
                                    <span className="font-bold">Chuyển khoản / QR</span>
                                    {paymentMethod === 'ChuyenKhoan' && <CheckCircle2 size={16} className="ml-auto text-blue-500" />}
                                </button>
                            </div>
                        </div>

                        {/* Tổng tiền Widget luôn nằm dưới góc trái */}
                        <div className="mt-auto p-6 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Tổng Cần Thanh Toán</p>
                            <p className="text-3xl font-black text-[#d9a01e]">{formatVND(totalAmount)}</p>
                        </div>
                    </div>

                    {/* Right Column: Nội dung Method */}
                    <div className="flex-1 bg-white p-6 md:p-8 overflow-y-auto">
                        
                        {/* ---------------- TIỀN MẶT ---------------- */}
                        {paymentMethod === 'TienMat' && (
                            <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Tiền Khách Đưa</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <DollarSign size={20} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={cashGiven ? formatVND(parseInt(cashGiven.replace(/\D/g, '')) || 0) : ''}
                                            onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-11 pr-4 py-4 text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors text-right"
                                            placeholder="0 ₫"
                                            inputMode="numeric"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Gợi ý tiền nhanh */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[totalAmount, 500000, 1000000].map((amt, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => handleQuickCash(amt)}
                                            className="py-2 px-1 border border-gray-200 rounded-xl bg-white text-gray-600 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        >
                                            {idx === 0 ? "Vừa đủ" : formatVND(amt)}
                                        </button>
                                    ))}
                                </div>

                                <div className={`mt-auto p-5 rounded-2xl border-2 flex items-center justify-between ${
                                    cashAmount > 0 && isCashValid 
                                        ? 'border-emerald-100 bg-emerald-50' 
                                        : cashAmount > 0 ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'
                                }`}>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest mb-1 text-gray-500">Tiền Thừa Trả Khách</p>
                                        <p className={`text-2xl font-black ${
                                            cashAmount > 0 && isCashValid ? 'text-emerald-600' : cashAmount > 0 ? 'text-red-500' : 'text-gray-400'
                                        }`}>
                                            {formatVND(changeAmount > 0 ? changeAmount : 0)}
                                        </p>
                                    </div>
                                    {(cashAmount > 0 && !isCashValid) && (
                                        <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-md shadow-sm border border-red-100">Khách đưa thiếu</span>
                                    )}
                                </div>

                                <button 
                                    onClick={handlePayment}
                                    disabled={isSubmitting || !isCashValid}
                                    className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />} 
                                    {isSubmitting ? 'Đang Xử Lý...' : 'Hoàn Tất Thanh Toán'}
                                </button>
                            </div>
                        )}

                        {/* ---------------- CHUYỂN KHOẢN ---------------- */}
                        {paymentMethod === 'ChuyenKhoan' && (
                            <div className="h-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300 relative">
                                
                                <div className="text-center mb-6">
                                    <h4 className="font-black text-gray-800 text-lg">Quét Mã QR Chuyển Khoản</h4>
                                    <p className="text-sm font-medium text-gray-500">Người nhận: <span className="font-bold text-gray-900">{ACCOUNT_NAME}</span></p>
                                </div>

                                <div className="bg-white p-2 rounded-3xl shadow-xl shadow-blue-500/10 border border-blue-100 relative max-w-[200px] md:max-w-[240px]">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-xl -z-10 rounded-full"></div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrUrl} alt="VietQR" className="w-full rounded-2xl" />
                                </div>
                                
                                <p className="mt-5 text-xs font-medium text-gray-400 text-center px-4">
                                    Đưa mã này cho khách hàng quét trên ứng dụng ngân hàng. Vui lòng xác nhận bạn đã nhận được tiền trước khi bấm hoàn tất.
                                </p>

                                <button 
                                    onClick={handlePayment}
                                    disabled={isSubmitting}
                                    className="w-full py-4 mt-auto rounded-2xl font-black uppercase tracking-[0.2em] text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />} 
                                    {isSubmitting ? 'Đang Xử Lý...' : 'Đã Nhận Được Tiền'}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
