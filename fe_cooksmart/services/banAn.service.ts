import http from '@/lib/http';
import {
    BanAn,
    TaoBanAnBody,
    CapNhatBanAnBody,
    LayTatCaBanAnResponse,
    LayBanAnTheoIdResponse,
    TaoBanAnResponse,
    CapNhatBanAnResponse,
} from '@/types/banAn';

export const banAnService = {
    async getAll(): Promise<BanAn[]> {
        const response = await http.get<LayTatCaBanAnResponse>('/ban-an');
        return response.data.data;
    },

    async getById(id: string): Promise<BanAn> {
        const response = await http.get<LayBanAnTheoIdResponse>(`/ban-an/${id}`);
        return response.data.data;
    },

    async create(data: TaoBanAnBody): Promise<BanAn> {
        const response = await http.post<TaoBanAnResponse>('/ban-an', data);
        return response.data.data;
    },

    async update(id: string, data: CapNhatBanAnBody): Promise<BanAn> {
        const response = await http.patch<CapNhatBanAnResponse>(`/ban-an/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/ban-an/${id}`);
    },

    async getQRCode(id: string): Promise<{ id_ban: string; so_ban: string; vi_tri: string | null; order_url: string; qr_code: string }> {
        const response = await http.get<{ status: string; data: any }>(`/ban-an/${id}/qr`);
        return response.data.data;
    },
};
