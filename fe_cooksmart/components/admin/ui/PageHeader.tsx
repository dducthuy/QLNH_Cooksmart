'use client';

import React from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';

interface AdminPageHeaderProps {
    /** Icon hiển thị bên trái tiêu đề (ReactNode) */
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    /** Search */
    searchValue: string;
    onSearchChange: (val: string) => void;
    searchPlaceholder?: string;
    /** Refresh */
    onRefresh: () => void;
    isLoading: boolean;
    /** Add button */
    onAdd?: () => void;
    addLabel?: string;
    /** Thêm các node tuỳ chỉnh vào khu vực phải (optional) */
    extraActions?: React.ReactNode;
}

export function AdminPageHeader({
    icon,
    title,
    subtitle,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Tìm kiếm...',
    onRefresh,
    isLoading,
    onAdd,
    addLabel = 'Thêm',
    extraActions,
}: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            {/* Left – Icon + Title */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-2xl shadow-md shadow-[#d9a01e]/20">
                    {icon}
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-wide">{title}</h1>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>
                </div>
            </div>

            {/* Right – Actions */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative group">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors"
                    />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#d9a01e]/50 transition-all w-56"
                    />
                </div>

                {/* Refresh */}
                <button
                    onClick={onRefresh}
                    title="Làm mới"
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#d9a01e] hover:border-[#d9a01e]/30 transition-all"
                >
                    <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                </button>

                {/* Extra actions slot */}
                {extraActions}

                {/* Add */}
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d9a01e] to-[#f8b500] text-white font-black rounded-xl shadow-md hover:shadow-[#d9a01e]/30 active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                        <Plus size={16} />
                        {addLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
