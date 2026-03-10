import type { DanhMuc } from "./danhMuc";

export interface MonAn {
  id: string;
  ten_mon: string;
  gia_tien: number;
  hinh_anh_mon: string | null;
  mo_ta_ai: string | null;
  con_hang: boolean;
  DanhMuc?: DanhMuc | null;
}

export interface TaoMonAnBody {
  ten_mon: string;
  gia_tien: number;
  id_danh_muc?: string | null;
  hinh_anh_mon?: string | null;
  mo_ta_ai?: string | null;
}

export interface CapNhatMonAnBody {
  ten_mon?: string;
  gia_tien?: number;
  id_danh_muc?: string | null;
  hinh_anh_mon?: string | null;
  mo_ta_ai?: string | null;
  con_hang?: boolean;
}

export interface LayTatCaMonAnResponse {
  status: "success";
  results: number;
  data: MonAn[];
}

export interface LayMonAnTheoIdResponse {
  status: "success";
  data: MonAn;
}

export interface TaoMonAnResponse {
  status: "success";
  message: string;
  data: MonAn;
}

export interface CapNhatMonAnResponse {
  status: "success";
  message: string;
  data: MonAn;
}

export interface XoaMonAnResponse {
  status: "success";
  message: string;
}
