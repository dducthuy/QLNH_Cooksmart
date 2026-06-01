import { useState, useEffect } from 'react';
import { hoaDonService } from '@/services/hoaDon.service';
import { HoaDon, TrangThaiHoaDon } from '@/types/hoaDon';

export function useOrderDetails(orderId: string, onStatusUpdate: () => void) {
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

    return { order, isLoading, isUpdating, handleUpdateStatus };
}
