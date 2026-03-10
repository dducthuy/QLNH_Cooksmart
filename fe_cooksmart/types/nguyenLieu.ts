export interface NguyenLieu {
  id: string;
  ten_nguyen_lieu: string;
  don_vi_tinh: string | null;
  so_luong_kho_tong: number;
  so_luong_tai_bep: number;
  gia_nhap_gan_nhat: number;
}

export interface TaoNguyenLieuBody {
  ten_nguyen_lieu: string;
  don_vi_tinh?: string | null;
  so_luong_kho_tong?: number;
  so_luong_tai_bep?: number;
  gia_nhap_gan_nhat?: number;
}

export interface CapNhatNguyenLieuBody {
  ten_nguyen_lieu?: string;
  don_vi_tinh?: string | null;
  so_luong_kho_tong?: number;
  so_luong_tai_bep?: number;
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
