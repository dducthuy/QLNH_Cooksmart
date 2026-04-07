'use client';

import React from 'react';

export interface FilterTabItem {
    value: string;
    label: string;
    /** Nếu true, dùng style tối thay vì vàng khi active (dùng cho filter trạng thái) */
    dark?: boolean;
}

interface AdminFilterTabsProps {
    tabs: FilterTabItem[];
    active: string;
    onChange: (value: string) => void;
    /** Thêm divider | sau tab index chỉ định */
    dividerAfter?: number;
}

export function AdminFilterTabs({ tabs, active, onChange, dividerAfter }: AdminFilterTabsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {tabs.map((tab, index) => (
                <React.Fragment key={tab.value}>
                    <button
                        onClick={() => onChange(tab.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${active === tab.value
                                ? tab.dark
                                    ? 'bg-gray-700 text-white shadow-md'
                                    : 'bg-[#d9a01e] text-white shadow-md shadow-[#d9a01e]/30'
                                : tab.dark
                                    ? 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#d9a01e]/30 hover:text-[#d9a01e]'
                            }`}
                    >
                        {tab.label}
                    </button>
                    {dividerAfter === index && (
                        <div className="w-px bg-gray-200 mx-1" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
