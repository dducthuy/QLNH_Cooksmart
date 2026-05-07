import http from '@/lib/http';
import { DashboardData } from '@/types/dashboard';
import { ApiResponse } from '@/types/api';

export const dashboardService = {
    getTongQuan: async (ngay?: string): Promise<DashboardData> => {
        const url = ngay ? `/dashboard/tong-quan?ngay=${ngay}` : '/dashboard/tong-quan';
        const response = await http.get<ApiResponse<DashboardData>>(url);
        return response.data.data;
    }
};
