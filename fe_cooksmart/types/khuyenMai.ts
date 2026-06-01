export type LoaiKhuyenMai = 'PhanTram' | 'SoTien';

export interface KhuyenMai {
    id: string;
    ma_km: string;
    ten_km: string;
    loai_km: LoaiKhuyenMai;
    gia_tri_km: number;
    gia_tri_dh_toi_thieu: number;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    trang_thai: boolean;
    so_luong: number;
    da_dung: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface TaoKhuyenMaiBody {
    ma_km: string;
    ten_km: string;
    loai_km: LoaiKhuyenMai;
    gia_tri_km: number;
    gia_tri_dh_toi_thieu?: number;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    trang_thai?: boolean;
    so_luong?: number;
}

export interface CapNhatKhuyenMaiBody extends Partial<TaoKhuyenMaiBody> {}

export interface LayTatCaKhuyenMaiResponse {
    status: "success";
    results: number;
    data: KhuyenMai[];
}

export interface ThaoTacKhuyenMaiResponse {
    status: "success";
    message: string;
    data?: KhuyenMai;
}
