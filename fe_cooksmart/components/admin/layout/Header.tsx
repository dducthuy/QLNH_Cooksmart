'use client';

import { Menu, Bell, LogOut } from 'lucide-react';
import { removeToken } from '@/lib/token';
import { useAuth } from '@/hooks/useAuth';
import { VaiTro } from '@/types/auth';

interface AdminHeaderProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    title: string;
}

export default function AdminHeader({ isSidebarOpen, setIsSidebarOpen, title }: AdminHeaderProps) {
    const { displayName, vaiTro } = useAuth();

    const getInitials = (name: string) => {
        if (!name || name === 'Người Dùng') return 'A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleLabel = (role: VaiTro | undefined) => {
        switch (role) {
            case 'Admin': return 'Quản Trị Viên';
            case 'ThuNgan': return 'Thu Ngân';
            case 'PhucVu': return 'Nhân Viên Phục Vụ';
            case 'Bep': return 'Nhân Viên Bếp';
            default: return 'Người Dùng';
        }
    };

    const handleLogout = () => {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            removeToken();
            window.location.href = '/login';
        }
    };

    return (
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:text-[#d9a01e] hover:bg-[#d9a01e]/10 transition-all border border-gray-200"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
                <h2 className="text-lg font-bold text-gray-700 truncate">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                <button className="relative p-2.5 text-gray-400 hover:text-[#d9a01e] transition-all group">
                    <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 lg:pl-8 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-black text-gray-800 uppercase tracking-tighter max-w-[180px] truncate">{displayName}</p>
                        <p className="text-[10px] text-[#d9a01e] font-medium tracking-widest uppercase">{getRoleLabel(vaiTro)}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-linear-to-tr from-[#d9a01e] to-[#f8b500] p-[2px] shadow-lg shadow-[#d9a01e]/20">
                        <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center font-black text-[#d9a01e] text-lg">
                            {getInitials(displayName)}
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="ml-2 p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                        title="Đăng xuất"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
