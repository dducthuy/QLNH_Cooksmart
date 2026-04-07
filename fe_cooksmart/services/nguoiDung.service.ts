import http from '@/lib/http';
import {
    NguoiDung,
    TaoNguoiDungBody,
    CapNhatNguoiDungBody,
    DoiMatKhauBody,
    LayTatCaNguoiDungResponse,
    LayNguoiDungTheoIdResponse,
    TaoNguoiDungResponse,
    CapNhatNguoiDungResponse,
    DoiTrangThaiResponse,
} from '@/types/nguoiDung';

export const nguoiDungService = {
    async getAll(params?: { vai_tro?: string; trang_thai?: boolean; q?: string }): Promise<NguoiDung[]> {
        const response = await http.get<LayTatCaNguoiDungResponse>('/nguoi-dung', { params });
        return response.data.data;
    },

    async getById(id: string): Promise<NguoiDung> {
        const response = await http.get<LayNguoiDungTheoIdResponse>(`/nguoi-dung/${id}`);
        return response.data.data;
    },

    async create(data: TaoNguoiDungBody): Promise<NguoiDung> {
        const response = await http.post<TaoNguoiDungResponse>('/nguoi-dung', data);
        return response.data.data;
    },

    async update(id: string, data: CapNhatNguoiDungBody): Promise<NguoiDung> {
        const response = await http.patch<CapNhatNguoiDungResponse>(`/nguoi-dung/${id}`, data);
        return response.data.data;
    },

    async resetPassword(id: string, mat_khau_moi: string): Promise<void> {
        await http.patch(`/nguoi-dung/${id}/doi-mat-khau`, { mat_khau_moi } as DoiMatKhauBody);
    },

    async toggleStatus(id: string): Promise<{ id: string; trang_thai: boolean }> {
        const response = await http.patch<DoiTrangThaiResponse>(`/nguoi-dung/${id}/trang-thai`, {});
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/nguoi-dung/${id}`);
    },
};
