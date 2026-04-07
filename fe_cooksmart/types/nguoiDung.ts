export type VaiTro = 'Admin' | 'PhucVu' | 'Bep';

export interface NguoiDung {
    id: string;
    ten_dang_nhap: string;
    ho_ten: string | null;
    vai_tro: VaiTro;
    trang_thai: boolean;
}

export interface TaoNguoiDungBody {
    ten_dang_nhap: string;
    mat_khau: string;
    ho_ten?: string | null;
    vai_tro: VaiTro;
}

export interface CapNhatNguoiDungBody {
    ten_dang_nhap?: string;
    ho_ten?: string | null;
    vai_tro?: VaiTro;
    trang_thai?: boolean;
}

export interface DoiMatKhauBody {
    mat_khau_moi: string;
}

export interface LayTatCaNguoiDungResponse {
    status: 'success';
    results: number;
    data: NguoiDung[];
}

export interface LayNguoiDungTheoIdResponse {
    status: 'success';
    data: NguoiDung;
}

export interface TaoNguoiDungResponse {
    status: 'success';
    message: string;
    data: NguoiDung;
}

export interface CapNhatNguoiDungResponse {
    status: 'success';
    message: string;
    data: NguoiDung;
}

export interface DoiTrangThaiResponse {
    status: 'success';
    message: string;
    data: { id: string; trang_thai: boolean };
}
