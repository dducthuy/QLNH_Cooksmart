'use client';

import AdminGuard from '@/components/admin/layout/Guard';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard allowedRoles={['Admin', 'Bep']}>
           
            <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#111827] text-gray-100">
                <main className="flex-1 overflow-hidden flex">
                    {children}
                </main>
            </div>
            <style jsx global>{`
                .kds-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .kds-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .kds-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .kds-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </AdminGuard>
    );
}
