'use client';

import React from 'react';
import { ChefHat, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function KitchenHeader() {
    const timeString = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    return (
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 shrink-0 flex items-center justify-between px-6 shadow-md z-10 w-full relative">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Trở về Quản Trị">
                    <ArrowLeft size={20} />
                </Link>
                <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
                    <ChefHat size={24} />
                </div>
                <div>
                     <h1 className="text-xl font-black text-white tracking-widest uppercase">KDS Hệ Thống</h1>
                     <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Kitchen Display System</p>
                </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
                <div className="text-4xl font-black text-white font-mono tracking-wider">{timeString}</div>
            </div>

            <div className="flex items-center gap-6">
                 <div className="flex flex-col items-end">
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Đang chờ</span>
                     <span className="text-2xl font-black text-red-500">12 Món</span>
                 </div>
                 <div className="flex flex-col items-end">
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Đang Nấu</span>
                     <span className="text-2xl font-black text-amber-500">4 Món</span>
                 </div>
            </div>
        </header>
    );
}
