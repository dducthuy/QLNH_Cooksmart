'use client';

import React, { useState } from 'react';
import { 
    Tag, 
    Calendar,
    DollarSign,
    Percent,
    Edit2,
    Trash2
} from 'lucide-react';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';

export default function PromotionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deletingPromo, setDeletingPromo] = useState<any | null>(null);
    const { showToast, toastNode } = useAdminToast();

    const promotions = [
        { id: 1, name: 'Khai trương giảm giá 10%', type: 'PhanTram', value: '10%', minOrder: '200,000đ', status: 'Đang chạy', expiry: '20/04/2026' },
        { id: 2, name: 'Giảm 50k cho đơn từ 1 triệu', type: 'SoTien', value: '50,000đ', minOrder: '1,000,000đ', status: 'Đang chạy', expiry: '20/04/2026' },
    ];

    const filtered = promotions.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAdd = () => setIsFormOpen(true);

    const statItems = [
        { label: 'Tổng Khuyến Mãi', value: 10, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Đang Hoạt Động', value: 8, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Sắp Hết Hạn', value: 2, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    ];

    const hasModal = isFormOpen || !!deletingPromo;

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<Tag size={22} className="text-white" />}
                title="Quản Lý Khuyến Mãi"
                subtitle="Thiết lập các chương trình giảm giá và combo"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm kiếm khuyến mãi..."
                onAdd={handleAdd}
                addLabel="Tạo Mới"
                isLoading={false}
                onRefresh={() => {}}
            />

            <AdminStatCards items={statItems} cols={3} />

            <AdminTableCard
                icon={<Tag size={16} />}
                title="Danh Sách Khuyến Mãi"
                count={filtered.length}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                            <th className="px-6 py-4 w-12 text-center">STT</th>
                            <th className="px-6 py-4">Tên Khuyến Mãi</th>
                            <th className="px-6 py-4">Loại</th>
                            <th className="px-6 py-4">Giá Trị</th>
                            <th className="px-6 py-4">Đơn Tối Thiểu</th>
                            <th className="px-6 py-4">Hạn Dùng</th>
                            <th className="px-6 py-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Tag size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy khuyến mãi</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((promo, index) => (
                            <tr key={promo.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-center font-bold text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#d9a01e]/10 border border-[#d9a01e]/20 flex items-center justify-center shrink-0">
                                            <Tag size={18} className="text-[#d9a01e]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">{promo.name}</p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{promo.status}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {promo.type === 'PhanTram' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[11px] uppercase tracking-wider">
                                            <Percent size={12} /> Phần trăm
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[11px] uppercase tracking-wider">
                                            <DollarSign size={12} /> Số tiền
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-[#d9a01e]">{promo.value}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-gray-600">{promo.minOrder}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                        <Calendar size={12} className="text-gray-400" /> {promo.expiry}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button 
                                            className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => setDeletingPromo(promo)}
                                            className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                                            title="Xóa"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminTableCard>

            {hasModal && (
                <AdminModal onClose={() => { setIsFormOpen(false); setDeletingPromo(null); }} maxWidth="max-w-2xl">
                    {isFormOpen && (
                        <div className="p-6">
                            <h2 className="text-xl font-black text-gray-800 mb-4">Tạo Khuyến Mãi Mới</h2>
                            <p className="text-gray-500 text-sm">Chức năng đang được phát triển...</p>
                        </div>
                    )}
                    {deletingPromo && (
                        <AdminDeleteConfirm
                            itemName={deletingPromo.name}
                            itemType="khuyến mãi"
                            onConfirm={async () => { showToast('Đã xóa (chưa có api)!'); setDeletingPromo(null); }}
                            onCancel={() => setDeletingPromo(null)}
                            isDeleting={false}
                        />
                    )}
                </AdminModal>
            )}
        </div>
    );
}
