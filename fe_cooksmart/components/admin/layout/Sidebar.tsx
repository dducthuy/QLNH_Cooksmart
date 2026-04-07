'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Users, 
    CalendarCheck, 
    Settings, 
    LogOut,
    X,
    ChefHat
} from 'lucide-react';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

interface AdminSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    handleLogout: () => void;
    navItems: NavItem[];
}

export default function AdminSidebar({ isSidebarOpen, setIsSidebarOpen, handleLogout, navItems }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside 
            className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 transform bg-white border-r border-gray-200 shadow-lg ${
                isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
            }`}
        >
            <div className="flex flex-col h-full overflow-hidden">
                {/* Logo Area */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                    <span className={`text-xl font-black text-[#d9a01e] tracking-tight uppercase whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>
                        Cook<span className="text-gray-800">Smart</span>
                    </span>
                    {!isSidebarOpen && (
                        <ChefHat className="hidden lg:block mx-auto text-[#d9a01e]" size={28} />
                    )}
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 lg:hidden text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 mt-8 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                href={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                    isActive 
                                        ? 'bg-linear-to-r from-[#d9a01e] to-[#c89117] text-white font-bold shadow-lg shadow-[#d9a01e]/30' 
                                        : 'text-gray-500 hover:bg-[#d9a01e]/10 hover:text-[#d9a01e]'
                                }`}
                            >
                                <div className={`transition-transform duration-300 ${!isActive && 'group-hover:scale-115'}`}>
                                    {item.icon}
                                </div>
                                <span className={`whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-2xl font-bold group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className={`${!isSidebarOpen && 'lg:hidden'}`}>Đăng Xuất</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
