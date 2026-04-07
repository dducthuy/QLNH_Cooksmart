'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: number;      // % thay đổi so với kỳ trước
    color?: string;       // Tailwind gradient, e.g. 'from-amber-500 to-amber-700'
}

export default function StatCard({ title, value, icon, change, color = 'from-[#d9a01e] to-[#c89117]' }: StatCardProps) {
    const isPositive = (change ?? 0) >= 0;

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${color} rounded-2xl shadow-md`}>
                    <span className="text-white">{icon}</span>
                </div>
                {change !== undefined && (
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(change)}%
                    </span>
                )}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-gray-800">{value}</p>
        </div>
    );
}
