import http from '@/lib/http';
import { Combo, LayTatCaComboResponse, LayChiTietComboResponse } from '@/types/combo';

export const comboService = {
    async getAll(): Promise<Combo[]> {
        const response = await http.get<LayTatCaComboResponse>('/combo');
        return response.data.data;
    },

    async getPublic(): Promise<Combo[]> {
        const response = await http.get<LayTatCaComboResponse>('/combo/public');
        return response.data.data;
    },

    async getById(id: string): Promise<Combo> {
        const response = await http.get<LayChiTietComboResponse>(`/combo/${id}`);
        return response.data.data;
    },

    async create(data: any): Promise<Combo> {
        const response = await http.post<LayChiTietComboResponse>('/combo', data);
        return response.data.data;
    },

    async update(id: string, data: any): Promise<Combo> {
        const response = await http.put<LayChiTietComboResponse>(`/combo/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/combo/${id}`);
    }
};
