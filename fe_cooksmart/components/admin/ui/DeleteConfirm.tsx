'use client';

import { Trash2, Loader2 } from 'lucide-react';

interface AdminDeleteConfirmProps {
    /** Tên đối tượng bị xóa, VD: 'Bàn B01', 'admin01', 'Bún Bò Huế' */
    itemName: string;
    /** Tiền tố trước tên, VD: 'món', 'tài khoản', 'bàn' */
    itemType?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}

/**
 * Modal xác nhận xóa dùng chung cho tất cả trang admin.
 * Dùng bên trong AdminModal.
 */
export function AdminDeleteConfirm({
    itemName,
    itemType = '',
    onConfirm,
    onCancel,
    isDeleting,
}: AdminDeleteConfirmProps) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm mx-auto">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-800">Xác Nhận Xóa</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Xóa {itemType && `${itemType} `}<span className="font-black text-gray-700">"{itemName}"</span>?
                        <br />
                        <span className="text-xs text-red-400">Hành động này không thể hoàn tác.</span>
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-5 py-2.5 rounded-xl font-black bg-red-500 hover:bg-red-600 text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isDeleting
                        ? <Loader2 size={14} className="animate-spin" />
                        : <><Trash2 size={14} /><span>Xóa</span></>
                    }
                </button>
            </div>
        </div>
    );
}
