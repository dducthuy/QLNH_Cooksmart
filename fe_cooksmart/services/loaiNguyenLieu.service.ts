import http from '@/lib/http';
import {
  LoaiNguyenLieu,
  TaoLoaiNguyenLieuBody,
  CapNhatLoaiNguyenLieuBody,
  LayTatCaLoaiNguyenLieuResponse,
  LayLoaiNguyenLieuTheoIdResponse,
  TaoLoaiNguyenLieuResponse,
  CapNhatLoaiNguyenLieuResponse,
  XoaLoaiNguyenLieuResponse
} from '@/types/loaiNguyenLieu';

const URL = '/loai-nguyen-lieu';

export const loaiNguyenLieuService = {
  getAll: async (): Promise<LayTatCaLoaiNguyenLieuResponse> => {
    const response = await http.get<LayTatCaLoaiNguyenLieuResponse>(URL);
    return response.data;
  },

  getById: async (id: string): Promise<LayLoaiNguyenLieuTheoIdResponse> => {
    const response = await http.get<LayLoaiNguyenLieuTheoIdResponse>(`${URL}/${id}`);
    return response.data;
  },

  create: async (data: TaoLoaiNguyenLieuBody): Promise<TaoLoaiNguyenLieuResponse> => {
    const response = await http.post<TaoLoaiNguyenLieuResponse>(URL, data);
    return response.data;
  },

  update: async (id: string, data: CapNhatLoaiNguyenLieuBody): Promise<CapNhatLoaiNguyenLieuResponse> => {
    const response = await http.patch<CapNhatLoaiNguyenLieuResponse>(`${URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<XoaLoaiNguyenLieuResponse> => {
    const response = await http.delete<XoaLoaiNguyenLieuResponse>(`${URL}/${id}`);
    return response.data;
  }
};
