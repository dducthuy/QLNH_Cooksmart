export type TrangThaiBan = "Trong" | "DangPhucVu" | "DatTruoc";

export interface BanAn {
  id: string;
  so_ban: string;
  vi_tri: string | null;
  ma_qr_code: string | null;
  trang_thai_ban: TrangThaiBan;
}

export interface TaoBanAnBody {
  so_ban: string;
  vi_tri?: string | null;
  ma_qr_code?: string | null;
  trang_thai_ban?: TrangThaiBan;
}

export interface CapNhatBanAnBody {
  so_ban?: string;
  vi_tri?: string | null;
  ma_qr_code?: string | null;
  trang_thai_ban?: TrangThaiBan;
}

export interface LayTatCaBanAnResponse {
  status: "success";
  results: number;
  data: BanAn[];
}

export interface LayBanAnTheoIdResponse {
  status: "success";
  data: BanAn;
}

export interface TaoBanAnResponse {
  status: "success";
  message: string;
  data: BanAn;
}

export interface CapNhatBanAnResponse {
  status: "success";
  message: string;
  data: BanAn;
}

export interface XoaBanAnResponse {
  status: "success";
  message: string;
}
