'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, ArrowLeft, LogOut } from 'lucide-react';
import { removeToken } from '@/lib/token';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function KitchenHeader() {
    const { displayName, vaiTro } = useAuth();
    const [timeString, setTimeString] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            setTimeString(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            removeToken();
            window.location.href = '/login';
        }
    };
    
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
                 <div className="flex items-center gap-4 border-r border-gray-800 pr-6 mr-2">
                     <div className="flex flex-col items-end">
                         <span className="text-sm font-black text-white uppercase tracking-tighter leading-tight">{displayName}</span>
                         <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{vaiTro === 'Admin' ? 'Quản lý' : 'Đầu bếp'}</span>
                     </div>
                      <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-amber-700 p-[2px]">
                          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center font-black text-amber-500 text-xs">
                              {displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NV'}
                          </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="ml-2 p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-sm"
                        title="Đăng xuất"
                      >
                        <LogOut size={20} />
                      </button>
                  </div>

            </div>
        </header>
    );
}
