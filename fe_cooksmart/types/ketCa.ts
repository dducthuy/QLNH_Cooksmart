// fe_cooksmart/types/ketCa.ts

export type TrangThaiCa = 'DangChay' | 'DaKetThuc';

export interface KetCa {
    id: string;
    id_nhan_vien: string;
    thoi_gian_bat_dau: string;
    thoi_gian_ket_thuc: string | null;
    tien_dau_ca: number;
    tong_tien_mat_he_thong: number;
    tong_chuyen_khoan_he_thong: number;
    tien_mat_thuc_te_ban_giao: number;
    tien_chenh_lech: number;
    trang_thai_ca: TrangThaiCa;
    // Audit fields (Admin)
    da_kiem_duyet: boolean;
    ghi_chu_kiem_duyet: string | null;
    id_admin_kiem_duyet: string | null;
    thoi_gian_kiem_duyet: string | null;
    NguoiDung?: { id: string; ho_ten: string; ten_dang_nhap: string; vai_tro: string };
}

// Admin: Báo cáo chi tiết một ca
export interface BaoCaoChiTietCa {
    ca_lam_viec: KetCa;
    thong_ke_tai_chinh: {
        tong_so_don: number;
        tong_doanh_thu: number;
        tong_tien_mat: number;
        tong_chuyen_khoan: number;
        tong_chi_tieu: number;
        tien_mat_ket_ly_thuyet: number;
    };
}

// Admin: Dashboard tổng quan
export interface DashboardSummary {
    tong_so_ca: number;
    tong_doanh_thu_tien_mat: number;
    tong_doanh_thu_chuyen_khoan: number;
    tong_doanh_thu: number;
    tong_chenh_lech: number;
    tong_tien_dau_ca: number;
    so_ca_chua_kiem_duyet: number;
}

// Admin: Lịch sử ca phân trang
export interface LichSuCaResponse {
    status: string;
    total: number;
    results: number;
    phanTrang: { limit: number; offset: number; trangHienTai: number; tongSoTrang: number };
    data: KetCa[];
}

export interface ChiTieuCa {
    id: string;
    id_ket_ca: string;
    id_nhan_vien: string;
    ly_do: string;
    so_tien: number;
    thoi_gian_chi: string;
}

export interface MoCaBody {
    starting_cash: number;
}

export interface MoCaResponse {
    status: string;
    message: string;
    data: KetCa;
}

export interface ThongTinCaHienTaiResponse {
    status: string;
    data: {
        ca_lam_viec: KetCa;
        tong_so_don: number;
        doanh_thu_tien_mat: number;
        doanh_thu_chuyen_khoan: number;
        tong_tien_chi: number;
        danh_sach_chi_tieu: ChiTieuCa[];
        tien_mat_ly_thuyet: number;
    };
}

export interface ThemChiTieuBody {
    ly_do: string;
    so_tien: number;
}

export interface ThemChiTieuResponse {
    status: string;
    message: string;
    data: ChiTieuCa;
}

export interface ChotCaBody {
    actual_cash: number;
}

export interface ChotCaResponse {
    status: string;
    message: string;
    data: KetCa;
}
