'use client';

import { useState, useCallback } from 'react';
import { CheckCircle, X } from 'lucide-react';

// ── Component ──
interface AdminToastProps {
    msg: string;
    type: 'success' | 'error';
}

export function AdminToast({ msg, type }: AdminToastProps) {
    return (
        <div
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${
                type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
        >
            {type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            {msg}
        </div>
    );
}

// ── Hook tiện lợi ──
export function useAdminToast() {
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const toastNode = toast ? <AdminToast msg={toast.msg} type={toast.type} /> : null;

    return { showToast, toastNode };
}
