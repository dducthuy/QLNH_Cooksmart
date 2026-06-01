import http from '@/lib/http';
import type {
    DinhMucMonAn,
    TaoDinhMucBody,
    CapNhatDinhMucBody,
    LayDinhMucTheoMonAnResponse,
    TaoDinhMucResponse,
    CapNhatDinhMucResponse,
    XoaDinhMucResponse,
} from '@/types/dinhMucMonAn';

const BASE = '/dinh-muc-mon-an';

/** Response cho endpoint voi-chi-phi */
export interface DinhMucVoiChiPhi {
    id: string;
    luong_tieu_hao: number;
    don_vi_tinh?: string;
    NguyenLieu: {
        id: string;
        ten_nguyen_lieu: string;
        don_vi_tinh: string | null;
        gia_von_binh_quan: number;
        gia_nhap_gan_nhat: number;
    } | null;
    don_gia_von: number;
    chi_phi: number;
}

export interface LayDinhMucVoiChiPhiResponse {
    status: 'success';
    mon_an: {
        id: string;
        ten_mon: string;
        gia_tien: number;
    };
    results: number;
    data: DinhMucVoiChiPhi[];
    tong_chi_phi: number;
    ty_le_cost: number;
}

export const dinhMucService = {
    /** Lấy định mức theo món ăn (không có chi phí) */
    getByMonAn: async (id_mon_an: string): Promise<LayDinhMucTheoMonAnResponse> => {
        const res = await http.get<LayDinhMucTheoMonAnResponse>(`${BASE}/mon-an/${id_mon_an}`);
        return res.data;
    },

    /** Lấy định mức kèm chi phí và tỷ lệ cost */
    getByMonAnVoiChiPhi: async (id_mon_an: string): Promise<LayDinhMucVoiChiPhiResponse> => {
        const res = await http.get<LayDinhMucVoiChiPhiResponse>(`${BASE}/mon-an/${id_mon_an}/voi-chi-phi`);
        return res.data;
    },

    /** Thêm định mức mới */
    create: async (body: TaoDinhMucBody): Promise<TaoDinhMucResponse> => {
        const res = await http.post<TaoDinhMucResponse>(BASE, body);
        return res.data;
    },

    /** Cập nhật lượng tiêu hao */
    update: async (id: string, body: CapNhatDinhMucBody): Promise<CapNhatDinhMucResponse> => {
        const res = await http.patch<CapNhatDinhMucResponse>(`${BASE}/${id}`, body);
        return res.data;
    },

    /** Xóa định mức */
    delete: async (id: string): Promise<XoaDinhMucResponse> => {
        const res = await http.delete<XoaDinhMucResponse>(`${BASE}/${id}`);
        return res.data;
    },
};
