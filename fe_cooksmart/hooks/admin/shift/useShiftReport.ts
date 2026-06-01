import { useState, useEffect } from 'react';
import { adminKetCaService } from '@/services/adminKetCa.service';
import { KetCa, BaoCaoChiTietCa } from '@/types/ketCa';

export function useShiftReport(
    ca: KetCa, 
    onSuccess: () => void, 
    onClose: () => void, 
    showToast: (msg: string, type?: 'success' | 'error') => void
) {
    const [report, setReport] = useState<BaoCaoChiTietCa | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ghiChu, setGhiChu] = useState(ca.ghi_chu_kiem_duyet ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        adminKetCaService.getBaoCaoChiTiet(ca.id)
            .then(res => setReport(res.data))
            .catch(() => showToast('Không thể tải báo cáo ca', 'error'))
            .finally(() => setIsLoading(false));
    }, [ca.id, showToast]);

    const handleKiemDuyet = async () => {
        try {
            setIsSubmitting(true);
            await adminKetCaService.kiemDuyetCa(ca.id, ghiChu);
            showToast('Kiểm duyệt ca thành công!', 'success');
            onSuccess();
            onClose();
        } catch {
            showToast('Kiểm duyệt thất bại', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        report, isLoading, ghiChu, setGhiChu, isSubmitting, handleKiemDuyet
    };
}
