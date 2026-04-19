'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, CalendarCheck, Loader2 } from 'lucide-react';
import TableOrderModal from './TableOrderModal';
import { banAnService } from '@/services/banAn.service';
import { BanAn, TrangThaiBan } from '@/types/banAn';
import { usePos } from '@/context/PosContext';
import { io } from 'socket.io-client';

export default function TableGrid() {
    const { selectedTable, setSelectedTable } = usePos();
    const [filter, setFilter] = useState('all');
    const [modalTable, setModalTable] = useState<any>(null);
    const [tables, setTables] = useState<BanAn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const data = await banAnService.getAll();
                setTables(data);
            } catch (error) {
                console.error("Lỗi tải danh sách bàn:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTables();
    }, []);

    // --- BẮT ĐẦU MỚI THÊM: SOCKET REALTIME CẬP NHẬT TRẠNG THÁI BÀN ---
    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

        socket.on('cap_nhat_trang_thai_ban', (payload: { id_ban: string, trang_thai_ban: TrangThaiBan }) => {
            setTables(prev => prev.map(t => 
                t.id === payload.id_ban 
                    ? { ...t, trang_thai_ban: payload.trang_thai_ban } 
                    : t
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    // --- KẾT THÚC MỚI THÊM ---

    const getStatusText = (status: TrangThaiBan) => {
        switch (status) {
            case 'DangPhucVu': return 'Đang phục vụ';
            case 'DatTruoc': return 'Đặt trước';
            case 'Trong':
            default: return 'Trống';
        }
    };

    const getStatusStyle = (status: TrangThaiBan) => {
        switch (status) {
            case 'DangPhucVu': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'DatTruoc': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Trong':
            default: return 'bg-white text-gray-500 border-gray-100 hover:border-[#d9a01e]/30 hover:text-[#d9a01e]';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Filter */}
            <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-xl shadow-md shadow-[#d9a01e]/20">
                        <LayoutGrid size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Sơ Đồ Bàn</h2>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Khu vực sảnh chung</p>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pos-scrollbar pb-1">
                    {['all', 'Trống', 'Đang phục vụ', 'Đặt trước'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-[#d9a01e] text-white shadow-md shadow-[#d9a01e]/30' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-[#d9a01e]/30 hover:text-[#d9a01e]'}`}
                        >
                            {f === 'all' ? 'Tất cả' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Sơ Đồ Ban */}
            <div className="flex-1 overflow-y-auto p-5 pos-scrollbar text-center items-center justify-center">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
                        <Loader2 className="animate-spin text-[#d9a01e]" size={32} />
                        <span className="font-bold text-xs uppercase tracking-widest">Đang tải bàn...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full h-fit">
                        {tables.filter(t => filter === 'all' || getStatusText(t.trang_thai_ban) === filter).map(table => {
                            const isSelected = selectedTable?.id === table.id;
                            return (
                                <button 
                                    key={table.id} 
                                    onClick={() => setSelectedTable({ id: table.id, so_ban: table.so_ban })}
                                    onDoubleClick={() => setModalTable({...table, status: getStatusText(table.trang_thai_ban)})}
                                    className={`flex flex-col items-center justify-center gap-1.5 aspect-square border rounded-2xl transition-all active:scale-95 group relative ${
                                        isSelected 
                                        ? 'bg-[#d9a01e] text-white border-[#d9a01e] shadow-lg shadow-[#d9a01e]/40 ring-4 ring-[#d9a01e]/20' 
                                        : getStatusStyle(table.trang_thai_ban)
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                                    )}
                                    <span className="text-[22px] font-black z-10">{table.so_ban.replace(/bàn\s/i, '')}</span>
                                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full z-10 ${isSelected ? 'bg-white/30 text-white' : 'bg-white/50 text-inherit'}`}>
                                        {getStatusText(table.trang_thai_ban)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mang về button fixed at bottom */}
            <div className="p-4 border-t border-gray-100 shrink-0">
                 <button className="w-full py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest border border-dashed border-[#d9a01e] text-[#d9a01e] bg-white hover:bg-[#d9a01e]/5 transition-colors flex items-center justify-center gap-2">
                    <CalendarCheck size={16} /> Bán Mang Về
                 </button>
            </div>

            {/* Modal Thông tin bàn */}
            <TableOrderModal 
                isOpen={!!modalTable}
                onClose={() => setModalTable(null)}
                table={modalTable}
            />
        </div>
    );
}
