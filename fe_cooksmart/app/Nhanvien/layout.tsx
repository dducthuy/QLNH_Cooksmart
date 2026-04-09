'use client';

import AdminGuard from '@/components/admin/layout/Guard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PosLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-800">
                {/* Minimal Header */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Trở về quản trị">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-base font-black text-[#d9a01e] uppercase tracking-widest">
                            CookSmart <span className="text-gray-800 font-bold">POS</span>
                        </h1>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-gray-800">Nhân viên Phục vụ</span>
                        <span className="text-[10px] text-gray-400 font-mono">Ca làm: Sáng</span>
                    </div>
                </header>

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
        </AdminGuard>
    );
}
