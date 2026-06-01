

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
        return response.data?.data || [];
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

    async updateItemStatus(id: string, trang_thai_mon: "DangCho" | "DangNau" | "DaXong" | "DaLayDi"): Promise<void> {
        await http.patch(`/hoa-don/noi-bo/chi-tiet/${id}/trang-thai`, { trang_thai_mon });
    },

    async createKhachHang(data: TaoHoaDonKhachHangBody): Promise<TaoHoaDonKhachHangResponse> {
        const response = await http.post<TaoHoaDonKhachHangResponse>('/hoa-don/khach-hang', data);
        return response.data;
    },

    async chuyenBan(id_hoa_don: string, id_ban_moi: string): Promise<void> {
        await http.post('/hoa-don/noi-bo/chuyen-ban', { id_hoa_don, id_ban_moi });
    },

    async gopBan(id_hoa_don_nguon: string, id_hoa_don_dich: string): Promise<void> {
        await http.post('/hoa-don/noi-bo/gop-ban', { id_hoa_don_nguon, id_hoa_don_dich });
    },

    async getActiveByTable(id_ban: string): Promise<HoaDon | null> {
        const response = await http.get<any>(`/hoa-don/khach-hang/ban/${id_ban}`);
        return response.data.data;
    },

    // Lấy tất cả món DaXong → DaLayDi (ẩn khỏi bếp)
    async layTatCa(id_hoa_don: string): Promise<void> {
        await http.post(`/hoa-don/noi-bo/${id_hoa_don}/lay-tat-ca`);
    },



    // Lịch sử bếp hôm nay
    async getKitchenHistory(): Promise<HoaDon[]> {
        const response = await http.get<any>('/hoa-don/noi-bo/lich-su-bep');
        return response.data?.data || [];
    }
};

