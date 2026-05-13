
export interface NhatKyKho {
    id: string;
    ma_phieu: string;
    loai_giao_dich: 'NHAP_HANG' | 'XUAT_BAN' | 'HUY_HANG' | 'KIEM_KE_CHOT_LO';
    id_nguoi_thuc_hien: string;
    thoi_gian: string;
    ghi_chu?: string | null;
    // Relations
    NguoiDung?: { ho_ten: string };
    ChiTiets?: ChiTietNhatKyKho[];
    ChiTietHaoHuts?: ChiTietBaoCaoHaoHut[];
}

// --- Chi Tiết Nguyên Liệu Trong Phiếu (Detail) ---
export interface ChiTietNhatKyKho {
    id: string;
    id_nhat_ky_kho: string;
    id_nguyen_lieu: string;
    so_luong: number;
    don_gia: number;
    thanh_tien: number;
    // Relations
    NguyenLieu?: {
        ten_nguyen_lieu: string;
        don_vi_tinh: string | null;
    };
}

// --- Chi Tiết Hao Hụt Kiểm Kê ---
export interface ChiTietBaoCaoHaoHut {
    id: string;
    id_nhat_ky_kho: string;
    id_nguyen_lieu: string;
    luong_ban_ly_thuyet: number;  // Tồn lý thuyết trước kiểm kê
    luong_du_thuc_te: number;     // Tồn thực tế đếm được
    luong_hao_hut: number;        // = ly_thuyet - thuc_te (dương = thiếu, âm = thừa)
    gia_tri_hao_hut: number;      // = luong_hao_hut * gia_von
    // Relations
    NguyenLieu?: {
        ten_nguyen_lieu: string;
        don_vi_tinh: string | null;
        gia_nhap_gan_nhat?: number;
    };
    NhatKyKho?: {
        ma_phieu: string;
        thoi_gian: string;
        NguoiDung?: { ho_ten: string };
    };
}

// --- Response: Danh sách phiếu nhập/xuất (đã gom nhóm, tính tổng) ---
export interface PhieuNhapXuatSummary {
    id: string;
    ma_phieu: string;
    loai_giao_dich: NhatKyKho['loai_giao_dich'];
    thoi_gian: string;
    nguoi_thuc_hien: string;
    tong_so_luong: number;
    tong_gia_tri: number;
    so_mat_hang: number;
}

// --- Response: Danh sách phiếu kiểm kê (đã gom nhóm, tính tổng) ---
export interface PhieuKiemKeSummary {
    id: string;
    ma_phieu: string;
    thoi_gian: string;
    nguoi_tao: string;
    tong_sl_lech: number;
    tong_gia_tri_lech: number;
}

// --- Chi tiết 1 phiếu nhập/xuất (full) ---
export interface PhieuNhapXuatDetail extends NhatKyKho {
    ChiTiets: ChiTietNhatKyKho[];
    NguoiDung: { ho_ten: string };
}

// --- Chi tiết 1 phiếu kiểm kê (full) ---
export interface PhieuKiemKeDetail extends NhatKyKho {
    ChiTietHaoHuts: ChiTietBaoCaoHaoHut[];
    NguoiDung: { ho_ten: string };
}
