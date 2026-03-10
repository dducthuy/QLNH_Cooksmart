export interface DanhMuc {
  id: string;
  ten_danh_muc: string;
}

export interface TaoDanhMucBody {
  ten_danh_muc: string;
}

export interface CapNhatDanhMucBody {
  ten_danh_muc: string;
}

export interface LayTatCaDanhMucResponse {
  status: "success";
  results: number;
  data: DanhMuc[];
}

export interface LayDanhMucTheoIdResponse {
  status: "success";
  data: DanhMuc;
}

export interface TaoDanhMucResponse {
  status: "success";
  message: string;
  data: DanhMuc;
}

export interface CapNhatDanhMucResponse {
  status: "success";
  message: string;
  data: DanhMuc;
}

export interface XoaDanhMucResponse {
  status: "success";
  message: string;
}
