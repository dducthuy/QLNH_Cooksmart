export type TrangThaiHoaDon = "ChoXuLy" | "DangPhucVu" | "DaThanhToan" | "DaHuy";

export type PhuongThucThanhToan = "TienMat" | "ChuyenKhoan";

export type TrangThaiMon = "DangCho" | "DangNau" | "DaXong";

export interface ChiTietHoaDon {
  id: string;
  id_hoa_don: string | null;
  id_mon_an: string | null;
  so_luong: number;
  trang_thai_mon: TrangThaiMon;
}

export interface HoaDon {
  id: string;
  id_ban: string | null;
  id_nhan_vien: string | null;
  tong_tien: number;
  phuong_thuc_tt: PhuongThucThanhToan;
  trang_thai_hd: TrangThaiHoaDon;
  thoi_gian_tao: string;
  da_chot_kho: boolean;
  BanAn?: { so_ban: string } | null;
  NguoiDung?: { ho_ten: string } | null;
  KhuyenMai?: { ten_km: string; loai_km?: string; gia_tri_km?: number } | null;
  ChiTietHoaDons?: any[];
}

export interface ChiTietHoaDonInput {
  id_mon_an: string;
  so_luong: number;
  ghi_chu?: string | null;
}

export interface TaoHoaDonNoiBoBody {
  id_ban?: string | null;
  phuong_thuc_tt?: PhuongThucThanhToan;
  chi_tiet_hoa_don: ChiTietHoaDonInput[];
}

export interface TaoHoaDonKhachHangBody {
  id_ban: string;
  chi_tiet_hoa_don: ChiTietHoaDonInput[];
}

export interface TaoHoaDonData {
  hoaDon: HoaDon;
  chiTiet: ChiTietHoaDon[];
}

export interface TaoHoaDonNoiBoResponse {
  status: "success";
  message: string;
  data: TaoHoaDonData;
}

export interface TaoHoaDonKhachHangResponse {
  status: "success";
  message: string;
  data: TaoHoaDonData;
}

export interface ThongBaoMonMoiSocket {
  id_hoa_don: string;
  so_ban: string;
  nguoi_dat: string;
  danh_sach_mon: Array<{
    ten_mon: string;
    so_luong: number;
    ghi_chu?: string | null;
  }>;
  thoi_gian: string;
}

export interface LayTatCaHoaDonResponse {
  status: "success";
  results: number;
  data: HoaDon[];
}

export interface LayChiTietHoaDonResponse {
  status: "success";
  data: HoaDon;
}

export interface CapNhatTrangThaiHoaDonBody {
  trang_thai_hd: TrangThaiHoaDon;
}

export interface CapNhatTrangThaiHoaDonResponse {
  status: "success";
  message: string;
}
