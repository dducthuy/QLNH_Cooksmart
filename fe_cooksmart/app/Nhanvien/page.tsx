'use client';

import React, { useState } from 'react';
import TableGrid from '@/components/pos/TableGrid';
import MenuSection from '@/components/pos/MenuSection';
import OrderCart from '@/components/pos/OrderCart';
import PendingOrdersPanel from '@/components/pos/PendingOrdersPanel';
import { usePos } from '@/context/PosContext';
import ShiftModal from '@/components/pos/ShiftModal';
import ComboDetailModal from '@/components/ui/ComboDetailModal';
import { LayoutGrid, UtensilsCrossed, ShoppingBag, Lock, Loader2, ClipboardList } from 'lucide-react';
import { ketCaService } from '@/services/ketCa.service';
import { ThongTinCaHienTaiResponse } from '@/types/ketCa';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PosPage() {
    // State để điều khiển tab trên giao diện Mobile (Điện thoại/ iPad xoay dọc)
    const [mobileTab, setMobileTab] = useState<'tables' | 'menu' | 'cart' | 'pending'>('menu');

    const { isThuNgan, isAdmin, vaiTro } = useAuth();
    const {
        setCurrentShift,
        currentShift,
        hasActiveShift,
        refreshShiftStatus,
        isInitialShiftCheckDone,
        isShiftModalOpen,
        setIsShiftModalOpen,
        shiftMode,
        setShiftMode,
        viewingCombo,
        setViewingCombo
    } = usePos();

    const isCheckingShift = !isInitialShiftCheckDone;

    const fetchCurrentShift = async (openReport = false) => {
        try {
            await refreshShiftStatus();
            if (openReport) {
                setShiftMode('CLOSE');
                setIsShiftModalOpen(true);
            }
        } catch (error: any) {
            console.error("Lỗi kiểm tra ca:", error);
        }
    };


    useEffect(() => {
        if (hasActiveShift && shiftMode === 'OPEN') {
            setIsShiftModalOpen(false);
        }
        if (!hasActiveShift && (isAdmin || isThuNgan)) {
            setShiftMode('OPEN');
            setIsShiftModalOpen(true);
        }
    }, [hasActiveShift, isAdmin, isThuNgan, shiftMode, setIsShiftModalOpen, setShiftMode]);

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



            {/* Cột 1: Quản lý Bàn Ăn */}
            <div className={`w-full lg:w-[25%] bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col h-full ${mobileTab === 'tables' ? 'flex' : 'hidden lg:flex'
                }`}>
                <TableGrid />
            </div>

            {/* Cột 2: Thực Đơn & Chọn Món */}
            <div className={`flex-1 bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col relative z-0 h-full ${mobileTab === 'menu' ? 'flex' : 'hidden lg:flex'
                }`}>

                <MenuSection />
            </div>

            {/* Cột 3: Giỏ Hàng & Thanh Toán */}
            <div className={`w-full lg:w-[25%] bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col z-10 h-full ${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
                }`}>
                <OrderCart />
            </div>

            {/* Đơn Chờ Duyệt (QR Orders) - Now a floating drawer */}
            <PendingOrdersPanel />

            {/* Thanh điều hướng Bottom Navigation Bar DÀNH RIÊNG CHO MOBILE */}
            <div className="lg:hidden shrink-0 flex items-center justify-around bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] p-2 pb-safe z-50">
                <button
                    onClick={() => setMobileTab('tables')}
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all ${mobileTab === 'tables' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <LayoutGrid size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bàn Ăn</span>
                </button>
                <button
                    onClick={() => setMobileTab('menu')}
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all ${mobileTab === 'menu' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <UtensilsCrossed size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Thực Đơn</span>
                </button>
                <button
                    onClick={() => setMobileTab('cart')}
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all relative ${mobileTab === 'cart' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <ShoppingBag size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Giỏ Hàng</span>
                </button>
                <button
                    onClick={() => setMobileTab('pending')}
                    className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all relative ${mobileTab === 'pending' ? 'text-violet-600 bg-violet-50 shadow-sm' : 'text-gray-400 hover:text-gray-600'
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
                    fetchCurrentShift();
                }}
            />

            {/* Combo Detail Modal - Cấp cao nhất để che phủ toàn bộ */}
            {viewingCombo && (
                <ComboDetailModal
                    combo={viewingCombo}
                    onClose={() => setViewingCombo(null)}
                />
            )}

        </div>
    );
}
