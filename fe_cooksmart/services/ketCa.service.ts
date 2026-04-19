// fe_cooksmart/services/ketCa.service.ts
import http from '@/lib/http';
import {
    MoCaBody, MoCaResponse,
    ThongTinCaHienTaiResponse,
    ChotCaBody, ChotCaResponse,
    ThemChiTieuBody, ThemChiTieuResponse
} from '@/types/ketCa';

export const ketCaService = {
    async moCa(data: MoCaBody): Promise<MoCaResponse> {
        const response = await http.post<MoCaResponse>('/shifts/open', data);
        return response.data;
    },

    async getCaHienTai(): Promise<ThongTinCaHienTaiResponse> {
        const response = await http.get<ThongTinCaHienTaiResponse>('/shifts/current');
        return response.data;
    },

    async chotCa(shiftId: string, data: ChotCaBody): Promise<ChotCaResponse> {
        const response = await http.post<ChotCaResponse>(`/shifts/close/${shiftId}`, data);
        return response.data;
    },

    async themChiTieu(data: ThemChiTieuBody): Promise<ThemChiTieuResponse> {
        const response = await http.post<ThemChiTieuResponse>('/shifts/expense', data);
        return response.data;
    }
};
