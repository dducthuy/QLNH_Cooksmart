'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckSquare, Loader2, Printer, PackageCheck, ChefHat } from 'lucide-react';
import { HoaDon } from '@/types/hoaDon';
import { TrangThaiMon } from '@/types/hoaDon';
import { hoaDonService } from '@/services/hoaDon.service';
import { comboService } from '@/services/combo.service';
import { Combo } from '@/types/combo';


export default function KitchenTicket({
    ticket,
    onStatusChange
}: {
    ticket: HoaDon;
    onStatusChange: (id_chi_tiet: string, status: TrangThaiMon) => void;
}) {
    const items = ticket.ChiTietHoaDons || [];
    const visibleItems = items.filter(i => i.trang_thai_mon !== 'DaLayDi');

    const pendingItems = visibleItems.filter(i => i.trang_thai_mon === 'DangCho');
    const cookingItems = visibleItems.filter(i => i.trang_thai_mon === 'DangNau');
    const readyItems = visibleItems.filter(i => i.trang_thai_mon === 'DaXong');
    const takenItems = items.filter(i => i.trang_thai_mon === 'DaLayDi');

    const hasActiveItems = pendingItems.length > 0 || cookingItems.length > 0;
    const isUrgent = new Date().getTime() - new Date(ticket.thoi_gian_tao).getTime() > 15 * 60 * 1000;

    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [comboDetails, setComboDetails] = useState<Record<string, Combo>>({});

    useEffect(() => {
        const fetchCombos = async () => {
            const comboIds = Array.from(new Set(
                items.filter(i => i.id_combo && !comboDetails[i.id_combo])
                    .map(i => i.id_combo!) || []
            ));
            for (const id of comboIds) {
                try {
                    const combo = await comboService.getById(id);
                    setComboDetails(prev => ({ ...prev, [id]: combo }));
                } catch (e) { /* ignore */ }
            }
        };
        fetchCombos();
    }, [items]);

    const getBorderColor = () => {
        if (readyItems.length > 0 && !hasActiveItems) return 'border-emerald-500 shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)]';
        if (readyItems.length > 0) return 'border-emerald-500/50';
        if (isUrgent) return 'border-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]';
        return 'border-gray-700 hover:border-amber-500/40';
    };

    const getHeaderColor = () => {
        if (readyItems.length > 0 && !hasActiveItems) return 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white';
        if (readyItems.length > 0) return 'bg-gradient-to-r from-emerald-800 to-gray-800 text-white';
        if (isUrgent) return 'bg-red-600 text-white';
        return 'bg-gray-800 text-amber-400 border-b border-gray-700';
    };

    const formatTime = (timeStr: string) => {
        const d = new Date(timeStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Bấm vào món để chuyển trạng thái
    const handleItemClick = async (item: any) => {
        if (item.trang_thai_mon === 'DaXong' || item.trang_thai_mon === 'DaLayDi') return;
        const nextStatus: TrangThaiMon = item.trang_thai_mon === 'DangCho' ? 'DangNau' : 'DaXong';
        try {
            setIsUpdating(item.id);
            await hoaDonService.updateItemStatus(item.id, nextStatus);
            onStatusChange(item.id, nextStatus);
        } catch (error) {
            alert("Lỗi cập nhật trạng thái món!");
        } finally {
            setIsUpdating(null);
        }
    };



    // Nấu xong tất cả (DangCho/DangNau → DaXong)
    const handleNauXongTatCa = async () => {
        const needUpdate = [...pendingItems, ...cookingItems];
        if (needUpdate.length === 0) return;
        try {
            setIsUpdating('all');
            await Promise.all(needUpdate.map(item => hoaDonService.updateItemStatus(item.id, 'DaXong')));
            needUpdate.forEach(item => onStatusChange(item.id, 'DaXong'));
        } catch (error) {
            alert("Lỗi khi đổi trạng thái!");
        } finally {
            setIsUpdating(null);
        }
    };

    // In phiếu bếp
    const handlePrint = () => {
        setIsPrinting(true);
        const soBan = ticket.BanAn?.so_ban || 'Mang Về';
        const thoiGian = new Date(ticket.thoi_gian_tao).toLocaleString('vi-VN');
        const monCanLam = items.filter(i => i.trang_thai_mon !== 'DaLayDi');

        if (monCanLam.length === 0) {
            alert('Không có món nào cần in!');
            setIsPrinting(false);
            return;
        }

        const rows = monCanLam.map(item => {
            const tenMon = item.MonAn?.ten_mon || item.Combo?.ten_combo || 'Món ăn';
            const trangThai = item.trang_thai_mon === 'DaXong' ? ' ✓ SẴN SÀNG' : '';
            const combo = item.id_combo && comboDetails[item.id_combo]
                ? comboDetails[item.id_combo].ChiTietCombos?.map(
                    ct => `<div style="padding-left:14px;font-size:11px;color:#777;">• ${ct.MonAn?.ten_mon} x${ct.so_luong}</div>`
                ).join('') : '';
            return `<div style="padding:8px 0;border-bottom:1px dashed #ccc;">
                <div style="display:flex;justify-content:space-between;">
                    <span style="font-weight:900;font-size:14px;">${tenMon}${trangThai}</span>
                    <span style="font-weight:900;font-size:18px;color:#c33;min-width:36px;text-align:right;">x${item.so_luong}</span>
                </div>${combo}
                ${item.ghi_chu ? `<div style="font-size:11px;color:#d97706;font-style:italic;">⚠ ${item.ghi_chu}</div>` : ''}
            </div>`;
        }).join('');

        const win = window.open('', '_blank', 'width=380,height=550');
        if (!win) { alert('Cho phép popup để in!'); setIsPrinting(false); return; }
        win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Phiếu Bếp</title>
        <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;padding:12px;}
        .h{text-align:center;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:12px;}
        .ban{font-size:32px;font-weight:900;}.time{font-size:11px;color:#777;}.sec{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:10px 0 6px;border-top:1px solid #eee;padding-top:8px;}
        .ft{margin-top:12px;border-top:2px dashed #000;padding-top:10px;text-align:center;font-size:11px;color:#666;}
        @media print{body{padding:4px;}}</style></head>
        <body><div class="h"><div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;">⭐ PHIẾU BẾP ⭐</div>
        <div class="ban">🍽 BÀN ${soBan}</div><div class="time">${thoiGian}</div></div>
        <div class="sec">📝 Các món (${monCanLam.length})</div>${rows}
        <div class="ft">Thực hiện đúng thứ tự gọi món</div>
        <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);}<\/script>
        </body></html>`);
        win.document.close();
        setTimeout(() => setIsPrinting(false), 1000);
    };

    const renderCombo = (item: any, borderClass: string, textClass: string) => {
        if (!item.id_combo || !comboDetails[item.id_combo]) return null;
        return (
            <div className={`flex flex-col gap-0.5 mt-1 border-l-2 ${borderClass} pl-2`}>
                {comboDetails[item.id_combo].ChiTietCombos?.map((ct: any, idx: number) => (
                    <p key={idx} className={`text-[10px] ${textClass} font-medium`}>
                        • {ct.MonAn?.ten_mon} <span className="opacity-60 ml-1">x{ct.so_luong}</span>
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className={`flex flex-col bg-gray-900 border-2 rounded-2xl overflow-hidden transition-all duration-300 ${getBorderColor()}`}>
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between ${getHeaderColor()}`}>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black leading-none">{ticket.BanAn?.so_ban || 'Mang Về'}</span>
                    {readyItems.length > 0 && (
                        <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {readyItems.length} chờ lấy
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint} disabled={isPrinting} title="In phiếu bếp"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all active:scale-95 text-[10px] font-bold uppercase">
                        {isPrinting ? <Loader2 size={11} className="animate-spin" /> : <Printer size={11} />} In
                    </button>
                    <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                        <Clock size={13} />
                        <span className="text-xs font-mono font-bold">{formatTime(ticket.thoi_gian_tao)}</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-2 space-y-3 max-h-[520px] overflow-y-auto kds-scrollbar">

                {/* Chờ chuẩn bị */}
                {pendingItems.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chờ chuẩn bị</span>
                        </div>
                        {pendingItems.map(item => (
                            <button key={item.id} onClick={() => handleItemClick(item)}
                                disabled={isUpdating === item.id || isUpdating === 'all'}
                                className="w-full text-left p-3 rounded-xl border bg-gray-800 border-gray-700 hover:border-gray-500 flex items-start gap-3 transition-colors active:scale-95">
                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm bg-gray-700 border border-gray-600 text-white">
                                    {isUpdating === item.id ? <Loader2 size={13} className="animate-spin" /> : <span><span className="text-xs">x</span>{item.so_luong}</span>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-100">{item.MonAn?.ten_mon || item.Combo?.ten_combo}</p>
                                    {renderCombo(item, 'border-gray-600', 'text-gray-400')}
                                    {item.ghi_chu && <p className="text-[11px] text-amber-400 italic mt-0.5">⚠ {item.ghi_chu}</p>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Đang thực hiện */}
                {cookingItems.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Đang thực hiện</span>
                        </div>
                        {cookingItems.map(item => (
                            <button key={item.id} onClick={() => handleItemClick(item)}
                                disabled={isUpdating === item.id || isUpdating === 'all'}
                                className="w-full text-left p-3 rounded-xl border bg-amber-900/20 border-amber-500/30 hover:border-amber-500/60 flex items-start gap-3 transition-colors active:scale-95">
                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm bg-amber-500 border border-amber-400 text-white shadow-md shadow-amber-500/20">
                                    {isUpdating === item.id ? <Loader2 size={13} className="animate-spin" /> : <span><span className="text-xs">x</span>{item.so_luong}</span>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-amber-50">{item.MonAn?.ten_mon || item.Combo?.ten_combo}</p>
                                    {renderCombo(item, 'border-amber-500/30', 'text-amber-200/60')}
                                    {item.ghi_chu && <p className="text-[11px] text-amber-300 italic mt-0.5">⚠ {item.ghi_chu}</p>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Chờ lấy (DaXong) */}
                {readyItems.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Chờ lấy món</span>
                        </div>
                        {readyItems.map(item => (
                            <div key={item.id}
                                className="p-3 rounded-xl border bg-emerald-900/30 border-emerald-500/40 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm bg-emerald-500 border border-emerald-400 text-white shadow-md shadow-emerald-500/30">
                                    <span><span className="text-xs">x</span>{item.so_luong}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-emerald-100">{item.MonAn?.ten_mon || item.Combo?.ten_combo}</p>
                                    {renderCombo(item, 'border-emerald-600/40', 'text-emerald-300/60')}
                                    {item.ghi_chu && <p className="text-[11px] text-amber-400 italic mt-0.5">⚠ {item.ghi_chu}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Badge đếm món đã lấy đi (đơn trước) */}
                {takenItems.length > 0 && hasActiveItems && (
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-gray-800/50 border border-gray-700/50">
                        <CheckSquare size={11} className="text-gray-500" />
                        <span className="text-[10px] text-gray-500 font-bold">{takenItems.length} món đã lấy trước đó</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-800 bg-gray-900 shrink-0 flex gap-2">
                {/* Nấu xong tất cả (khi còn món đang chờ/nấu) */}
                {hasActiveItems && (
                    <button onClick={handleNauXongTatCa} disabled={isUpdating === 'all'}
                        className="flex-1 py-2.5 text-[11px] flex items-center justify-center gap-2 font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/20 transition-all active:scale-95 disabled:opacity-50">
                        {isUpdating === 'all' ? <Loader2 size={13} className="animate-spin" /> : <ChefHat size={13} />}
                        Nấu Xong Hết
                    </button>
                )}

            </div>
        </div>
    );
}
