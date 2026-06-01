import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { useSocket } from '@/context/SocketContext';
import { DashboardData } from '@/types/dashboard';

export function useDashboard() {
    const { socket } = useSocket();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    const loadData = useCallback(async () => {
        try {
            const data = await dashboardService.getTongQuan();
            setDashboardData(data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!socket) return;

        // Bắt các sự kiện để tải lại dashboard
        socket.on('cap_nhat_menu', loadData);
        socket.on('cap_nhat_trang_thai_ban', loadData);
        socket.on('thanh_toan_xong', loadData);
        socket.on('cap_nhat_ca', loadData);
        socket.on('cap_nhat_kho', loadData); // Tải lại khi có thay đổi kho

        return () => {
            socket.off('cap_nhat_menu', loadData);
            socket.off('cap_nhat_trang_thai_ban', loadData);
            socket.off('thanh_toan_xong', loadData);
            socket.off('cap_nhat_ca', loadData);
            socket.off('cap_nhat_kho', loadData);
        };
    }, [socket, loadData]);

    return { isLoading, dashboardData, loadData };
}
