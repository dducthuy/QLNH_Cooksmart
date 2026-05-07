import type { MonAn } from "./monAn";

export interface ChiTietCombo {
  id: string;
  id_combo: string;
  id_mon_an: string;
  so_luong: number;
  MonAn?: MonAn;
}

export interface Combo {
  id: string;
  ten_combo: string;
  gia_tien: number;
  hinh_anh_combo: string | null;
  mo_ta: string | null;
  trang_thai: boolean;
  ChiTietCombos?: ChiTietCombo[];
}

export interface LayTatCaComboResponse {
  status: "success";
  results: number;
  data: Combo[];
}

export interface LayChiTietComboResponse {
  status: "success";
  data: Combo;
}
