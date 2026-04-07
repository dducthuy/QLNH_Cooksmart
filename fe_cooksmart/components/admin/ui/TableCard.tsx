'use client';

import React from 'react';

interface AdminTableCardProps {
    /** Icon nhỏ hiện trong header (16px) */
    icon: React.ReactNode;
    title: string;
    count: number;
    countLabel?: string;
    /** Chiều cao tối đa của vùng scroll (px). Mặc định 520 */
    maxHeight?: number;
    children: React.ReactNode;
}

/**
 * Khung trắng bao bảng dữ liệu với:
 * - Header: icon + tiêu đề + số lượng kết quả
 * - Vùng scroll dọc (overflow-y-auto) với chiều cao giới hạn
 */
export function AdminTableCard({
    icon,
    title,
    count,
    countLabel = 'kết quả',
    maxHeight = 520,
    children,
}: AdminTableCardProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-[#d9a01e]">{icon}</span>
                    <span className="text-sm font-black text-gray-700 uppercase tracking-widest">{title}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                    {count} {countLabel}
                </span>
            </div>

            {/* Scrollable content */}
            <div
                className="overflow-x-auto overflow-y-auto"
                style={{ maxHeight }}
            >
                {children}
            </div>
        </div>
    );
}
