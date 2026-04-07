'use client';

import React from 'react';
import { 
    Tag, 
    Plus, 
    Search,
    Filter,
    MoreVertical,
    Calendar,
    DollarSign,
    Percent
} from 'lucide-react';

export default function PromotionsPage() {
    const promotions = [
        { id: 1, name: 'Khai trương giảm giá 10%', type: 'PhanTram', value: '10%', minOrder: '200,000đ', status: 'Đang chạy', expiry: '20/04/2026' },
        { id: 2, name: 'Giảm 50k cho đơn từ 1 triệu', type: 'SoTien', value: '50,000đ', minOrder: '1,000,000đ', status: 'Đang chạy', expiry: '20/04/2026' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Quản Lý Khuyến Mãi</h1>
                    <p className="text-gray-500">Thiết lập các chương trình giảm giá và combo cho nhà hàng.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#d9a01e] text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg">
                    <Plus size={20} /> Tạo Khuyến Mãi
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Đang hoạt động', value: '08', color: 'text-emerald-400' },
                    { label: 'Sắp hết hạn', value: '02', color: 'text-amber-400' },
                    { label: 'Tổng lượt dùng', value: '1,240', color: 'text-blue-400' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white border border-gray-100 rounded-[30px] shadow-sm hover:shadow-md transition-all">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-4xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter & Table */}
            <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm khuyến mãi..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:border-[#d9a01e] focus:outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 transition-all">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="px-8 py-6">Tên Khuyến Mãi</th>
                                <th className="px-8 py-6">Loại</th>
                                <th className="px-8 py-6">Giá Trị</th>
                                <th className="px-8 py-6">Đơn Tối Thiểu</th>
                                <th className="px-8 py-6">Hạn Dùng</th>
                                <th className="px-8 py-6 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {promotions.map((promo) => (
                                <tr key={promo.id} className="group hover:bg-gray-50 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#d9a01e]/10 text-[#d9a01e] flex items-center justify-center rounded-xl">
                                                <Tag size={20} />
                                            </div>
                                            <span className="font-bold text-gray-800 tracking-tight">{promo.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-medium text-gray-500">
                                        {promo.type === 'PhanTram' ? (
                                            <div className="flex items-center gap-2"><Percent size={14} /> Phần trăm</div>
                                        ) : (
                                            <div className="flex items-center gap-2"><DollarSign size={14} /> Số tiền cố định</div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 font-black text-[#d9a01e]">{promo.value}</td>
                                    <td className="px-8 py-6 font-medium text-gray-600">{promo.minOrder}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Calendar size={14} /> {promo.expiry}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-gray-400 hover:text-gray-700 transition-all">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
