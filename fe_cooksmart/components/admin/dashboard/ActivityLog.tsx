'use client';

import React from 'react';
import { Activity } from 'lucide-react';

interface LogItem {
    id: string | number;
    action: string;
    user: string;
    time: string;
    type?: 'success' | 'warning' | 'info';
}

interface ActivityLogProps {
    items?: LogItem[];
}

const MOCK: LogItem[] = [
    { id: 1, action: 'Thêm món mới: Bún Bò Huế', user: 'admin', time: '5 phút trước', type: 'success' },
    { id: 2, action: 'Xóa bàn số 12', user: 'phucvu01', time: '12 phút trước', type: 'warning' },
    { id: 3, action: 'Cập nhật khuyến mãi', user: 'admin', time: '30 phút trước', type: 'info' },
    { id: 4, action: 'Đăng nhập hệ thống', user: 'bep02', time: '1 giờ trước', type: 'info' },
    { id: 5, action: 'Hoàn thành đơn #0042', user: 'phucvu01', time: '2 giờ trước', type: 'success' },
];

const TYPE_STYLE = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info:    'bg-blue-500',
};

export default function ActivityLog({ items = MOCK }: ActivityLogProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <Activity size={16} className="text-[#d9a01e]" />
                <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Hoạt Động Gần Đây</span>
            </div>
            <div className="divide-y divide-gray-50">
                {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-gray-50/60 transition-colors">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_STYLE[item.type ?? 'info']}`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700 truncate">{item.action}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">@{item.user} · {item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

