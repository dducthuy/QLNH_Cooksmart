'use client';

import React, { useState } from 'react';
import TableGrid from '@/components/pos/TableGrid';
import MenuSection from '@/components/pos/MenuSection';
import OrderCart from '@/components/pos/OrderCart';
import { LayoutGrid, UtensilsCrossed, ShoppingBag } from 'lucide-react';

export default function PosPage() {
    // State để điều khiển tab trên giao diện Mobile (Điện thoại/ iPad xoay dọc)
    const [mobileTab, setMobileTab] = useState<'tables' | 'menu' | 'cart'>('menu');

    return (
        <div className="flex flex-col lg:flex-row w-full h-full bg-[#f8f9fc] p-0 lg:p-4 gap-0 lg:gap-4 overflow-hidden relative">

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
                <MenuSection />
            </div>

            {/* Cột 3: Giỏ Hàng & Thanh Toán */}
            <div className={`w-full lg:w-[30%] bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col z-10 h-full ${
                mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
            }`}>
                <OrderCart />
            </div>

            {/* Thanh điều hướng Bottom Navigation Bar DÀNH RIÊNG CHO MOBILE */}
            <div className="lg:hidden shrink-0 flex items-center justify-around bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] p-2 pb-safe z-50">
                <button 
                    onClick={() => setMobileTab('tables')} 
                    className={`flex flex-col items-center p-2 rounded-2xl w-24 transition-all ${
                        mobileTab === 'tables' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <LayoutGrid size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bàn Ăn</span>
                </button>
                <button 
                    onClick={() => setMobileTab('menu')} 
                    className={`flex flex-col items-center p-2 rounded-2xl w-24 transition-all ${
                        mobileTab === 'menu' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <UtensilsCrossed size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Thực Đơn</span>
                </button>
                <button 
                    onClick={() => setMobileTab('cart')} 
                    className={`flex flex-col items-center p-2 rounded-2xl w-24 transition-all relative ${
                        mobileTab === 'cart' ? 'text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <ShoppingBag size={22} className="mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Giỏ Hàng</span>
                    {/* Fake Badge (Số lượng món) */}
                    <span className="absolute top-1 right-4 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm">
                        3
                    </span>
                </button>
            </div>

        </div>
    );
}
