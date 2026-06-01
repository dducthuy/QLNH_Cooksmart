'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    ShoppingCart, Plus, Minus, Trash2, CheckCircle,
    Loader2, UtensilsCrossed, Search, ChevronDown, ArrowLeft,
    QrCode, AlertTriangle, Send, X
} from 'lucide-react';
import ComboDetailModal from '@/components/ui/ComboDetailModal';
import { useOrder, CartItem } from '@/hooks/order/useOrder';


const vnd = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ─── Cart Item Row ──────────────────────────────────────────────────────────
function CartItemRow({ item, onUpdate, onRemove }: { item: CartItem; onUpdate: (id: string, d: number) => void; onRemove: (id: string) => void }) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-amber-100/60 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{item.ten_mon}</p>
                <div className="flex items-center gap-2">
                    <p className="text-amber-600 font-black text-sm">{vnd(item.gia_tien)}</p>
                    {item.id_combo && <span className="text-[8px] bg-amber-100 text-[#d9a01e] px-1.5 py-0.5 rounded uppercase font-black">Combo</span>}
                </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-1 py-0.5 shrink-0">
                <button onClick={() => onUpdate(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                    <Minus size={14} />
                </button>
                <span className="w-5 text-center font-black text-gray-800 text-sm">{item.so_luong}</span>
                <button onClick={() => onUpdate(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                    <Plus size={14} />
                </button>
            </div>
            <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
                <Trash2 size={14} />
            </button>
        </div>
    );
}

// ─── Dish Card ──────────────────────────────────────────────────────────────
function DishCard({ mon, qty, onAdd, onRemove, isCombo = false, onViewDetail }: { mon: any; qty: number; onAdd: () => void; onRemove: () => void; isCombo?: boolean, onViewDetail?: () => void }) {
    const imgBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const hinh_anh = isCombo ? mon.hinh_anh_combo : mon.hinh_anh_mon;
    const imgSrc = hinh_anh
        ? (hinh_anh.startsWith('http') ? hinh_anh : `${imgBase}${hinh_anh}`)
        : null;

    return (
        <div
            onClick={() => isCombo && onViewDetail && onViewDetail()}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 ${qty > 0 ? 'border-amber-300 shadow-amber-100' : 'border-gray-100'} ${isCombo ? 'cursor-pointer hover:border-amber-400' : ''}`}
        >
            {/* Image */}
            <div className={`relative h-32 ${isCombo ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
                {imgSrc ? (
                    <img src={imgSrc} alt={mon.ten_mon || mon.ten_combo} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed size={32} className={isCombo ? 'text-blue-200' : 'text-amber-200'} />
                    </div>
                )}
                {isCombo && (
                    <div className="absolute top-2 left-2">
                        <span className="bg-[#d9a01e] text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shadow-sm">Combo</span>
                    </div>
                )}
                {!isCombo && !mon.con_hang && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-black/70 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Hết hàng</span>
                    </div>
                )}
                {qty > 0 && (
                    <div className={`absolute top-2 right-2 w-6 h-6 ${isCombo ? 'bg-blue-500' : 'bg-amber-500'} text-white text-xs font-black rounded-full flex items-center justify-center shadow-md`}>
                        {qty}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{mon.ten_mon || mon.ten_combo}</h3>
                {(mon.mo_ta_ai || mon.mo_ta) && <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">{mon.mo_ta_ai || mon.mo_ta}</p>}
                <div className="flex items-center justify-between gap-2 mt-2">
                    <span className={`font-black text-sm text-amber-600`}>{vnd(mon.gia_tien)}</span>
                    {(isCombo || mon.con_hang) && (
                        qty === 0 ? (
                            <button
                                onClick={(e) => {
                                    if (isCombo) e.stopPropagation();
                                    onAdd();
                                }}
                                className={`w-8 h-8 bg-amber-500 hover:bg-amber-600 shadow-amber-200 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all`}
                            >
                                <Plus size={16} />
                            </button>
                        ) : (
                            <div
                                onClick={(e) => isCombo && e.stopPropagation()}
                                className={`flex items-center gap-1 bg-amber-50 border-amber-200 rounded-xl border px-1 py-0.5`}
                            >
                                <button onClick={onRemove} className={`w-6 h-6 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-100 transition-colors active:scale-90`}>
                                    <Minus size={12} />
                                </button>
                                <span className={`w-4 text-center font-black text-xs text-amber-700`}>{qty}</span>
                                <button onClick={onAdd} className={`w-6 h-6 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-100 transition-colors active:scale-90`}>
                                    <Plus size={12} />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

function OrderPageContent() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('tableId');

    const {
        tableInfo, danhMucList, selectedDanhMuc, setSelectedDanhMuc,
        searchTerm, setSearchTerm, cart, isCartOpen, setIsCartOpen,
        isLoading, isSubmitting, orderSuccess, setOrderSuccess,
        error, setError, activeOrder, viewingCombo, setViewingCombo,
        isPaying, getQty, addToCart, removeFromCart, deleteFromCart,
        totalItems, totalPrice, handleDatMon, handleThanhToanZaloPay,
        filteredDishes, filteredCombos
    } = useOrder(tableId);

    // ─── States ──────────────────────────────────────────────────────────────
    if (!tableId) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center">
                <QrCode size={36} className="text-red-400" />
            </div>
            <h1 className="text-xl font-black text-gray-800">Mã QR Không Hợp Lệ</h1>
            <p className="text-gray-500 text-sm max-w-xs">Vui lòng dùng camera điện thoại quét đúng mã QR được dán trên bàn của bạn.</p>
        </div>
    );

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-amber-500" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Đang tải menu...</p>
        </div>
    );

    if (orderSuccess) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle size={48} className="text-emerald-500" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-gray-800 mb-2">Đặt Món Thành Công!</h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                    Đơn hàng của bàn <span className="font-black text-amber-600">{tableInfo?.so_ban}</span> đã được ghi nhận.
                    Nhân viên sẽ xác nhận và bếp sẽ chuẩn bị cho bạn ngay!
                </p>
            </div>
            <button
                onClick={() => setOrderSuccess(false)}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-black rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition-all"
            >
                <Plus size={18} /> Gọi thêm món
            </button>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Header ── */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
                                <UtensilsCrossed size={18} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-black text-gray-800 text-base leading-none">CookSmart</h1>
                                {tableInfo && (
                                    <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                                        {tableInfo.so_ban} {tableInfo.vi_tri && `· ${tableInfo.vi_tri}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all text-white px-4 py-2 rounded-xl font-black text-sm shadow-md shadow-amber-200"
                        >
                            <ShoppingCart size={17} />
                            <span className="hidden sm:inline">Giỏ hàng</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Error Toast */}
            {error && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2 max-w-xs w-full mx-4">
                    <AlertTriangle size={16} />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
                {/* Search */}
                <div className="relative mb-4">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm món ăn..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
                    {[{ id: 'all', ten_danh_muc: 'Tất cả' }, { id: 'combo', ten_danh_muc: 'Combo' }, ...danhMucList].map(dm => (
                        <button
                            key={dm.id}
                            onClick={() => setSelectedDanhMuc(dm.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${selectedDanhMuc === dm.id
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                                : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600'
                                }`}
                        >
                            {dm.ten_danh_muc}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {(filteredDishes.length === 0 && filteredCombos.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <UtensilsCrossed size={40} className="text-gray-200" />
                        <p className="text-gray-400 font-bold text-sm">Không tìm thấy món nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 pb-32">
                        {/* Combos first */}
                        {filteredCombos.map(combo => (
                            <DishCard
                                key={combo.id}
                                mon={combo}
                                qty={getQty(combo.id)}
                                isCombo={true}
                                onAdd={() => addToCart(combo, true)}
                                onRemove={() => removeFromCart(combo.id)}
                                onViewDetail={() => setViewingCombo(combo)}
                            />
                        ))}
                        {/* Dishes */}
                        {filteredDishes.map(mon => (
                            <DishCard
                                key={mon.id}
                                mon={mon}
                                qty={getQty(mon.id)}
                                onAdd={() => addToCart(mon)}
                                onRemove={() => removeFromCart(mon.id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Sticky Bottom Bar ── */}
            {totalItems > 0 && !isCartOpen && (
                <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#fdf6ec] to-[#fdf6ec]/0">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full max-w-2xl mx-auto flex items-center justify-between bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-white py-4 px-5 rounded-2xl shadow-xl shadow-amber-300/50 font-black"
                    >
                        <span className="bg-amber-600/60 px-2.5 py-1 rounded-lg text-sm">{totalItems} món</span>
                        <span className="text-sm">Xem giỏ hàng</span>
                        <span className="text-sm">{vnd(totalPrice)}</span>
                    </button>
                </div>
            )}

            {/* ── Cart Drawer ── */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                        {/* Drawer handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        </div>

                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="font-black text-gray-800 text-lg">Giỏ Hàng</h2>
                                {tableInfo && <p className="text-xs text-amber-600 font-bold">{tableInfo.so_ban}</p>}
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cart items */}
                        <div className="flex-1 overflow-y-auto px-5 py-2">
                            {/* Món đã gọi (nếu có) */}
                            {activeOrder?.ChiTietHoaDons && activeOrder.ChiTietHoaDons.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#d9a01e]"></div>
                                        Món đã gọi ({activeOrder.ChiTietHoaDons.length})
                                    </h3>
                                    <div className="space-y-0">
                                        {(() => {
                                            const displayMap = new Map<string, any>();
                                            activeOrder.ChiTietHoaDons.forEach((item: any) => {
                                                const key = `${item.id_mon_an || item.id_combo}-${item.trang_thai_mon}-${item.ghi_chu || ""}`;
                                                if (displayMap.has(key)) {
                                                    displayMap.get(key).so_luong += item.so_luong;
                                                } else {
                                                    displayMap.set(key, { ...item });
                                                }
                                            });
                                            const displayItems = Array.from(displayMap.values());

                                            return displayItems.map((item: any, index: number) => (
                                            <div key={`active-${item.id}-${index}`} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 opacity-80">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{item.MonAn?.ten_mon || item.Combo?.ten_combo}</p>
                                                    <p className="text-gray-500 font-bold text-sm">{vnd(item.MonAn?.gia_tien || item.Combo?.gia_tien || 0)} <span className="text-xs font-black ml-1">x{item.so_luong}</span></p>
                                                </div>
                                                <div className="shrink-0">
                                                    {/* Trạng thái món */}
                                                    {item.trang_thai_mon === 'DangCho' && <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-tight">Đang chờ</span>}
                                                    {item.trang_thai_mon === 'DangNau' && <span className="px-2 py-1 rounded-md bg-amber-50 text-[#d9a01e] border border-amber-100 text-[10px] font-black uppercase tracking-tight">Đang nấu</span>}
                                                    {item.trang_thai_mon === 'DaXong' && <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-tight">Đã xong</span>}
                                                </div>
                                            </div>
                                        ));
                                        })()}
                                    </div>
                                </div>
                            )}

                            {cart.length === 0 && (!activeOrder || !activeOrder.ChiTietHoaDons || activeOrder.ChiTietHoaDons.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                                    <ShoppingCart size={36} className="text-gray-200" />
                                    <p className="text-sm text-gray-400 font-bold">Chưa có món nào</p>
                                </div>
                            ) : (
                                <div>
                                    {cart.length > 0 && (
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-3 ml-1 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                            Món mới chọn ({cart.length})
                                        </h3>
                                    )}
                                    {cart.map(item => (
                                        <CartItemRow
                                            key={item.id}
                                            item={item}
                                            onUpdate={(id, d) => d > 0 ? addToCart(item) : removeFromCart(id)}
                                            onRemove={deleteFromCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Total & Order button */}
                        {cart.length > 0 && (
                            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tổng cộng</span>
                                    <span className="text-2xl font-black text-amber-600">{vnd(totalPrice)}</span>
                                </div>
                                <button
                                    onClick={handleDatMon}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 active:scale-[0.98] transition-all text-white font-black rounded-2xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} />}
                                    {isSubmitting ? 'Đang gửi...' : 'Đặt Món Ngay'}
                                </button>
                                <p className="text-center text-[11px] text-gray-400 mt-3">
                                    📋 Đơn hàng sẽ được nhân viên xác nhận trước khi bếp chế biến
                                </p>
                            </div>
                        )}

                        {/* ZaloPay Payment for Active Order */}
                        {cart.length === 0 && activeOrder && activeOrder.ChiTietHoaDons?.length > 0 && (
                            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tổng thanh toán</span>
                                    <span className="text-2xl font-black text-[#d9a01e]">{vnd(Number(activeOrder.tong_tien) - (activeOrder.giam_gia || 0))}</span>
                                </div>
                                <button
                                    onClick={handleThanhToanZaloPay}
                                    disabled={isPaying}
                                    className="w-full py-4 bg-[#0068ff] hover:bg-blue-600 disabled:opacity-60 active:scale-[0.98] transition-all text-white font-black rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                >
                                    {isPaying ? <Loader2 size={20} className="animate-spin" /> : <img src="https://zalopay.vn/images/logo/ZaloPay-logo-bg.svg" alt="ZaloPay" className="w-5 h-5 object-contain invert brightness-0" />}
                                    {isPaying ? 'Đang tạo...' : 'Thanh toán ZaloPay'}
                                </button>
                                <p className="text-center text-[11px] text-gray-400 mt-3">
                                    💳 Bạn sẽ được chuyển hướng tới cổng thanh toán ZaloPay
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Combo Detail Modal */}
            {viewingCombo && (
                <ComboDetailModal
                    combo={viewingCombo}
                    onClose={() => setViewingCombo(null)}
                />
            )}
        </div>
    );
}

export default function OrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-amber-500" />
            </div>
        }>
            <OrderPageContent />
        </Suspense>
    );
}
