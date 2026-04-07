'use client';

import React from 'react';
import { Cpu } from 'lucide-react';

interface HealthItem {
    label: string;
    value: number;   // 0 – 100
    color: string;   // Tailwind bg color, e.g. 'bg-emerald-500'
}

const MOCK: HealthItem[] = [
    { label: 'CPU', value: 34, color: 'bg-emerald-500' },
    { label: 'RAM', value: 61, color: 'bg-blue-500' },
    { label: 'Disk', value: 47, color: 'bg-amber-500' },
    { label: 'Network', value: 22, color: 'bg-purple-500' },
];

interface SystemHealthProps {
    items?: HealthItem[];
}

export default function SystemHealth({ items = MOCK }: SystemHealthProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <Cpu size={16} className="text-[#d9a01e]" />
                <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Tình Trạng Hệ Thống</span>
            </div>
            <div className="px-6 py-5 space-y-4">
                {items.map((item) => (
                    <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{item.label}</span>
                            <span className="text-xs font-black text-gray-500">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${item.color} rounded-full transition-all duration-700`}
                                style={{ width: `${item.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
