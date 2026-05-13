'use client';

import React, { useState, useEffect } from 'react';
import { Search, UtensilsCrossed, Plus, ListFilter, Loader2 } from 'lucide-react';
import { dishService } from '@/services/dish.service';
import { categoryService } from '@/services/category.service';
import { comboService } from '@/services/combo.service';
import { MonAn } from '@/types/monAn';
import { DanhMuc } from '@/types/danhMuc';
import { Combo } from '@/types/combo';
import { usePos } from '@/context/PosContext';
import { useSocket } from '@/context/SocketContext';

export default function MenuSection() {
    const { addToCart, setViewingCombo } = usePos();
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState('Tất Cả');
    const [searchTerm, setSearchTerm] = useState('');

    const [items, setItems] = useState<MonAn[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [categoriesData, dishesData, combosData] = await Promise.all([
                    categoryService.getAll(),
                    dishService.getAll(),
                    comboService.getAll()
                ]);
                setCategories(categoriesData);
                setItems(dishesData);
                setCombos(combosData);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thực đơn:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        if (socket) {
            socket.on('cap_nhat_menu', fetchData);
            socket.on('cap_nhat_combo', fetchData);
            return () => {
                socket.off('cap_nhat_menu', fetchData);
                socket.off('cap_nhat_combo', fetchData);
            };
        }
    }, [socket]);

    const categoryNames = ['Tất Cả', 'Combo', ...categories.map(c => c.ten_danh_muc)];

    const filteredDishes = items.filter(item =>
        item.con_hang &&
        (activeTab === 'Tất Cả' || (activeTab !== 'Combo' && item.DanhMuc?.ten_danh_muc === activeTab)) &&
        item.ten_mon.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCombos = combos.filter(combo =>
        combo.trang_thai &&
        (activeTab === 'Tất Cả' || activeTab === 'Combo') &&
        combo.ten_combo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Searchbar */}
            <div className="p-5 border-b border-gray-100 shrink-0 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-xl shadow-md shadow-[#d9a01e]/20">
                        <UtensilsCrossed size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Thực Đơn</h2>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">{items.length + combos.length} Món ăn & Combo</p>
                    </div>
                </div>

                <div className="relative group w-full md:w-60">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d9a01e] transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm món nhanh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#d9a01e]/50 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Categories Chips */}
            <div className="border-b border-gray-100 flex items-center overflow-x-auto pos-scrollbar shrink-0 px-5 py-3 gap-2">
                <div className="flex items-center gap-2 mr-2 text-gray-400">
                    <ListFilter size={15} />
                </div>
                {categoryNames.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === cat
                            ? 'bg-gray-800 text-white shadow-md'
                            : 'bg-white text-gray-500 border border-gray-100 hover:border-[#d9a01e]/30 hover:text-[#d9a01e]'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto p-5 pos-scrollbar">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#d9a01e]" size={32} />
                    </div>
                ) : (filteredDishes.length === 0 && filteredCombos.length === 0) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <UtensilsCrossed size={48} className="text-gray-200" />
                        <p className="font-bold uppercase tracking-widest text-xs">Không tìm thấy món ăn</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Render Combos */}
                        {filteredCombos.map(combo => (
                            <div 
                                key={combo.id} 
                                onClick={() => setViewingCombo(combo)}
                                className="bg-white p-3 rounded-3xl border border-gray-100 hover:border-[#d9a01e]/50 transition-all group flex flex-col cursor-pointer hover:shadow-lg active:scale-95 border-b-4 hover:border-b-[#d9a01e] relative"
                            >
                                <div className="aspect-square bg-gray-50 rounded-2xl mb-3 overflow-hidden relative">
                                    <img
                                        src={combo.hinh_anh_combo || `https://ui-avatars.com/api/?name=${encodeURIComponent(combo.ten_combo)}&background=d9a01e&color=fff&size=100`}
                                        alt={combo.ten_combo}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2 bg-[#d9a01e] text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg">Combo</div>
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm leading-tight px-1 line-clamp-2">{combo.ten_combo}</h3>
                                <div className="mt-auto pt-3 px-1 flex items-center justify-between gap-1.5">
                                    <span className="font-black tracking-tight text-[#d9a01e] text-sm">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.gia_tien)}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                addToCart({
                                                    id_combo: combo.id,
                                                    ten_mon: combo.ten_combo,
                                                    gia_tien: combo.gia_tien,
                                                    hinh_anh_mon: combo.hinh_anh_combo,
                                                    so_luong: 1
                                                });
                                            }}
                                            className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#d9a01e] border border-gray-100 group-hover:border-[#d9a01e] group-hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Thêm vào giỏ"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Render Dishes */}
                        {filteredDishes.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => item.con_hang && addToCart({
                                    id_mon_an: item.id,
                                    ten_mon: item.ten_mon,
                                    gia_tien: item.gia_tien,
                                    hinh_anh_mon: item.hinh_anh_mon,
                                    so_luong: 1
                                })}
                                className={`bg-white p-3 rounded-3xl border border-gray-100 hover:border-[#d9a01e]/50 transition-all group flex flex-col active:scale-95 border-b-4 hover:border-b-[#d9a01e] relative ${!item.con_hang ? 'opacity-70 pointer-events-none' : 'cursor-pointer hover:shadow-lg'}`}
                            >
                                <div className="aspect-square bg-gray-50 rounded-2xl mb-3 overflow-hidden relative">
                                    <img
                                        src={item.hinh_anh_mon || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.ten_mon)}&background=random&color=fff&size=100`}
                                        alt={item.ten_mon}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {!item.con_hang && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">Hết Hàng</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm leading-tight px-1 line-clamp-2">{item.ten_mon}</h3>
                                <div className="mt-auto pt-3 px-1 flex items-center justify-between">
                                    <span className={`font-black tracking-tight ${!item.con_hang ? 'text-gray-400' : 'text-[#d9a01e]'}`}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia_tien)}
                                    </span>
                                    {item.con_hang && (
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#d9a01e] border border-gray-100 group-hover:border-[#d9a01e] group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                                            <Plus size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
