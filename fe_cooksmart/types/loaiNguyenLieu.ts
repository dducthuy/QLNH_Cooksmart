export interface LoaiNguyenLieu {
  id: string;
  ten_loai: string;
}

export interface TaoLoaiNguyenLieuBody {
  ten_loai: string;
}

export interface CapNhatLoaiNguyenLieuBody {
  ten_loai?: string;
}

export interface BaseResponse {
  status: string;
  message?: string;
}

export interface LayTatCaLoaiNguyenLieuResponse extends BaseResponse {
  results: number;
  data: LoaiNguyenLieu[];
}

export interface LayLoaiNguyenLieuTheoIdResponse extends BaseResponse {
  data: LoaiNguyenLieu;
}

export interface TaoLoaiNguyenLieuResponse extends BaseResponse {
  data: LoaiNguyenLieu;
}

export interface CapNhatLoaiNguyenLieuResponse extends BaseResponse {
  data: LoaiNguyenLieu;
}

export interface XoaLoaiNguyenLieuResponse extends BaseResponse {}
