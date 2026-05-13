export interface NguyenLieu {
  id: string;
  id_loai_nguyen_lieu?: string | null;
  ten_nguyen_lieu: string;
  don_vi_tinh: string | null;
  loai_quan_ly: 'TU_DONG' | 'THU_CONG';
  so_luong_ton: number | string;
  gia_nhap_gan_nhat: number | string;
  gia_von_binh_quan: number | string;
  LoaiNguyenLieu?: {
    id: string;
    ten_loai: string;
  };
}

export interface TaoNguyenLieuBody {
  id_loai_nguyen_lieu?: string | null;
  ten_nguyen_lieu: string;
  don_vi_tinh?: string | null;
  loai_quan_ly?: 'TU_DONG' | 'THU_CONG';
  so_luong_ton?: number;
  gia_nhap_gan_nhat?: number;
}

export interface CapNhatNguyenLieuBody {
  id_loai_nguyen_lieu?: string | null;
  ten_nguyen_lieu?: string;
  don_vi_tinh?: string | null;
  loai_quan_ly?: 'TU_DONG' | 'THU_CONG';
  so_luong_ton?: number;
  gia_nhap_gan_nhat?: number;
}

export interface LayTatCaNguyenLieuResponse {
  status: "success";
  results: number;
  data: NguyenLieu[];
}

export interface LayNguyenLieuTheoIdResponse {
  status: "success";
  data: NguyenLieu;
}

export interface TaoNguyenLieuResponse {
  status: "success";
  message: string;
  data: NguyenLieu;
}

export interface CapNhatNguyenLieuResponse {
  status: "success";
  message: string;
  data: NguyenLieu;
}

export interface XoaNguyenLieuResponse {
  status: "success";
  message: string;
}
