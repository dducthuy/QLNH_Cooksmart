'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { History, ChefHat, Clock, Loader2, X, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon } from '@/types/hoaDon';

interface KitchenHistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function KitchenHistoryPanel({ isOpen, onClose }: KitchenHistoryPanelProps) {
    const [history, setHistory] = useState<HoaDon[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await hoaDonService.getKitchenHistory();
            setHistory(data);
        } catch (err) {
            console.error("Lỗi tải lịch sử bếp:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) fetchHistory();
    }, [isOpen, fetchHistory]);

    if (!isOpen) return null;

    const totalTaken = history.reduce((sum, hd) => sum + (hd.ChiTietHoaDons?.length || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[420px] bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-700 animate-in slide-in-from-right duration-300">
                <div className="p-5 border-b border-gray-700 shrink-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                                <History size={16} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-wide">Lịch Sử Bếp</h2>
                                <p className="text-[10px] text-gray-400">Hôm nay • {totalTaken} món đã lấy</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchHistory}
                                className="p-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button onClick={onClose}
                                className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 kds-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                            <p className="text-xs font-bold uppercase tracking-widest">Đang tải lịch sử...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                            <ChefHat size={40} className="text-gray-500" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Chưa có lịch sử hôm nay</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map(hd => (
                                <div key={hd.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                                    <div className="px-4 py-2.5 bg-gray-750 border-b border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ChefHat size={13} className="text-indigo-400" />
                                            <span className="text-sm font-black text-white">
                                                {hd.BanAn?.so_ban ? `Bàn ${hd.BanAn.so_ban}` : 'Mang Về'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock size={11} />
                                            <span className="text-[10px] font-medium">
                                                {new Date(hd.thoi_gian_tao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 space-y-2">
                                        {hd.ChiTietHoaDons?.map(ct => (
                                            <div key={ct.id}
                                                className="flex items-center gap-3 p-2.5 bg-gray-750 rounded-xl border border-gray-700/50">
                                                <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center shrink-0">
                                                    <UtensilsCrossed size={12} className="text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-200 truncate">
                                                        {ct.MonAn?.ten_mon || ct.Combo?.ten_combo || 'Món ăn'}
                                                    </p>
                                                    {ct.ghi_chu && (
                                                        <p className="text-[10px] text-amber-400 italic truncate">⚠ {ct.ghi_chu}</p>
                                                    )}
                                                </div>
                                                <span className="text-xs font-black text-gray-400 shrink-0">x{ct.so_luong}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
