'use client';

import React from 'react';
import { X, ChefHat } from 'lucide-react';
import { Combo } from '@/types/combo';

interface ComboDetailModalProps {
    combo: Combo;
    onClose: () => void;
}

export default function ComboDetailModal({ combo, onClose }: ComboDetailModalProps) {
    return (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md" onClick={onClose}>
            <div 
                className="bg-white rounded-3xl max-h-[90vh] overflow-hidden w-full sm:max-w-md sm:rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-5 flex items-start justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#d9a01e]/10 rounded-xl">
                            <ChefHat size={18} className="text-[#d9a01e]" />
                        </div>
                        <div>
                            <h2 className="font-black text-gray-800 uppercase tracking-wider">Chi Tiết Combo</h2>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">{combo.ten_combo}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable area */}
                <div className="p-4 sm:p-5 space-y-5 overflow-y-auto pos-scrollbar flex-1">
                    {/* Hình ảnh */}
                    {combo.hinh_anh_combo && (
                        <div className="w-full h-36 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                            <img
                                src={combo.hinh_anh_combo}
                                alt={combo.ten_combo}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Tên & Giá */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-800">{combo.ten_combo}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-[#d9a01e]">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.gia_tien)}
                            </span>
                        </div>
                    </div>

                    {/* Mô tả */}
                    {combo.mo_ta && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-sm text-gray-700">{combo.mo_ta}</p>
                        </div>
                    )}

                    {/* Thành phần */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">
                            Thành phần gồm:
                        </h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 pos-scrollbar">
                            {combo.ChiTietCombos && combo.ChiTietCombos.length > 0 ? (
                                combo.ChiTietCombos.map((chi_tiet: any, idx: number) => (
                                    <div
                                        key={chi_tiet.id || idx}
                                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-amber-200 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center font-black text-amber-600 text-xs">
                                                {chi_tiet.so_luong}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 text-sm">{chi_tiet.MonAn?.ten_mon || 'Món ăn'}</p>
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                        chi_tiet.MonAn?.gia_tien || 0
                                                    )}
                                                    /món
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400">
                                    <p className="text-sm">Không có thông tin chi tiết</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-gray-600 tracking-widest">Trạng thái:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight border ${
                                combo.trang_thai 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                    : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                                {combo.trang_thai ? '✓ Đang bán' : '✕ Dừng bán'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-100 p-4 sm:p-5 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 rounded-xl bg-[#d9a01e] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#c89117] active:scale-95 transition-all shadow-lg shadow-[#d9a01e]/20"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
