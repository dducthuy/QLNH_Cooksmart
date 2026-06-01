'use client';

import React, { useState } from 'react';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import KitchenTicket from '@/components/kitchen/KitchenTicket';
import KitchenHistoryPanel from '@/components/kitchen/KitchenHistoryPanel';
import { Loader2, History } from 'lucide-react';
import { useKitchenTickets } from '@/hooks/kitchen/useKitchenTickets';

export default function KitchenPage() {
    const [showHistory, setShowHistory] = useState(false);
    const { tickets, loading, handleStatusChange } = useKitchenTickets();

    return (
        <div className="flex flex-col h-full w-full">
            <KitchenHeader />

            {/* Nút Lịch Sử ở góc phải header */}
            <div className="absolute top-4 right-4 z-30">
                <button
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95">
                    <History size={14} />
                    Lịch Sử
                </button>
            </div>

            {/* Khu vực tickets */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#111827] p-6 kds-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}>
                {loading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <Loader2 size={48} className="animate-spin text-amber-500" />
                        <p className="font-bold uppercase tracking-widest text-sm text-gray-400">Đang tải đơn...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-40">
                        <p className="font-bold uppercase tracking-widest text-2xl text-gray-400">Không Có Đơn Hàng</p>
                    </div>
                ) : (
                    <div className="grid gap-5"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <KitchenTicket
                                    ticket={ticket}
                                    onStatusChange={(id_chi_tiet, status) =>
                                        handleStatusChange(ticket.id, id_chi_tiet, status)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Panel Lịch Sử */}
            <KitchenHistoryPanel
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            />
        </div>
    );
}
