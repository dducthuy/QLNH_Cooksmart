'use client';

import React from 'react';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import KitchenTicket from '@/components/kitchen/KitchenTicket';

const MOCK_TICKETS = [
    {
        id: '1',
        table: 'Bàn 5',
        time: '12:30',
        status: 'urgent' as const,
        items: [
            { id: 'i1', name: 'Phở Đặc Biệt', qty: 2, note: 'Không hành', state: 'DangCho' as const },
            { id: 'i2', name: 'Phở Gà', qty: 1, note: '', state: 'DangNau' as const },
        ]
    },
    {
        id: '2',
        table: 'Bàn 8',
        time: '12:35',
        status: 'normal' as const,
        items: [
            { id: 'i3', name: 'Cơm Tấm Sườn Bì', qty: 1, note: 'Ít mỡ', state: 'DangCho' as const },
            { id: 'i4', name: 'Canh Khổ Qua', qty: 1, note: '', state: 'DangCho' as const },
        ]
    },
    {
        id: '3',
        table: 'Bàn V1',
        time: '12:40',
        status: 'normal' as const,
        items: [
            { id: 'i5', name: 'Lẩu Thái Hải Sản', qty: 1, note: 'Nước dùng cay', state: 'DangCho' as const },
            { id: 'i6', name: 'Mực ống hấp gừng', qty: 1, note: '', state: 'DangCho' as const },
            { id: 'i7', name: 'Rau muống xào tỏi', qty: 2, note: '', state: 'DaXong' as const },
        ]
    },
    {
        id: '4',
        table: 'Mang Về (Zalo)',
        time: '12:42',
        status: 'ready' as const,
        items: [
            { id: 'i8', name: 'Gỏi Cuốn', qty: 5, note: 'Để riêng tương', state: 'DaXong' as const },
        ]
    }
];

export default function KitchenPage() {
    return (
        <div className="flex flex-col h-full w-full">
            <KitchenHeader />
            
            {/* Kanban Grid */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#111827] p-6 kds-scrollbar">
                <div className="flex gap-6 h-full items-start w-max">
                    {MOCK_TICKETS.map(ticket => (
                        <div key={ticket.id} className="w-[340px] shrink-0 h-fit max-h-full">
                            <KitchenTicket ticket={ticket} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
