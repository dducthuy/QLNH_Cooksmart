import { useState, useEffect, useCallback } from 'react';
import { promotionService } from '@/services/promotion.service';
import { KhuyenMai } from '@/types/khuyenMai';

export function usePromotionManagement(showToast: (msg: string, type?: 'success' | 'error') => void) {
    const [promotions, setPromotions] = useState<KhuyenMai[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<KhuyenMai | null>(null);
    const [deletingPromotion, setDeletingPromotion] = useState<KhuyenMai | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPromotions = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await promotionService.getAll();
            setPromotions(data);
        } catch {
            if (!silent) showToast('Không thể tải danh sách khuyến mãi!', 'error');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

    const handleAdd = () => { setEditingPromotion(null); setIsFormOpen(true); };
    const handleEdit = (promotion: KhuyenMai) => { setEditingPromotion(promotion); setIsFormOpen(true); };
    const handleDeleteClick = (promotion: KhuyenMai) => setDeletingPromotion(promotion);

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const payload = {
                ma_km: data.ma_km.trim().toUpperCase(),
                ten_km: data.ten_km.trim(),
                loai_km: data.loai_km,
                gia_tri_km: Number(data.gia_tri_km),
                gia_tri_dh_toi_thieu: Number(data.gia_tri_dh_toi_thieu || 0),
                ngay_bat_dau: data.ngay_bat_dau,
                ngay_ket_thuc: data.ngay_ket_thuc,
                trang_thai: data.trang_thai,
                so_luong: Number(data.so_luong || 0),
            };
            if (editingPromotion) {
                await promotionService.update(editingPromotion.id, payload);
                showToast(`Đã cập nhật khuyến mãi "${data.ten_km}" thành công!`);
            } else {
                await promotionService.create(payload);
                showToast(`Đã thêm khuyến mãi "${data.ten_km}" thành công!`);
            }
            setIsFormOpen(false);
            fetchPromotions();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingPromotion) return;
        try {
            setIsDeleting(true);
            await promotionService.delete(deletingPromotion.id);
            showToast(`Đã xóa khuyến mãi "${deletingPromotion.ten_km}" thành công!`);
            setDeletingPromotion(null);
            fetchPromotions();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = promotions.filter((p) => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = p.ten_km.toLowerCase().includes(searchLower) || p.ma_km.toLowerCase().includes(searchLower);
        const matchStatus = filterStatus === 'all' 
            ? true 
            : filterStatus === 'active' ? p.trang_thai : !p.trang_thai;
        return matchSearch && matchStatus;
    });

    const statItems = [
        { label: 'Tổng Khuyến Mãi', value: promotions.length, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Đang Hoạt Động', value: promotions.filter(p => p.trang_thai).length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Đã Ngừng', value: promotions.filter(p => !p.trang_thai).length, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    ];

    return {
        promotions, isLoading, searchTerm, setSearchTerm, filterStatus, setFilterStatus,
        isFormOpen, setIsFormOpen, editingPromotion, deletingPromotion, setDeletingPromotion,
        isSubmitting, isDeleting,
        fetchPromotions, handleAdd, handleEdit, handleDeleteClick,
        handleFormSubmit, handleConfirmDelete, filtered, statItems
    };
}
