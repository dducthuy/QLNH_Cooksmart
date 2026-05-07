export interface ThongKeNhanh {
    doanhThuThuan: number;
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

export interface DashboardData {
    thongKeNhanh: ThongKeNhanh;
    doanhThuTheoGio: DoanhThuTheoGio[];
    topMonBanChay: TopMonBanChay[];
}
