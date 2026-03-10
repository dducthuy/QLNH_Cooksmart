export type VaiTro = "Admin" | "PhucVu" | "Bep";

export interface NguoiDung {
  id: string;
  ten_dang_nhap: string;
  ho_ten: string | null;
  vai_tro: VaiTro;
  trang_thai?: boolean;
}

export interface DangNhapBody {
  ten_dang_nhap: string;
  mat_khau: string;
}

export interface DangNhapResponse {
  status: "success";
  message: string;
  token: string;
  data: NguoiDung;
}

export interface ToiResponse {
  status: "success";
  data: NguoiDung;
}
