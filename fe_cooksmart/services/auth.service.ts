import http from '@/lib/http';
import { DangKyBody, DangKyResponse, DangNhapBody, DangNhapResponse } from '@/types/auth';

export const authService = {
    register: async (data: DangKyBody): Promise<DangKyResponse> => {
        const response = await http.post<DangKyResponse>('/auth/tao-tai-khoan', data);
        return response.data;
    },
    login: async (data: DangNhapBody): Promise<DangNhapResponse> => {
        const response = await http.post<DangNhapResponse>('/auth/dang-nhap', data);
        console.log(response.data);
        return response.data;
    }
};
