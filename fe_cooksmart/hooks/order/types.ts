export interface CartItem {
    id: string; // Internal unique ID for cart
    id_mon_an?: string;
    id_combo?: string;
    ten_mon: string;
    gia_tien: number;
    hinh_anh_mon: string | null;
    so_luong: number;
}
