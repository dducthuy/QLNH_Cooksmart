import { useState, useMemo } from 'react';

export function useMenuFilter(monAnList: any[], comboList: any[]) {
    const [selectedDanhMuc, setSelectedDanhMuc] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDishes = useMemo(() => monAnList.filter(m => {
        const matchCat = selectedDanhMuc === 'all' || m.id_danh_muc === selectedDanhMuc;
        const matchSearch = m.ten_mon.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch && selectedDanhMuc !== 'combo' && m.con_hang;
    }), [monAnList, selectedDanhMuc, searchTerm]);

    const filteredCombos = useMemo(() => comboList.filter(c => {
        const matchSearch = c.ten_combo.toLowerCase().includes(searchTerm.toLowerCase());
        return (selectedDanhMuc === 'all' || selectedDanhMuc === 'combo') && matchSearch && c.trang_thai;
    }), [comboList, selectedDanhMuc, searchTerm]);

    return { selectedDanhMuc, setSelectedDanhMuc, searchTerm, setSearchTerm, filteredDishes, filteredCombos };
}
