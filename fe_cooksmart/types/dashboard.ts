export interface ThongKeNhanh {
    doanhThuThuan: number;
    tongTienCost: number;
    tienLoi: number;
    soDonHang: number;
    tyLeLapDayBan: number;
    monDungBan: number;
}

export interface DoanhThuTheoGio {
    time: string;
    total: number;
}

export interface TopMonBanChay {
    name: string;
    sold: number;
}

export interface NguyenLieuSapHet {
    id: string;
    ten_nguyen_lieu: string;
    so_luong_ton: number;
    don_vi_tinh: string;
}

export interface DoanhThuTheoDanhMuc {
    name: string;
    value: number;
}

export interface DashboardData {
    thongKeNhanh: ThongKeNhanh;
    doanhThuTheoGio: DoanhThuTheoGio[];
    topMonBanChay: TopMonBanChay[];
    nguyenLieuSapHet: NguyenLieuSapHet[];
    doanhThuTheoDanhMuc: DoanhThuTheoDanhMuc[];
}
