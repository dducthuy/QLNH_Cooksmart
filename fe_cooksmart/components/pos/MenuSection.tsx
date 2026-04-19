'use client';

import React, { useState, useEffect } from 'react';
import { Search, UtensilsCrossed, Plus, ListFilter, Loader2 } from 'lucide-react';
import { dishService } from '@/services/dish.service';
import { categoryService } from '@/services/category.service';
import { MonAn } from '@/types/monAn';
import { DanhMuc } from '@/types/danhMuc';
import { usePos } from '@/context/PosContext';

export default function MenuSection() {
    const { addToCart } = usePos();
    const [activeTab, setActiveTab] = useState('Tất Cả');
    const [searchTerm, setSearchTerm] = useState('');

    const [items, setItems] = useState<MonAn[]>([]);
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [categoriesData, dishesData] = await Promise.all([
                    categoryService.getAll(),
                    dishService.getAll()
                ]);
                setCategories(categoriesData);
                setItems(dishesData);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thực đơn:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const categoryNames = ['Tất Cả', ...categories.map(c => c.ten_danh_muc)];

    const filtered = items.filter(item =>
        (activeTab === 'Tất Cả' || item.DanhMuc?.ten_danh_muc === activeTab) &&
        item.ten_mon.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">{items.length} Món ăn</p>
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
                ) : filtered.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <UtensilsCrossed size={48} className="text-gray-200" />
                        <p className="font-bold uppercase tracking-widest text-xs">Không tìm thấy món ăn</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-3xl border border-gray-100 hover:border-[#d9a01e]/50 hover:shadow-lg transition-all group flex flex-col cursor-pointer active:scale-95 border-b-4 hover:border-b-[#d9a01e]">
                                <div className="aspect-square bg-gray-50 rounded-2xl mb-3 overflow-hidden">
                                    <img
                                        src={item.hinh_anh_mon || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.ten_mon)}&background=random&color=fff&size=100`}
                                        alt={item.ten_mon}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm leading-tight px-1 line-clamp-2">{item.ten_mon}</h3>
                                <div className="mt-auto pt-3 px-1 flex items-center justify-between">
                                    <span className="font-black text-[#d9a01e] tracking-tight">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia_tien)}</span>
                                    <button
                                        onClick={() => addToCart({
                                            id_mon_an: item.id,
                                            ten_mon: item.ten_mon,
                                            gia_tien: item.gia_tien,
                                            hinh_anh_mon: item.hinh_anh_mon,
                                            so_luong: 1
                                        })}
                                        className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#d9a01e] border border-gray-100 group-hover:border-[#d9a01e] group-hover:text-white flex items-center justify-center transition-all bg-white shadow-sm">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
