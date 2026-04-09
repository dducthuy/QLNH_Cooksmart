'use client';

import React from 'react';
import { Clock, CheckSquare } from 'lucide-react';

interface MockTicket {
    id: string;
    table: string;
    time: string;
    status: 'urgent' | 'normal' | 'ready';
    items: { id: string; name: string; qty: number; note: string; state: 'DangCho' | 'DangNau' | 'DaXong' }[];
}

export default function KitchenTicket({ ticket }: { ticket: MockTicket }) {
    const getBorderColor = () => {
        if (ticket.status === 'urgent') return 'border-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]';
        if (ticket.status === 'ready') return 'border-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]';
        return 'border-gray-700 hover:border-amber-500/50';
    };

    const getHeaderColor = () => {
        if (ticket.status === 'urgent') return 'bg-red-500 text-white';
        if (ticket.status === 'ready') return 'bg-emerald-500 text-white';
        return 'bg-gray-800 text-amber-500 border-b border-gray-700';
    };

    return (
        <div className={`flex flex-col bg-gray-900 border-2 rounded-2xl overflow-hidden transition-all ${getBorderColor()}`}>
            {/* Card Header */}
            <div className={`p-3 flex items-center justify-between ${getHeaderColor()}`}>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black leading-none">{ticket.table}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
                    <Clock size={14} />
                    <span className="text-xs font-mono font-bold">{ticket.time}</span>
                </div>
            </div>
            
            {/* Card Body - Món Ăn */}
            <div className="flex-1 p-2 space-y-2">
                {ticket.items.map(item => (
                    <button 
                        key={item.id} 
                        className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-colors active:scale-95 ${
                            item.state === 'DangCho' ? 'bg-gray-800 border-gray-700 hover:border-gray-500' :
                            item.state === 'DangNau' ? 'bg-amber-900/30 border-amber-500/50' :
                            'bg-emerald-900/30 border-emerald-500/50 opacity-60'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm border ${
                            item.state === 'DangCho' ? 'bg-gray-700 border-gray-600 text-white' :
                            item.state === 'DangNau' ? 'bg-amber-500 border-amber-400 text-white' :
                            'bg-emerald-500 border-emerald-400 text-white'
                        }`}>
                            <span className="text-xs mr-0.5">x</span>{item.qty}
                        </div>
                        <div className="flex-1">
                            <p className={`font-bold text-sm ${item.state === 'DaXong' ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                                {item.name}
                            </p>
                            {item.note && (
                                <p className="text-[11px] text-amber-400 italic mt-0.5 font-medium">Lưu ý: {item.note}</p>
                            )}
                        </div>
                        {item.state === 'DaXong' && (
                             <CheckSquare size={18} className="text-emerald-500 shrink-0 mt-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Card Footer - Thao Tác Nhanh Toàn Hóa Đơn */}
            <div className="p-2 border-t border-gray-800 bg-gray-900 shrink-0 flex gap-2">
                 <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all active:scale-95">
                    Xong Tất Cả
                 </button>
            </div>
        </div>
    );
}
