import http from '@/lib/http';
import { DanhMuc, LayTatCaDanhMucResponse } from '@/types/danhMuc';

export const categoryService = {
    async getAll(): Promise<DanhMuc[]> {
        const response = await http.get<LayTatCaDanhMucResponse>('/danh-muc');
        return response.data.data;
    }
};
