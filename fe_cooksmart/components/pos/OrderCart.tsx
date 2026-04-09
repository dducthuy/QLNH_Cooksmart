'use client';

import React from 'react';
import { ShoppingBag, Minus, Plus, Trash2, Send, CreditCard } from 'lucide-react';

const MOCK_CART = [
    { id: '1', name: 'Món ăn Test 1', price: 20000, quantity: 2, note: 'Ít cay' },
    { id: '2', name: 'Món ăn Test 4', price: 45000, quantity: 1, note: '' },
    { id: '3', name: 'Combo Đặc Biệt', price: 150000, quantity: 1, note: '' },
];

export default function OrderCart() {
    const total = MOCK_CART.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-800 rounded-xl shadow-md">
                        <ShoppingBag size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Bàn số 2</h2>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5 font-mono">#T2-9012</p>
                    </div>
                </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 pos-scrollbar">
                {MOCK_CART.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
                        <ShoppingBag size={40} className="text-gray-200" />
                        <span className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Chưa chọn món</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                         {MOCK_CART.map(item => (
                             <div key={item.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2 group">
                                 <div className="flex justify-between items-start">
                                     <h4 className="font-bold text-gray-800 text-sm leading-tight flex-1 pr-2">{item.name}</h4>
                                     <button className="text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-lg border border-gray-100">
                                         <Trash2 size={12}/>
                                     </button>
                                 </div>
                                 <p className="text-[#d9a01e] font-black text-xs">
                                     {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                 </p>
                                 {item.note && (
                                     <p className="text-[10px] text-gray-400 italic font-medium mt-0.5">Ghi chú: {item.note}</p>
                                 )}
                                 
                                 <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-200 border-dashed">
                                     <span className="text-[10px] uppercase font-bold text-gray-400">SL:</span>
                                     <div className="flex items-center gap-3 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                                         <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#d9a01e] transition-colors rounded-lg"><Minus size={12}/></button>
                                         <span className="text-xs font-black w-4 text-center text-gray-800">{item.quantity}</span>
                                         <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#d9a01e] transition-colors rounded-lg"><Plus size={12}/></button>
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
            </div>

            {/* Summary & Actions Fixed Bottom */}
            <div className="p-5 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-3xl">
                {/* Summary */}
                <div className="space-y-3 mb-5 bg-white p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <span>Tạm tính</span>
                        <span className="text-gray-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <span>Giảm giá</span>
                        <span className="text-emerald-500">0 ₫</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 border-dashed">
                        <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Thành Tiền</span>
                        <span className="text-xl font-black text-[#d9a01e]">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                        </span>
                    </div>
                </div>

                {/* Big Action Buttons */}
                <div className="flex gap-2">
                    <button className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <CreditCard size={16} /> Thanh Toán
                    </button>
                    <button className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Send size={16} /> Gửi Bếp
                    </button>
                </div>
            </div>
        </div>
    );
}
