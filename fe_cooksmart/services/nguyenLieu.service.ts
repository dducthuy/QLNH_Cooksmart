import http from '@/lib/http';
import {
  NguyenLieu,
  TaoNguyenLieuBody,
  CapNhatNguyenLieuBody,
  LayTatCaNguyenLieuResponse,
  LayNguyenLieuTheoIdResponse,
  TaoNguyenLieuResponse,
  CapNhatNguyenLieuResponse,
  XoaNguyenLieuResponse
} from '@/types/nguyenLieu';

const URL = '/nguyen-lieu';

export const nguyenLieuService = {
  // Lấy tất cả nguyên liệu
  getAll: async (): Promise<LayTatCaNguyenLieuResponse> => {
    const response = await http.get<LayTatCaNguyenLieuResponse>(URL);
    return response.data;
  },

  // Lấy chi tiết nguyên liệu
  getById: async (id: string): Promise<LayNguyenLieuTheoIdResponse> => {
    const response = await http.get<LayNguyenLieuTheoIdResponse>(`${URL}/${id}`);
    return response.data;
  },

  // Thêm mới nguyên liệu
  create: async (data: TaoNguyenLieuBody): Promise<TaoNguyenLieuResponse> => {
    const response = await http.post<TaoNguyenLieuResponse>(URL, data);
    return response.data;
  },

  // Cập nhật nguyên liệu
  update: async (id: string, data: CapNhatNguyenLieuBody): Promise<CapNhatNguyenLieuResponse> => {
    const response = await http.patch<CapNhatNguyenLieuResponse>(`${URL}/${id}`, data);
    return response.data;
  },

  // Xóa nguyên liệu
  delete: async (id: string): Promise<XoaNguyenLieuResponse> => {
    const response = await http.delete<XoaNguyenLieuResponse>(`${URL}/${id}`);
    return response.data;
  }
};
