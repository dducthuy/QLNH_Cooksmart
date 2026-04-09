import http from '@/lib/http';
import {
    HoaDon,
    LayTatCaHoaDonResponse,
    LayChiTietHoaDonResponse,
    CapNhatTrangThaiHoaDonBody,
    CapNhatTrangThaiHoaDonResponse
} from '@/types/hoaDon';

export const hoaDonService = {
    async getAll(params?: any): Promise<HoaDon[]> {
        const response = await http.get<LayTatCaHoaDonResponse>('/hoa-don/noi-bo', { params });
        return response.data.data;
    },

    async getById(id: string): Promise<HoaDon> {
        const response = await http.get<LayChiTietHoaDonResponse>(`/hoa-don/noi-bo/${id}`);
        return response.data.data;
    },

    async updateStatus(id: string, data: CapNhatTrangThaiHoaDonBody): Promise<void> {
        await http.patch<CapNhatTrangThaiHoaDonResponse>(`/hoa-don/noi-bo/${id}/trang-thai`, data);
    }
};
