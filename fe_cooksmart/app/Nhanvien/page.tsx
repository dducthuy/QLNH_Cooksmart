'use client';

import React, { useState } from 'react';
import TableGrid from '@/components/pos/TableGrid';
import MenuSection from '@/components/pos/MenuSection';
import OrderCart from '@/components/pos/OrderCart';
import PendingOrdersPanel from '@/components/pos/PendingOrdersPanel';
import { usePos } from '@/context/PosContext';
import ShiftModal from '@/components/pos/ShiftModal';
import { LayoutGrid, UtensilsCrossed, ShoppingBag, Lock, Loader2, ClipboardList } from 'lucide-react';
import { ketCaService } from '@/services/ketCa.service';
import { ThongTinCaHienTaiResponse } from '@/types/ketCa';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PosPage() {
    // State để điều khiển tab trên giao diện Mobile (Điện thoại/ iPad xoay dọc)
    const [mobileTab, setMobileTab] = useState<'tables' | 'menu' | 'cart' | 'pending'>('menu');

    const { isThuNgan, isAdmin, vaiTro } = useAuth();
    const { setCurrentShift, currentShift, hasActiveShift } = usePos();

    // Quản lý Ca (Shift Management)
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [shiftMode, setShiftMode] = useState<'OPEN' | 'CLOSE'>('OPEN');
    const [isCheckingShift, setIsCheckingShift] = useState(true);

    const fetchCurrentShift = async (openReport = false) => {
        try {
            setIsCheckingShift(true);
            const res = await ketCaService.getCaHienTai();
            setCurrentShift(res.data);

            if (openReport) {
                setShiftMode('CLOSE');
                setIsShiftModalOpen(true);
            } else {
                setIsShiftModalOpen(false); // Ca đang chạy và không yêu cầu mở report => Tắt modal block
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Chưa có ca mở
                setCurrentShift(null);
                setShiftMode('OPEN');
                // CHỈ BLOCK CỨNG NẾU LÀ ADMIN HOẶC THU NGÂN
                if (isAdmin || isThuNgan) {
                    setIsShiftModalOpen(true);
                } else {
                    setIsShiftModalOpen(false);
                }
            } else {
                console.error("Lỗi kiểm tra ca:", error);
            }
        } finally {
            setIsCheckingShift(false);
        }
    };

    useEffect(() => {
        fetchCurrentShift();
    }, []);

    const handleOpenShiftManager = () => {
        fetchCurrentShift(true);
    };

    if (isCheckingShift) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f8f9fc]">
                <Loader2 size={48} className="animate-spin text-amber-500 mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Đang tải cấu hình máy POS...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row w-full h-full bg-[#f8f9fc] p-0 lg:p-4 gap-0 lg:gap-4 overflow-hidden relative">
            
            {/* Shift Indicator BUtton */}
            {!isShiftModalOpen && (
                <button 
                    onClick={handleOpenShiftManager}
                    className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 border-2 px-6 py-2 rounded-full shadow-2xl flex items-center gap-2 transition-all group scale-90 lg:scale-100 ${
                        hasActiveShift 
                        ? 'bg-gray-900 border-gray-800 text-white hover:bg-black' 
                        : 'bg-red-500 border-red-400 text-white hover:bg-red-600'
                    }`}
                >
                    <span className={`w-2.5 h-2.5 rounded-full ${hasActiveShift ? 'bg-emerald-400 animate-pulse' : 'bg-white'}`}></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {hasActiveShift ? 'Ca Đang Làm Việc' : 'Chưa Mở Ca'}
                    </span>
                    <Lock size={12} className="ml-2 opacity-50 group-hover:opacity-100" />
                </button>
            )}

            {/* Cột 1: Quản lý Bàn Ăn */}
            <div className={`w-full lg:w-[25%] bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col h-full ${
                mobileTab === 'tables' ? 'flex' : 'hidden lg:flex'
            }`}>
                <TableGrid />
            </div>

            {/* Cột 2: Thực Đơn & Chọn Món */}
            <div className={`flex-1 bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col relative z-0 h-full ${
                mobileTab === 'menu' ? 'flex' : 'hidden lg:flex'
            }`}>
                {!hasActiveShift && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[90%] bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <Lock size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black text-amber-900 uppercase tracking-tight">Chưa có ca làm việc</p>
                            <p className="text-[10px] text-amber-700 font-medium">Vui lòng liên hệ Thu ngân/Quản lý mở ca để thực hiện thanh toán.</p>
                        </div>
                    </div>
                )}
                <MenuSection />
            </div>

            {/* Cột 3: Giỏ Hàng & Thanh Toán */}
            <div className={`w-full lg:w-[25%] bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col z-10 h-full ${
                mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
            }`}>
                <OrderCart />
            </div>

            {/* Đơn Chờ Duyệt (QR Orders) - Now a floating drawer */}
            <PendingOrdersPanel />

            {/* Thanh điều hướng Bottom Navigation Bar DÀNH RIÊNG CHO MOBILE */}
            <div className="lg:hidden shrink-0 flex items-center justify-around bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] p-2 pb-safe z-50">
                <button 
                    onClick={() => setMobileTab('tables')} 
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all ${
                        mobileTab === 'tables' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <LayoutGrid size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bàn Ăn</span>
                </button>
                <button 
                    onClick={() => setMobileTab('menu')} 
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all ${
                        mobileTab === 'menu' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <UtensilsCrossed size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Thực Đơn</span>
                </button>
                <button 
                    onClick={() => setMobileTab('cart')} 
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all relative ${
                        mobileTab === 'cart' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <ShoppingBag size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Giỏ Hàng</span>
                </button>
                <button 
                    onClick={() => setMobileTab('pending')} 
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all relative ${
                        mobileTab === 'pending' ? 'text-violet-600 bg-violet-50 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <ClipboardList size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">QR Orders</span>
                </button>
            </div>

            {/* Cửa sổ Quản lý Ca (Shift Modal) */}
            <ShiftModal 
                isOpen={isShiftModalOpen}
                mode={shiftMode}
                currentShiftData={currentShift}
                onClose={() => {
                    // Cho phép đóng modal nếu user không bắt buộc phải mở ca
                    setIsShiftModalOpen(false);
                }}
                onSuccess={() => {
                    fetchCurrentShift(); // Refresh lại lấy dữ liệu mới
                }}
            />

        </div>
    );
}
