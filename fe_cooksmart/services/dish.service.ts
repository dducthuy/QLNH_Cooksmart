import http from '@/lib/http';
import { 
    MonAn, 
    TaoMonAnBody, 
    CapNhatMonAnBody, 
    LayTatCaMonAnResponse, 
    LayMonAnTheoIdResponse,
    TaoMonAnResponse,
    CapNhatMonAnResponse
} from '@/types/monAn';

export const dishService = {
    async getAll(): Promise<MonAn[]> {
        const response = await http.get<LayTatCaMonAnResponse>('/mon-an');
        return response.data.data;
    },

    async getById(id: string): Promise<MonAn> {
        const response = await http.get<LayMonAnTheoIdResponse>(`/mon-an/${id}`);
        return response.data.data;
    },

    async create(data: TaoMonAnBody): Promise<MonAn> {
        const response = await http.post<TaoMonAnResponse>('/mon-an', data);
        return response.data.data;
    },

    async update(id: string, data: CapNhatMonAnBody): Promise<MonAn> {
        const response = await http.patch<CapNhatMonAnResponse>(`/mon-an/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/mon-an/${id}`);
    }
};
