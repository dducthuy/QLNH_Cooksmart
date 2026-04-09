'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    CalendarCheck,
    Loader2,
    X,
    Eye,
    TrendingUp,
    Clock,
    CreditCard,
    Check,
} from 'lucide-react';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon, TrangThaiHoaDon } from '@/types/hoaDon';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminFilterTabs,
    AdminTableCard,
    AdminModal,
} from '@/components/admin/ui';

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
const STATUS_CONFIG: Record<TrangThaiHoaDon, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    ChoXuLy: {
        label: 'Chờ Xử Lý',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: <Clock size={13} />,
    },
    DangPhucVu: {
        label: 'Đang Phục Vụ',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: <TrendingUp size={13} />,
    },
    DaThanhToan: {
        label: 'Đã Thanh Toán',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: <Check size={13} />,
    },
    DaHuy: {
        label: 'Đã Hủy',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <X size={13} />,
    },
};

// ─────────────────────────────────────────────
//  Formatter helper
// ─────────────────────────────────────────────
const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

// ─────────────────────────────────────────────
//  Order Details Modal
// ─────────────────────────────────────────────
function OrderDetailsModal({
    orderId,
    onClose,
    onStatusUpdate
}: {
    orderId: string;
    onClose: () => void;
    onStatusUpdate: () => void;
}) {
    const [order, setOrder] = useState<HoaDon | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await hoaDonService.getById(orderId);
                setOrder(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [orderId]);

    const handleUpdateStatus = async (newStatus: TrangThaiHoaDon) => {
        try {
            setIsUpdating(true);
            await hoaDonService.updateStatus(orderId, { trang_thai_hd: newStatus });
            const data = await hoaDonService.getById(orderId);
            setOrder(data);
            onStatusUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 flex flex-col h-full max-h-[85vh]">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 shrink-0">
                <div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">Chi Tiết Đơn Hàng</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-mono">ID: {orderId}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 size={30} className="animate-spin text-[#d9a01e]" />
                    </div>
                ) : order ? (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Trạng thái</p>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_CONFIG[order.trang_thai_hd].color} ${STATUS_CONFIG[order.trang_thai_hd].bg} ${STATUS_CONFIG[order.trang_thai_hd].border}`}>
                                    {STATUS_CONFIG[order.trang_thai_hd].icon} {STATUS_CONFIG[order.trang_thai_hd].label}
                                </span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Bàn</p>
                                <p className="text-sm font-black text-gray-800">{order.BanAn?.so_ban || 'Mang về'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Nhân Viên</p>
                                <p className="text-sm font-bold text-gray-700">{order.NguoiDung?.ho_ten || 'Khách đặt qua QR'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Thanh Toán</p>
                                <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><CreditCard size={14}/> {order.phuong_thuc_tt === "TienMat" ? "Tiền mặt" : "Chuyển khoản"}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black uppercase text-gray-800 mb-3 tracking-widest pl-2 border-l-4 border-[#d9a01e]">Danh sách món ({order.ChiTietHoaDons?.length || 0})</h3>
                            <div className="space-y-3">
                                {order.ChiTietHoaDons?.map((item: any, idx: number) => {
                                    const productName = item.MonAn?.ten_mon || item.Combo?.ten_combo || 'Món ăn không việt';
                                    const productPrice = Number(item.MonAn?.gia_tien || item.Combo?.gia_tien || 0);
                                    const image = item.MonAn?.hinh_anh || item.Combo?.hinh_anh;

                                    return (
                                        <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {image ? (
                                                    <img src={image} alt={productName} className="w-12 h-12 object-cover rounded-xl border border-gray-200" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 border border-gray-200">No img</div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{productName}</p>
                                                    <p className="text-xs text-gray-500">{formatVND(productPrice)} x <span className="font-bold text-gray-800">{item.so_luong}</span></p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-[#d9a01e] text-sm">{formatVND(productPrice * Number(item.so_luong))}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">{item.trang_thai_mon}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 p-5 bg-[#f8f9fa] rounded-3xl border border-gray-200">
                             <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                <span>Giảm giá {order.KhuyenMai ? `(${order.KhuyenMai.ten_km})` : ''}</span>
                                <span>-</span>
                             </div>
                             <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                <span className="font-black uppercase tracking-widest text-[#d9a01e] text-lg">Tổng tiền</span>
                                <span className="font-black text-[#d9a01e] text-2xl">{formatVND(Number(order.tong_tien))}</span>
                             </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500 font-bold">Không tải được thông tin.</div>
                )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 shrink-0 mt-2">
                {order && order.trang_thai_hd === 'ChoXuLy' && (
                    <button onClick={() => handleUpdateStatus('DangPhucVu')} disabled={isUpdating} className="flex-1 py-3 rounded-xl font-black bg-blue-500 hover:bg-blue-600 text-white uppercase text-xs tracking-widest transition-all">Nhận Phục Vụ</button>
                )}
                {order && (order.trang_thai_hd === 'ChoXuLy' || order.trang_thai_hd === 'DangPhucVu') && (
                    <button onClick={() => handleUpdateStatus('DaThanhToan')} disabled={isUpdating} className="flex-1 py-3 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white uppercase text-xs tracking-widest transition-all">Xác Nhận Thanh Toán</button>
                )}
                {order && (order.trang_thai_hd === 'ChoXuLy' || order.trang_thai_hd === 'DangPhucVu') && (
                    <button onClick={() => handleUpdateStatus('DaHuy')} disabled={isUpdating} className="flex-1 py-3 rounded-xl font-bold bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 uppercase text-xs tracking-widest transition-all">Hủy Đơn</button>
                )}
                {order && (order.trang_thai_hd === 'DaThanhToan' || order.trang_thai_hd === 'DaHuy') && (
                    <button onClick={onClose} className="w-full py-3 rounded-xl font-black bg-gray-100 hover:bg-gray-200 text-gray-600 uppercase text-xs tracking-widest transition-all">Đóng Chi Tiết</button>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
export default function OrderManagementPage() {
    const [orders, setOrders] = useState<HoaDon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const { showToast, toastNode } = useAdminToast();

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await hoaDonService.getAll();
            setOrders(data);
        } catch {
            showToast('Không thể tải danh sách đơn hàng!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Filter ──
    const filtered = orders.filter((o) => {
        const matchSearch =
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.BanAn?.so_ban || 'Mang về').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.trang_thai_hd === filterStatus;
        return matchSearch && matchStatus;
    });

    // ── Counts ──
    const counts = {
        total: orders.length,
        choxuly: orders.filter((o) => o.trang_thai_hd === 'ChoXuLy').length,
        dangphucvu: orders.filter((o) => o.trang_thai_hd === 'DangPhucVu').length,
        dathanhtoan: orders.filter((o) => o.trang_thai_hd === 'DaThanhToan').length,
        huy: orders.filter((o) => o.trang_thai_hd === 'DaHuy').length,
    };

    // ── Stat items ──
    const statItems = [
        { label: 'Tổng Đơn', value: counts.total, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Chờ Xử Lý', value: counts.choxuly, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
        { label: 'Đang Phục Vụ', value: counts.dangphucvu, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Đã Thanh Toán', value: counts.dathanhtoan, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Đã Hủy', value: counts.huy, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
    ];

    // ── Filter tabs ──
    const filterTabs = [
        { value: 'all', label: 'Tất cả' },
        { value: 'ChoXuLy', label: STATUS_CONFIG['ChoXuLy'].label },
        { value: 'DangPhucVu', label: STATUS_CONFIG['DangPhucVu'].label },
        { value: 'DaThanhToan', label: STATUS_CONFIG['DaThanhToan'].label },
        { value: 'DaHuy', label: STATUS_CONFIG['DaHuy'].label },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<CalendarCheck size={22} className="text-white" />}
                title="Quản Lý Đơn Hàng"
                subtitle={`${counts.total} đơn hàng • ${counts.choxuly} chờ xử lý`}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm mã đơn, tên bàn..."
                onRefresh={fetchOrders}
                isLoading={isLoading}
            />

            <AdminStatCards items={statItems} cols={5} />

            <AdminFilterTabs
                tabs={filterTabs}
                active={filterStatus}
                onChange={setFilterStatus}
            />

            <AdminTableCard
                icon={<CalendarCheck size={16} />}
                title="Danh Sách Đơn Hàng"
                count={filtered.length}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">
                            <th className="px-6 py-4">Bàn / ID Đơn</th>
                            <th className="px-6 py-4">Thời Gian Tạo</th>
                            <th className="px-6 py-4">Nhân Viên</th>
                            <th className="px-6 py-4">Trạng Thái</th>
                            <th className="px-6 py-4 text-right">Tổng Tiền</th>
                            <th className="px-6 py-4 text-center">Thao Tác</th>
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
                                        <CalendarCheck size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không có đơn hàng nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((order) => {
                            const statusCfg = STATUS_CONFIG[order.trang_thai_hd];
                            return (
                                <tr key={order.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 group-hover:text-[#d9a01e] transition-colors">
                                                {order.BanAn?.so_ban || 'Mang Về'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">#{order.id.split('-')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-gray-500">
                                            {formatDate(order.thoi_gian_tao)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                                            {order.NguoiDung?.ho_ten || 'Khách đặt qua QR'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border} uppercase tracking-widest`}>
                                            {statusCfg.icon} <span>{statusCfg.label}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-[#d9a01e]">
                                                {formatVND(Number(order.tong_tien))}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                {order.phuong_thuc_tt === 'TienMat' ? 'Tiền mặt' : 'Chuyển khoản'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedOrderId(order.id)}
                                            className="p-2.5 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all inline-flex"
                                            title="Xem Chi Tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </AdminTableCard>

            {selectedOrderId && (
                <AdminModal onClose={() => setSelectedOrderId(null)} maxWidth="max-w-2xl">
                    <OrderDetailsModal
                        orderId={selectedOrderId}
                        onClose={() => setSelectedOrderId(null)}
                        onStatusUpdate={fetchOrders}
                    />
                </AdminModal>
            )}
        </div>
    );
}
