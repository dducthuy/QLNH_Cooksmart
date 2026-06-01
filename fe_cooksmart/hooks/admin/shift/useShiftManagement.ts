import { useState, useEffect, useCallback } from 'react';
import { adminKetCaService } from '@/services/adminKetCa.service';
import { KetCa, DashboardSummary } from '@/types/ketCa';

const LIMIT = 10;

export function useShiftManagement(showToast: (msg: string, type?: 'success' | 'error') => void) {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [shifts, setShifts] = useState<KetCa[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
    const [tuNgay, setTuNgay] = useState('');
    const [denNgay, setDenNgay] = useState('');
    const [page, setPage] = useState(1);
    const [selectedCa, setSelectedCa] = useState<KetCa | null>(null);

    const fetchSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        try {
            const res = await adminKetCaService.getDashboardSummary({
                tuNgay: tuNgay || undefined,
                denNgay: denNgay || undefined,
            });
            setSummary(res.data);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [tuNgay, denNgay]);

    const fetchShifts = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await adminKetCaService.getLichSuCa({
                status: filterStatus === 'all' ? undefined : filterStatus,
                tuNgay: tuNgay || undefined,
                denNgay: denNgay || undefined,
                limit: LIMIT,
                offset: (page - 1) * LIMIT,
            });
            setShifts(res.data);
            setTotal(res.total);
        } catch {
            showToast('Không thể tải danh sách ca', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, tuNgay, denNgay, page, showToast]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);
    useEffect(() => { setPage(1); }, [filterStatus, tuNgay, denNgay]);
    useEffect(() => { fetchShifts(); }, [fetchShifts]);

    const handleRefresh = () => { fetchSummary(); fetchShifts(); };

    const filtered = search.trim()
        ? shifts.filter(s => s.NguoiDung?.ho_ten?.toLowerCase().includes(search.toLowerCase()))
        : shifts;

    const totalPages = Math.ceil(total / LIMIT);

    return {
        summary, isLoadingSummary, shifts, total, isLoading,
        search, setSearch, filterStatus, setFilterStatus, tuNgay, setTuNgay, denNgay, setDenNgay,
        page, setPage, selectedCa, setSelectedCa, LIMIT, totalPages, filtered, handleRefresh,
        fetchSummary, fetchShifts
    };
}
