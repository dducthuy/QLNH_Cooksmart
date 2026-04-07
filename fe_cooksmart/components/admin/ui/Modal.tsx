'use client';

import React from 'react';

interface AdminModalProps {
    /** Callback đóng modal khi click backdrop */
    onClose: () => void;
    /** Max width class Tailwind, mặc định 'max-w-lg' */
    maxWidth?: string;
    children: React.ReactNode;
}

/**
 * Modal overlay backdrop dùng chung.
 * Đặt nội dung modal vào children.
 * Tự động thêm max-h + overflow-y-auto cho nội dung cao.
 */
export function AdminModal({ onClose, maxWidth = 'max-w-lg', children }: AdminModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Content */}
            <div className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
                {children}
            </div>
        </div>
    );
}
