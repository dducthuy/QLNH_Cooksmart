'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Edit2, Trash2, Loader2, Plus, X, Search, CheckCircle2, Eye } from 'lucide-react';
import { comboService } from '@/services/combo.service';
import { dishService } from '@/services/dish.service';
import { Combo } from '@/types/combo';
import { MonAn } from '@/types/monAn';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';
import { uploadService } from '@/services/upload.service';
import { useSocket } from '@/context/SocketContext';

// ─── Main Management Page ───────────────────────────────────────────────────
export default function ComboManagementPage() {
    const [combos, setCombos] = useState<Combo[]>([]);
    const [dishes, setDishes] = useState<MonAn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
    const [viewingCombo, setViewingCombo] = useState<Combo | null>(null);
    const [deletingCombo, setDeletingCombo] = useState<Combo | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { showToast, toastNode } = useAdminToast();
    const { socket } = useSocket();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [combosData, dishesData] = await Promise.all([
                comboService.getAll(),
                dishService.getAll(),
            ]);
            setCombos(combosData);
            setDishes(dishesData);
        } catch {
            showToast('Không thể tải dữ liệu!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = () => { setEditingCombo(null); setIsFormOpen(true); };
    const handleEdit = (combo: Combo) => { setEditingCombo(combo); setIsFormOpen(true); };

    const handleConfirmDelete = async () => {
        if (!deletingCombo) return;
        try {
            setIsDeleting(true);
            await comboService.delete(deletingCombo.id);
            showToast(`Đã xóa "${deletingCombo.ten_combo}" thành công!`);
            if (socket) socket.emit('cap_nhat_menu');
            setDeletingCombo(null);
            fetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = combos.filter((c) =>
        c.ten_combo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statItems = [
        { label: 'Tổng Combo', value: combos.length, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Đang Bán', value: combos.filter(c => c.trang_thai).length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Dừng Bán', value: combos.filter(c => !c.trang_thai).length, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<Layers size={22} className="text-white" />}
                title="Quản Lý Combo"
                subtitle={`${combos.length} gói combo • ${combos.filter(c => c.trang_thai).length} đang bán`}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm kiếm combo..."
                onRefresh={fetchData}
                isLoading={isLoading}
                onAdd={handleAdd}
                addLabel="Thêm Combo"
            />

            <AdminStatCards items={statItems} cols={3} />

            <AdminTableCard
                icon={<Layers size={16} />}
                title="Danh Sách Combo"
                count={filtered.length}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                            <th className="px-6 py-4 w-12 text-center">STT</th>
                            <th className="px-6 py-4">Combo</th>
                            <th className="px-6 py-4">Giá Tiền</th>
                            <th className="px-6 py-4">Trạng Thái</th>
                            <th className="px-6 py-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Layers size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy combo</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((combo, index) => (
                            <tr key={combo.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-center font-bold text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                            {combo.hinh_anh_combo
                                                ? <img src={combo.hinh_anh_combo} alt={combo.ten_combo} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-black">NA</div>
                                            }
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">{combo.ten_combo}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">#{combo.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black text-[#d9a01e] text-sm">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.gia_tien)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${combo.trang_thai ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-500 bg-red-50 border-red-200'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${combo.trang_thai ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                                        {combo.trang_thai ? 'Đang bán' : 'Dừng bán'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button onClick={() => setViewingCombo(combo)}
                                            className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl border border-gray-200 hover:border-blue-200 transition-all"
                                            title="Xem chi tiết">
                                            <Eye size={14} />
                                        </button>
                                        <button onClick={() => handleEdit(combo)}
                                            className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all"
                                            title="Chỉnh sửa">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => setDeletingCombo(combo)}
                                            className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                                            title="Xóa">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminTableCard>

            {isFormOpen && (
                <AdminModal onClose={() => setIsFormOpen(false)} maxWidth="max-w-3xl">
                    <ComboForm
                        combo={editingCombo}
                        dishes={dishes}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={() => { 
                            setIsFormOpen(false); 
                            fetchData(); 
                            if (socket) socket.emit('cap_nhat_menu');
                        }}
                        showToast={showToast}
                    />
                </AdminModal>
            )}

            {viewingCombo && (
                <AdminModal onClose={() => setViewingCombo(null)} maxWidth="max-w-xl">
                    <div className="bg-white p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            <h2 className="text-xl font-black uppercase">Chi Tiết Combo</h2>
                            <button onClick={() => setViewingCombo(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="flex gap-6 mb-6">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                {viewingCombo.hinh_anh_combo
                                    ? <img src={viewingCombo.hinh_anh_combo} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">NA</div>
                                }
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-gray-800">{viewingCombo.ten_combo}</h3>
                                <p className="text-2xl font-black text-[#d9a01e]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(viewingCombo.gia_tien)}</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${viewingCombo.trang_thai ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-500 bg-red-50 border-red-200'}`}>
                                    {viewingCombo.trang_thai ? 'Đang bán' : 'Dừng bán'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Thành phần món ăn:</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {viewingCombo.ChiTietCombos?.map((ct: any) => (
                                    <div key={ct.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center font-bold text-gray-400 text-xs">
                                                {ct.so_luong}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{ct.MonAn?.ten_mon}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ct.MonAn?.gia_tien || 0)}/món</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t">
                            <button onClick={() => setViewingCombo(null)} className="w-full py-3 rounded-xl bg-gray-100 font-bold text-gray-500 uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">Đóng</button>
                        </div>
                    </div>
                </AdminModal>
            )}

            {deletingCombo && (
                <AdminModal onClose={() => setDeletingCombo(null)} maxWidth="max-w-sm">
                    <AdminDeleteConfirm
                        itemName={deletingCombo.ten_combo}
                        itemType="combo"
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setDeletingCombo(null)}
                        isDeleting={isDeleting}
                    />
                </AdminModal>
            )}
        </div>
    );
}

// ─── Combo Form Component ───────────────────────────────────────────────────
function ComboForm({ combo, dishes, onClose, onSuccess, showToast }: any) {
    const [formData, setFormData] = useState<any>(combo ? {
        ...combo,
        chi_tiet_combo: combo.ChiTietCombos?.map((ct: any) => ({ id_mon_an: ct.id_mon_an, so_luong: ct.so_luong })) || []
    } : {
        ten_combo: '',
        gia_tien: undefined,
        hinh_anh_combo: '',
        mo_ta: '',
        trang_thai: true,
        chi_tiet_combo: []
    });

    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dishSearch, setDishSearch] = useState('');

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const res = await uploadService.uploadImage(file);
            setFormData({ ...formData, hinh_anh_combo: res.data.url });
        } catch { showToast('Tải ảnh thất bại!', 'error'); } finally { setIsUploading(false); }
    };

    const addDish = (dish: MonAn) => {
        if (formData.chi_tiet_combo.some((d: any) => d.id_mon_an === dish.id)) return;
        setFormData({
            ...formData,
            chi_tiet_combo: [...formData.chi_tiet_combo, { id_mon_an: dish.id, so_luong: 1, ten_mon: dish.ten_mon }]
        });
    };

    const removeDish = (id_mon_an: string) => {
        setFormData({
            ...formData,
            chi_tiet_combo: formData.chi_tiet_combo.filter((d: any) => d.id_mon_an !== id_mon_an)
        });
    };

    const updateDishQty = (id_mon_an: string, delta: number) => {
        setFormData({
            ...formData,
            chi_tiet_combo: formData.chi_tiet_combo.map((d: any) =>
                d.id_mon_an === id_mon_an ? { ...d, so_luong: Math.max(1, d.so_luong + delta) } : d
            )
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.chi_tiet_combo.length === 0) return showToast('Vui lòng chọn ít nhất một món!', 'error');
        try {
            setIsSubmitting(true);

            // Làm sạch dữ liệu trước khi gửi lên server
            const payload = {
                ten_combo: formData.ten_combo,
                gia_tien: formData.gia_tien,
                hinh_anh_combo: formData.hinh_anh_combo,
                mo_ta: formData.mo_ta,
                trang_thai: formData.trang_thai,
                chi_tiet_combo: formData.chi_tiet_combo.map((ct: any) => ({
                    id_mon_an: ct.id_mon_an,
                    so_luong: ct.so_luong
                }))
            };

            if (combo) await comboService.update(combo.id, payload);
            else await comboService.create(payload);

            showToast('Lưu combo thành công!');
            onSuccess();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally { setIsSubmitting(false); }
    };

    const filteredDishes = dishes.filter((d: MonAn) =>
        d.ten_mon.toLowerCase().includes(dishSearch.toLowerCase()) &&
        !formData.chi_tiet_combo.some((ct: any) => ct.id_mon_an === d.id)
    );

    const inputBase = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e] focus:ring-2 focus:ring-[#d9a01e]/10 transition-all placeholder:text-gray-400";

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider">
                        {combo ? 'Chỉnh Sửa Combo' : 'Thêm Combo Mới'}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Điền đầy đủ thông tin bên dưới</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <X size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 pl-0.5">Tên Combo</label>
                        <input
                            required
                            className={inputBase}
                            value={formData.ten_combo}
                            onChange={e => setFormData({ ...formData, ten_combo: e.target.value })}
                            placeholder="Ví dụ: Combo Gia Đình"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 pl-0.5">Giá Combo (VNĐ)</label>
                        <input
                            required
                            type="number"
                            className={inputBase}
                            value={formData.gia_tien ?? ''}
                            onChange={e => setFormData({ ...formData, gia_tien: e.target.value === '' ? undefined : Number(e.target.value) })}
                            placeholder="Nhập giá tiền..."
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 pl-0.5">Hình Ảnh</label>
                        <div className="h-32 bg-gray-50 border-2 border-dashed rounded-2xl flex items-center justify-center relative overflow-hidden group">
                            {formData.hinh_anh_combo ? (
                                <img src={formData.hinh_anh_combo} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <Loader2 size={24} className={isUploading ? 'animate-spin' : 'hidden'} />
                                    <span className="text-xs font-bold text-gray-400">{isUploading ? 'Đang tải...' : 'Bấm để tải ảnh'}</span>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2.5 py-2.5 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.trang_thai ? 'bg-[#d9a01e] border-[#d9a01e]' : 'bg-white border-gray-300 group-hover:border-[#d9a01e]/50'}`}>
                            {formData.trang_thai && <CheckCircle2 size={13} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={formData.trang_thai} onChange={e => setFormData({ ...formData, trang_thai: e.target.checked })} />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                            Đang hoạt động / Sẵn sàng phục vụ
                        </span>
                    </label>
                </div>

                {/* Right: Dishes Selection */}
                <div className="flex flex-col h-full border-l pl-6 border-gray-100">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 pl-0.5">Thành phần món ăn</label>

                    {/* Selected */}
                    <div className="flex-1 space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-2">
                        {formData.chi_tiet_combo.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 font-bold">Chưa chọn món nào</p>
                            </div>
                        ) : (
                            formData.chi_tiet_combo.map((ct: any) => {
                                const dish = dishes.find((d: any) => d.id === ct.id_mon_an);
                                return (
                                    <div key={ct.id_mon_an} className="flex items-center justify-between p-2 bg-white border rounded-xl shadow-sm">
                                        <span className="text-xs font-bold flex-1 pr-2 line-clamp-1">{dish?.ten_mon || ct.ten_mon}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-gray-100 rounded-lg px-1">
                                                <button type="button" onClick={() => updateDishQty(ct.id_mon_an, -1)} className="p-1 hover:text-amber-600"><Plus size={12} className="rotate-45" /></button>
                                                <span className="text-xs font-black w-6 text-center">{ct.so_luong}</span>
                                                <button type="button" onClick={() => updateDishQty(ct.id_mon_an, 1)} className="p-1 hover:text-amber-600"><Plus size={12} /></button>
                                            </div>
                                            <button type="button" onClick={() => removeDish(ct.id_mon_an)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Selector */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className={inputBase + " pl-9 py-2 text-xs"}
                                placeholder="Tìm món để thêm..."
                                value={dishSearch}
                                onChange={e => setDishSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-[120px] overflow-y-auto border rounded-xl divide-y">
                            {filteredDishes.length === 0 ? (
                                <div className="p-3 text-center text-[10px] text-gray-400 font-bold uppercase italic">Không thấy món phù hợp</div>
                            ) : filteredDishes.map((d: MonAn) => (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => addDish(d)}
                                    className="w-full p-2 text-left hover:bg-amber-50 flex items-center justify-between transition-colors group"
                                >
                                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-amber-600">{d.ten_mon}</span>
                                    <Plus size={12} className="text-gray-400 group-hover:text-amber-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-gray-200 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1 px-6 py-2.5 rounded-xl font-black bg-linear-to-r from-[#d9a01e] to-[#f8b500] text-white hover:shadow-lg hover:shadow-[#d9a01e]/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <>
                            <Plus size={15} />
                            <span>Lưu Combo</span>
                        </>
                    )}
                </button>
            </div>
            <style jsx global>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </form>
    );
}
