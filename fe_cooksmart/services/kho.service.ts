import http from '@/lib/http';
import {
    ChiTietBaoCaoHaoHut,
    NhatKyKho,
    PhieuKiemKeDetail,
    PhieuKiemKeSummary,
    PhieuNhapXuatDetail,
    PhieuNhapXuatSummary,
} from '@/types/kho';

const URL = '/kho';

interface ApiListResponse<T> {
    status: 'success';
    results?: number;
    data: T[];
}

interface ApiDataResponse<T> {
    status: 'success';
    message?: string;
    data: T;
}

export interface NhapKhoItem {
    id_nguyen_lieu: string;
    so_luong_nhap: number;
    gia_nhap: number;
}

export interface NhapKhoBody {
    items: NhapKhoItem[];
    ghi_chu?: string;
}

export interface KiemKeItem {
    id_nguyen_lieu: string;
    so_luong_thuc_te: number;
}

export interface KiemKeBody {
    items: KiemKeItem[];
}

export interface XuatKhoItem {
    id_nguyen_lieu: string;
    so_luong_xuat: number;
    loai_giao_dich?: 'HUY_HANG' | 'XUAT_BAN';
}

export interface XuatKhoBody {
    items: XuatKhoItem[];
    ghi_chu?: string;
}

export const khoService = {
    nhapKho: async (data: NhapKhoBody): Promise<ApiDataResponse<unknown>> => {
        const response = await http.post<ApiDataResponse<unknown>>(`${URL}/nhap-hang`, data);
        return response.data;
    },

    xuatKho: async (data: XuatKhoBody): Promise<ApiDataResponse<unknown>> => {
        const response = await http.post<ApiDataResponse<unknown>>(`${URL}/xuat-hang`, data);
        return response.data;
    },

    kiemKeKho: async (data: KiemKeBody): Promise<ApiDataResponse<unknown>> => {
        const response = await http.post<ApiDataResponse<unknown>>(`${URL}/kiem-ke`, data);
        return response.data;
    },

    layDanhSachPhieuKiemKe: async (): Promise<ApiListResponse<PhieuKiemKeSummary>> => {
        const response = await http.get<ApiListResponse<PhieuKiemKeSummary>>(`${URL}/phieu-kiem-ke`);
        return response.data;
    },

    layChiTietPhieuKiemKe: async (id: string): Promise<ApiDataResponse<PhieuKiemKeDetail>> => {
        const response = await http.get<ApiDataResponse<PhieuKiemKeDetail>>(`${URL}/phieu-kiem-ke/${id}`);
        return response.data;
    },

    layNhatKyKho: async (params?: { loai_giao_dich?: string; tu_ngay?: string; den_ngay?: string }): Promise<ApiListResponse<NhatKyKho>> => {
        const response = await http.get<ApiListResponse<NhatKyKho>>(`${URL}/lich-su`, { params });
        return response.data;
    },

    layDanhSachPhieuNhapXuat: async (params?: { loai_giao_dich?: string }): Promise<ApiListResponse<PhieuNhapXuatSummary>> => {
        const response = await http.get<ApiListResponse<PhieuNhapXuatSummary>>(`${URL}/phieu-nhap-xuat`, { params });
        return response.data;
    },

    layChiTietPhieuNhapXuat: async (id: string): Promise<ApiDataResponse<PhieuNhapXuatDetail>> => {
        const response = await http.get<ApiDataResponse<PhieuNhapXuatDetail>>(`${URL}/phieu-nhap-xuat/${id}`);
        return response.data;
    },

    layBaoCaoHaoHut: async (params?: { tu_ngay?: string; den_ngay?: string; id_nguyen_lieu?: string }): Promise<ApiListResponse<ChiTietBaoCaoHaoHut>> => {
        const response = await http.get<ApiListResponse<ChiTietBaoCaoHaoHut>>(`${URL}/bao-cao-hao-hut`, { params });
        return response.data;
    },
};
