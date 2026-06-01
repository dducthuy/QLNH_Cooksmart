import http from '@/lib/http';
import { 
  DanhMuc, 
  LayTatCaDanhMucResponse, 
  LayDanhMucTheoIdResponse,
  TaoDanhMucResponse,
  CapNhatDanhMucResponse,
  XoaDanhMucResponse,
  TaoDanhMucBody,
  CapNhatDanhMucBody
} from '@/types/danhMuc';

export const categoryService = {
    async getAll(): Promise<DanhMuc[]> {
        const response = await http.get<LayTatCaDanhMucResponse>('/danh-muc');
        return response.data.data;
    },
    
    async getById(id: string): Promise<DanhMuc> {
        const response = await http.get<LayDanhMucTheoIdResponse>(`/danh-muc/${id}`);
        return response.data.data;
    },
    
    async create(data: TaoDanhMucBody): Promise<DanhMuc> {
        const response = await http.post<TaoDanhMucResponse>('/danh-muc', data);
        return response.data.data;
    },
    
    async update(id: string, data: CapNhatDanhMucBody): Promise<DanhMuc> {
        const response = await http.patch<CapNhatDanhMucResponse>(`/danh-muc/${id}`, data);
        return response.data.data;
    },
    
    async delete(id: string): Promise<void> {
        await http.delete<XoaDanhMucResponse>(`/danh-muc/${id}`);
    }
};
