'use client';

import React, { useState, useEffect } from 'react';
import { X, LockOpen, LogOut, DollarSign, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ketCaService } from '@/services/ketCa.service';
import { ThongTinCaHienTaiResponse } from '@/types/ketCa';
import { useAuth } from '@/hooks/useAuth';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'OPEN' | 'CLOSE';
    currentShiftData?: ThongTinCaHienTaiResponse['data'] | null;
    onSuccess: () => void;
}

export default function ShiftModal({ isOpen, onClose, mode, currentShiftData, onSuccess }: ShiftModalProps) {
    const [cashInput, setCashInput] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho Chi Tiêu
    const [expenseReason, setExpenseReason] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    const { isAdmin, userId } = useAuth();
    const canCloseShift = isAdmin || (currentShiftData && currentShiftData.ca_lam_viec.id_nhan_vien === userId);

    useEffect(() => {
        if (isOpen) {
            setCashInput('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        // Loại bỏ số 0 ở đầu nếu có nhiều hơn 1 chữ số
        const cleanVal = val.replace(/^0+/, '');
        setCashInput(cleanVal === '' && val !== '' ? '0' : cleanVal);
    };

    const parsedCash = parseInt(cashInput) || 0;
    
    const formatInputDisplay = (val: string) => {
        if (!val) return '';
        return parseInt(val).toLocaleString('vi-VN');
    };

    const handleSubmitOpen = async () => {
        try {
            setIsSubmitting(true);
            await ketCaService.moCa({ starting_cash: parsedCash });
            onSuccess();
        } catch (error: any) {
            console.error("Lỗi mở ca:", error);
            alert(error.response?.data?.message || "Mở ca thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitClose = async () => {
        if (!currentShiftData) return;
        try {
            setIsSubmitting(true);
            await ketCaService.chotCa(currentShiftData.ca_lam_viec.id, { actual_cash: parsedCash });
            onSuccess();
        } catch (error: any) {
            console.error("Lỗi chốt ca:", error);
            alert(error.response?.data?.message || "Chốt ca thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddExpense = async () => {
        if (!expenseReason || !expenseAmount) return;
        try {
            setIsAddingExpense(true);
            await ketCaService.themChiTieu({ 
                ly_do: expenseReason, 
                so_tien: parseInt(expenseAmount) 
            });
            setExpenseReason('');
            setExpenseAmount('');
            onSuccess(); // Re-fetch data
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi ghi chi tiêu");
        } finally {
            setIsAddingExpense(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            
            {/* Nếu mode = OPEN, đây là hard-block do chưa mở ca */}
            {mode === 'OPEN' && (
                <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50/50">
                        <LockOpen size={36} className="text-amber-500" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-widest text-center">Bắt Đầu Phiên Mới</h2>
                    <p className="text-sm font-medium text-gray-500 mt-2 text-center mb-8">Vui lòng nhập số tiền lẻ ban đầu có trong <b className="text-gray-700">Két Tiền Mặt</b> của bạn để bắt đầu làm việc.</p>

                    <div className="w-full relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <DollarSign size={20} className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            value={formatInputDisplay(cashInput)}
                            onChange={handleCashChange}
                            className="w-full pl-12 pr-12 py-5 text-2xl font-black text-amber-600 bg-amber-50/30 border-2 border-amber-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all text-right"
                            placeholder="0"
                            inputMode="numeric"
                            autoFocus
                        />
                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                            <span className="text-xl font-bold text-amber-300">₫</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full mt-4">
                        {[0, 200000, 500000].map((amt, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setCashInput(amt.toString())}
                                className="py-2.5 px-1 border border-gray-100 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                {amt === 0 ? "Két Trống" : formatVND(amt)}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleSubmitOpen}
                        disabled={isSubmitting}
                        className="w-full mt-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <LockOpen size={24} />}
                        Mở Ca Ngay
                    </button>
                </div>
            )}

            {/* Nếu mode = CLOSE, hiển thị Dashboard tạm tính và Chốt ca */}
            {mode === 'CLOSE' && currentShiftData && (
                <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="bg-gray-900 flex justify-between items-center px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex justify-center items-center">
                                <LogOut size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-lg uppercase tracking-widest">Báo Cáo Tạm Tính & Chốt Ca</h2>
                                <p className="text-gray-400 text-xs font-mono mt-1">Ca mở lúc: {new Date(currentShiftData.ca_lam_viec.thoi_gian_bat_dau).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2"><X size={24} /></button>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        {/* Cột trái: Thống kê số liệu */}
                        <div className="w-full md:w-[50%] p-8 bg-gray-50 border-r border-gray-100 flex flex-col gap-6">
                            
                            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-500 uppercase">Tiền Đầu Ca</span>
                                <span className="text-xl font-black text-gray-800">{formatVND(Number(currentShiftData.ca_lam_viec.tien_dau_ca))}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Tiền Mặt Hàng</span>
                                    <span className="text-lg font-black text-emerald-600">+{formatVND(currentShiftData.doanh_thu_tien_mat)}</span>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Chuyển Khoản</span>
                                    <span className="text-lg font-black text-blue-600">+{formatVND(currentShiftData.doanh_thu_chuyen_khoan)}</span>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Tổng Đơn Hàng</span>
                                <span className="text-lg font-black text-gray-800">{currentShiftData.tong_so_don} đơn thành công</span>
                            </div>

                            {/* Danh sách Chi Tiêu */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Chi tiêu trong ca</span>
                                    <span className="text-sm font-black text-red-600">-{formatVND(currentShiftData.tong_tien_chi)}</span>
                                </div>
                                <div className="max-h-[120px] overflow-y-auto p-2 flex flex-col gap-1">
                                    {currentShiftData.danh_sach_chi_tieu.length === 0 ? (
                                        <p className="text-[10px] text-gray-400 italic text-center py-2">Chưa có khoản chi nào</p>
                                    ) : (
                                        currentShiftData.danh_sach_chi_tieu.map((ex) => (
                                            <div key={ex.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50/50">
                                                <span className="text-[11px] font-medium text-gray-600">{ex.ly_do}</span>
                                                <span className="text-[11px] font-bold text-red-500">-{formatVND(Number(ex.so_tien))}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-200">
                                <p className="text-xs font-black uppercase text-gray-500 tracking-widest mb-1">Tổng Tiền Mặt Lý Thuyết</p>
                                <p className="text-4xl font-black text-[#d9a01e]">{formatVND(currentShiftData.tien_mat_ly_thuyet)}</p>
                                <div className="flex flex-col gap-0.5 mt-2 opacity-60">
                                    <p className="text-[10px] font-medium text-gray-500">Công thức: [Đầu ca] + [Doanh thu mặt] - [Chi tiêu]</p>
                                    <p className="text-[10px] text-gray-400 italic">({formatVND(Number(currentShiftData.ca_lam_viec.tien_dau_ca))} + {formatVND(currentShiftData.doanh_thu_tien_mat)} - {formatVND(currentShiftData.tong_tien_chi)})</p>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Form bàn giao */}
                        <div className="flex-1 p-8 bg-white flex flex-col">
                            <h3 className="text-sm font-black uppercase text-gray-800 tracking-widest mb-6 flex items-center gap-2">
                                Bàn Giao Két Tiền
                            </h3>

                            {/* Form Thêm Chi Tiêu Nhanh */}
                            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-8">
                                <p className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em] mb-4">Ghi nhận chi tiêu vặt</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Lý do (VD: Mua đá...)"
                                        value={expenseReason}
                                        onChange={(e) => setExpenseReason(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 transition-all font-medium"
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Số tiền"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 transition-all font-bold"
                                    />
                                    <button 
                                        onClick={handleAddExpense}
                                        disabled={isAddingExpense || !expenseReason || !expenseAmount}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                                    >
                                        {isAddingExpense ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
                                    </button>
                                </div>
                            </div>
                            
                            <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-3">Nhập Số Tiền Có Thực Tế Trong Két Đang Đếm Được</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <DollarSign size={20} className="text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    value={formatInputDisplay(cashInput)}
                                    onChange={handleCashChange}
                                    className="w-full pl-12 pr-12 py-5 text-3xl font-black text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-right"
                                    placeholder="0"
                                    inputMode="numeric"
                                />
                                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                                    <span className="text-2xl font-bold text-gray-300">₫</span>
                                </div>
                            </div>

                            {cashInput && (
                                <div className={`mt-6 p-5 rounded-2xl border-2 flex items-center gap-4 ${
                                    parsedCash === currentShiftData.tien_mat_ly_thuyet 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                        : parsedCash < currentShiftData.tien_mat_ly_thuyet 
                                            ? 'bg-red-50 border-red-100 text-red-700' 
                                            : 'bg-amber-50 border-amber-100 text-amber-700'
                                }`}>
                                    {parsedCash === currentShiftData.tien_mat_ly_thuyet ? (
                                        <CheckCircle2 size={32} className="text-emerald-500 flex-shrink-0" />
                                    ) : (
                                        <AlertTriangle size={32} className={`${parsedCash < currentShiftData.tien_mat_ly_thuyet ? "text-red-500" : "text-amber-500"} flex-shrink-0`} />
                                    )}
                                    
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Chênh Lệch</p>
                                        <p className="text-xl font-black">
                                            {parsedCash === currentShiftData.tien_mat_ly_thuyet 
                                                ? "Khớp Toàn Bộ" 
                                                : parsedCash < currentShiftData.tien_mat_ly_thuyet 
                                                    ? `Thiếu ${formatVND(currentShiftData.tien_mat_ly_thuyet - parsedCash)}`
                                                    : `Thừa ${formatVND(parsedCash - currentShiftData.tien_mat_ly_thuyet)}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!canCloseShift ? (
                                <div className="mt-auto p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                                    <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">
                                        Bạn không có quyền chốt ca này. Vui lòng liên hệ chủ ca hoặc Quản lý.
                                    </p>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleSubmitClose}
                                    disabled={isSubmitting || !cashInput}
                                    className="w-full py-5 mt-auto rounded-2xl font-black uppercase tracking-[0.2em] text-white bg-gray-900 hover:bg-black disabled:opacity-50 active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                                    Bàn Giao & Kết Phiên
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
