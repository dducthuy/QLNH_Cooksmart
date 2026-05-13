'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PackageSearch, ArrowDownToLine, ClipboardCheck, Layers } from 'lucide-react';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        { name: 'Nguyên Liệu', path: '/admin/inventory/ingredients', icon: <PackageSearch size={18} /> },
        { name: 'Loại Nguyên Liệu', path: '/admin/inventory/categories', icon: <Layers size={18} /> },
        { name: 'Nhập Kho', path: '/admin/inventory/import', icon: <ArrowDownToLine size={18} /> },
        { name: 'Kiểm Kê Kho', path: '/admin/inventory/audit', icon: <ClipboardCheck size={18} /> },
    ];

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const isActive = pathname.includes(tab.path);
                    return (
                        <button
                            key={tab.path}
                            onClick={() => router.push(tab.path)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                isActive
                                    ? 'bg-[#d9a01e] text-white shadow-md shadow-[#d9a01e]/30'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Main Content of the active tab */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
            </div>
        </div>
    );
}
