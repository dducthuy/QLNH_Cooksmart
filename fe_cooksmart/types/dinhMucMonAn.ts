import type { MonAn } from "./monAn";
import type { NguyenLieu } from "./nguyenLieu";

export interface DinhMucMonAn {
  id: string;
  id_mon_an?: string;
  id_nguyen_lieu?: string;
  luong_tieu_hao: number;
  MonAn?: Pick<MonAn, "id" | "ten_mon"> | null;
  NguyenLieu?: Pick<NguyenLieu, "id" | "ten_nguyen_lieu" | "don_vi_tinh"> | null;
}

export interface TaoDinhMucBody {
  id_mon_an: string;
  id_nguyen_lieu: string;
  luong_tieu_hao: number;
}

export interface CapNhatDinhMucBody {
  luong_tieu_hao: number;
}

export interface LayTatCaDinhMucResponse {
  status: "success";
  results: number;
  data: DinhMucMonAn[];
}

export interface LayDinhMucTheoMonAnResponse {
  status: "success";
  mon_an: Pick<MonAn, "id" | "ten_mon">;
  results: number;
  data: DinhMucMonAn[];
}

export interface TaoDinhMucResponse {
  status: "success";
  message: string;
  data: DinhMucMonAn;
}

export interface CapNhatDinhMucResponse {
  status: "success";
  message: string;
  data: DinhMucMonAn;
}

export interface XoaDinhMucResponse {
  status: "success";
  message: string;
}
