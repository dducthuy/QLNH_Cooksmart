'use client';

import AdminGuard from '@/components/admin/layout/Guard';
import AdminSidebar from '@/components/admin/layout/Sidebar';
import AdminHeader from '@/components/admin/layout/Header';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    TrendingUp,
    Settings,
    ChefHat,
    LayoutGrid
} from 'lucide-react';
import { useState } from 'react';
import { removeToken } from '@/lib/token';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { name: 'Tổng Quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Người Dùng', path: '/admin/users', icon: <Users size={20} /> },
        { name: 'Thực Đơn', path: '/admin/menu', icon: <ChefHat size={20} /> },
        { name: 'Bàn Ăn', path: '/admin/tables', icon: <LayoutGrid size={20} /> },
        { name: 'Khuyến Mãi', path: '/admin/promotions', icon: <TrendingUp size={20} /> },
        { name: 'Đơn Hàng', path: '/admin/orders', icon: <CalendarCheck size={20} /> },
        { name: 'Cấu Hình', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    const handleLogout = () => {
        removeToken();
        router.push('/auth/login');
    };

    const currentTitle = navItems.find(i => i.path === pathname)?.name || 'Trang Quản Trị';

    return (
        <AdminGuard>
            <div className="flex h-screen bg-[#f5f6fa] text-gray-800">
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <AdminSidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    handleLogout={handleLogout}
                    navItems={navItems}
                />

                {/* Main Content Area */}
                <div
                    className={`flex flex-col flex-1 transition-all duration-300 min-h-screen ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                        }`}
                >
                    {/* Top Header */}
                    <AdminHeader
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        title={currentTitle}
                    />

                    {/* Standard Padding Container */}
                    <main className="flex-1 p-6 lg:p-10 overflow-x-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="px-10 py-6 border-t border-gray-200 text-center text-gray-400 text-xs tracking-widest uppercase font-medium">
                        © 2024 CookSmart Restaurant Management • V1.0.0
                    </footer>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d9a01e40;
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #d9a01e80;
                }
            `}</style>
        </AdminGuard>
    );
}
