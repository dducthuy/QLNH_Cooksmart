

import http from '@/lib/http';
import {
    HoaDon,
    LayTatCaHoaDonResponse,
    LayChiTietHoaDonResponse,
    CapNhatTrangThaiHoaDonBody,
    CapNhatTrangThaiHoaDonResponse,
    TaoHoaDonNoiBoBody,
    TaoHoaDonNoiBoResponse,
    TaoHoaDonKhachHangBody,
    TaoHoaDonKhachHangResponse
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

    async createNoiBo(data: TaoHoaDonNoiBoBody): Promise<TaoHoaDonNoiBoResponse> {
        const response = await http.post<TaoHoaDonNoiBoResponse>('/hoa-don/noi-bo', data);
        return response.data;
    },

    async updateStatus(id: string, data: CapNhatTrangThaiHoaDonBody): Promise<void> {
        await http.patch<CapNhatTrangThaiHoaDonResponse>(`/hoa-don/noi-bo/${id}/trang-thai`, data);
    },

    async updateItemStatus(id: string, trang_thai_mon: "DangCho" | "DangNau" | "DaXong"): Promise<void> {
        await http.patch(`/hoa-don/noi-bo/chi-tiet/${id}/trang-thai`, { trang_thai_mon });
    },

    async createKhachHang(data: TaoHoaDonKhachHangBody): Promise<TaoHoaDonKhachHangResponse> {
        const response = await http.post<TaoHoaDonKhachHangResponse>('/hoa-don/khach-hang', data);
        return response.data;
    }
};
