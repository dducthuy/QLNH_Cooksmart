import { useState } from 'react';
import { hoaDonService } from '@/services/hoaDon.service';
import { zalopayService } from '@/services/zalopay.service';
import { CartItem } from './types';

export function useOrderActions(
    tableId: string | null,
    cart: CartItem[],
    activeOrder: any,
    clearCart: () => void,
    closeCart: () => void,
    setError: (err: string | null) => void
) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    const handleDatMon = async () => {
        if (!tableId || cart.length === 0) return;
        try {
            setIsSubmitting(true);
            await hoaDonService.createKhachHang({
                id_ban: tableId,
                chi_tiet_hoa_don: cart.map(i => ({
                    id_mon_an: i.id_mon_an,
                    id_combo: i.id_combo,
                    so_luong: i.so_luong
                }))
            });
            setOrderSuccess(true);
            clearCart();
            closeCart();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleThanhToanZaloPay = async () => {
        if (!activeOrder?.id) return;
        try {
            setIsPaying(true);
            const data = await zalopayService.createPayment(activeOrder.id, Number(activeOrder.tong_tien) - (activeOrder.giam_gia || 0));
            if (data.order_url) {
                window.location.href = data.order_url;
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Lỗi tạo thanh toán ZaloPay!');
        } finally {
            setIsPaying(false);
        }
    };

    return { isSubmitting, isPaying, orderSuccess, setOrderSuccess, handleDatMon, handleThanhToanZaloPay };
}
