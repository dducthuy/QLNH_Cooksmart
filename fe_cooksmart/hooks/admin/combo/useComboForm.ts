import { useState } from 'react';
import { uploadService } from '@/services/upload.service';
import { comboService } from '@/services/combo.service';
import { MonAn } from '@/types/monAn';
import { Combo } from '@/types/combo';

export function useComboForm(
    combo: Combo | null | undefined,
    dishes: MonAn[],
    onSuccess: () => void,
    showToast: (msg: string, type?: 'success' | 'error') => void
) {
    const [formData, setFormData] = useState<any>(combo ? {
        ...combo,
        chi_tiet_combo: combo.ChiTietCombos?.map((ct: any) => ({ id_mon_an: ct.id_mon_an, so_luong: ct.so_luong })) || []
    } : {
        ten_combo: '',
        gia_tien: undefined,
        hinh_anh_combo: '',
        mo_ta: '',
        trang_thai: true,
        chi_tiet_combo: []
    });

    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dishSearch, setDishSearch] = useState('');

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const res = await uploadService.uploadImage(file);
            setFormData({ ...formData, hinh_anh_combo: res.data.url });
        } catch { showToast('Tải ảnh thất bại!', 'error'); } finally { setIsUploading(false); }
    };

    const addDish = (dish: MonAn) => {
        if (formData.chi_tiet_combo.some((d: any) => d.id_mon_an === dish.id)) return;
        setFormData({
            ...formData,
            chi_tiet_combo: [...formData.chi_tiet_combo, { id_mon_an: dish.id, so_luong: 1, ten_mon: dish.ten_mon }]
        });
    };

    const removeDish = (id_mon_an: string) => {
        setFormData({
            ...formData,
            chi_tiet_combo: formData.chi_tiet_combo.filter((d: any) => d.id_mon_an !== id_mon_an)
        });
    };

    const updateDishQty = (id_mon_an: string, delta: number) => {
        setFormData({
            ...formData,
            chi_tiet_combo: formData.chi_tiet_combo.map((d: any) =>
                d.id_mon_an === id_mon_an ? { ...d, so_luong: Math.max(1, d.so_luong + delta) } : d
            )
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.chi_tiet_combo.length === 0) return showToast('Vui lòng chọn ít nhất một món!', 'error');
        try {
            setIsSubmitting(true);

            const payload = {
                ten_combo: formData.ten_combo,
                gia_tien: formData.gia_tien,
                hinh_anh_combo: formData.hinh_anh_combo,
                mo_ta: formData.mo_ta,
                trang_thai: formData.trang_thai,
                chi_tiet_combo: formData.chi_tiet_combo.map((ct: any) => ({
                    id_mon_an: ct.id_mon_an,
                    so_luong: ct.so_luong
                }))
            };

            if (combo) await comboService.update(combo.id, payload);
            else await comboService.create(payload);

            showToast('Lưu combo thành công!');
            onSuccess();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally { setIsSubmitting(false); }
    };

    const filteredDishes = dishes.filter((d: MonAn) =>
        d.ten_mon.toLowerCase().includes(dishSearch.toLowerCase()) &&
        !formData.chi_tiet_combo.some((ct: any) => ct.id_mon_an === d.id)
    );

    return {
        formData, setFormData,
        isUploading, isSubmitting,
        dishSearch, setDishSearch,
        handleUpload, addDish, removeDish, updateDishQty,
        handleSubmit, filteredDishes
    };
}
