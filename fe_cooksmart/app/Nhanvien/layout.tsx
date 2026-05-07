'use client';

import AdminGuard from '@/components/admin/layout/Guard';
import { ArrowLeft, Lock, Bell, User, LogOut } from 'lucide-react';
import { removeToken } from '@/lib/token';
import Link from 'next/link';
import { PosProvider, usePos } from '@/context/PosContext';
import { SocketProvider } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';

function PosHeader() {
    const { displayName, vaiTro } = useAuth();
    const { 
        hasActiveShift, 
        currentShift, 
        setIsShiftModalOpen, 
        setShiftMode, 
        refreshShiftStatus,
        pendingOrdersCount,
        setIsPendingOrdersOpen,
        notifications,
        clearNotifications
    } = usePos();

    const totalNotiCount = pendingOrdersCount + notifications.length;

    const getInitials = (name: string) => {
        if (!name || name === 'Người Dùng') return 'NV';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            removeToken();
            window.location.href = '/login';
        }
    };

    const handleOpenShiftManager = async () => {
        await refreshShiftStatus();
        setShiftMode('CLOSE');
        setIsShiftModalOpen(true);
    };

    return (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Trở về quản trị">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-base font-black text-[#d9a01e] uppercase tracking-widest">
                    CookSmart <span className="text-gray-800 font-bold">POS</span>
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* --- Nút Trạng Thái Ca --- */}
                <button 
                    onClick={handleOpenShiftManager}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                        hasActiveShift 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                        : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${hasActiveShift ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                        {hasActiveShift 
                            ? (currentShift?.ca_lam_viec?.NguoiDung?.ho_ten || 'Đang làm việc') 
                            : 'Chưa mở ca'}
                    </span>
                    <Lock size={14} className="opacity-40" />
                </button>

                {/* --- Nút Thông Báo (CHỜ DUYỆT ĐƠN & MÓN XONG) --- */}
                <button 
                    onClick={() => {
                        setIsPendingOrdersOpen(true);
                    }}
                    className={`p-2.5 rounded-xl transition-all relative group ${
                        totalNotiCount > 0 
                        ? (pendingOrdersCount > 0 ? 'bg-violet-50 text-violet-600 animate-bounce-slow' : 'bg-emerald-50 text-emerald-600') 
                        : 'bg-gray-50 text-gray-400 hover:text-[#d9a01e] hover:bg-amber-50'
                    }`}
                >
                    <Bell size={20} />
                    {totalNotiCount > 0 && (
                        <span className={`absolute -top-1.5 -right-1.5 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm ${
                            pendingOrdersCount > 0 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}>
                            {totalNotiCount}
                        </span>
                    )}
                </button>

                <div className="h-8 w-[1px] bg-gray-100 mx-1"></div>

                <div className="flex flex-col text-right justify-center ml-2">
                    <span className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-tight max-w-[150px] truncate">
                        {displayName}
                    </span>
                    <span className="text-[10px] font-bold text-[#d9a01e] uppercase tracking-wider leading-tight">
                        {vaiTro === 'Admin' ? 'Quản lý' : vaiTro === 'ThuNgan' ? 'Thu ngân' : vaiTro === 'PhucVu' ? 'Phục vụ' : vaiTro === 'Bep' ? 'Bếp' : 'Nhân viên'}
                    </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-[#d9a01e] to-[#f8b500] p-[2px] shadow-sm relative group">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[#d9a01e] text-xs">
                        {getInitials(displayName)}
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all ml-1 shadow-sm border border-red-100"
                    title="Đăng xuất"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}

export default function PosLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard allowedRoles={['Admin', 'PhucVu', 'ThuNgan']}>
          <SocketProvider>
            <PosProvider>
                <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-800">
                    <PosHeader />

                    {/* Main Content */}
                    <main className="flex-1 overflow-hidden flex">
                        {children}
                    </main>
                </div>
                <style jsx global>{`
                    .pos-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .pos-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .pos-scrollbar::-webkit-scrollbar-thumb {
                        background: #d9a01e40;
                        border-radius: 10px;
                    }
                    .pos-scrollbar:hover::-webkit-scrollbar-thumb {
                        background: #d9a01e80;
                    }
                `}</style>
            </PosProvider>
          </SocketProvider>
        </AdminGuard>
    );
}
