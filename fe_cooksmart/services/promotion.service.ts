import http from '@/lib/http';
import { 
  KhuyenMai, 
  LayTatCaKhuyenMaiResponse, 
  ThaoTacKhuyenMaiResponse,
  TaoKhuyenMaiBody,
  CapNhatKhuyenMaiBody
} from '@/types/khuyenMai';

export const promotionService = {
    async getAll(): Promise<KhuyenMai[]> {
        const response = await http.get<LayTatCaKhuyenMaiResponse>('/khuyen-mai');
        return response.data.data;
    },
    
    async create(data: TaoKhuyenMaiBody): Promise<KhuyenMai> {
        const response = await http.post<ThaoTacKhuyenMaiResponse>('/khuyen-mai', data);
        return response.data.data as KhuyenMai;
    },
    
    async update(id: string, data: CapNhatKhuyenMaiBody): Promise<KhuyenMai> {
        const response = await http.patch<ThaoTacKhuyenMaiResponse>(`/khuyen-mai/${id}`, data);
        return response.data.data as KhuyenMai;
    },
    
    async delete(id: string): Promise<void> {
        await http.delete<ThaoTacKhuyenMaiResponse>(`/khuyen-mai/${id}`);
    }
};
