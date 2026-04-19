import http from '@/lib/http';
import { KetCa, BaoCaoChiTietCa, DashboardSummary, LichSuCaResponse } from '@/types/ketCa';

export const adminKetCaService = {
    async getLichSuCa(params: {
        status?: string; userId?: string; tuNgay?: string;
        denNgay?: string; limit?: number; offset?: number;
    }): Promise<LichSuCaResponse> {
        const res = await http.get<LichSuCaResponse>('/admin/shifts', { params });
        return res.data;
    },

    async getBaoCaoChiTiet(id: string): Promise<{ status: string; data: BaoCaoChiTietCa }> {
        const res = await http.get<{ status: string; data: BaoCaoChiTietCa }>(`/admin/shifts/${id}/report`);
        return res.data;
    },

    async kiemDuyetCa(id: string, ghi_chu: string): Promise<{ status: string; message: string; data: KetCa }> {
        const res = await http.put<{ status: string; message: string; data: KetCa }>(`/admin/shifts/${id}/audit`, { ghi_chu_kiem_duyet: ghi_chu });
        return res.data;
    },

    async getDashboardSummary(params: { tuNgay?: string; denNgay?: string }): Promise<{ status: string; data: DashboardSummary }> {
        const res = await http.get<{ status: string; data: DashboardSummary }>('/admin/shifts/dashboard-summary', { params });
        return res.data;
    },
};
