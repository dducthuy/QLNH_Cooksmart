import { useState, useCallback, useEffect } from "react";
import { hoaDonService } from "@/services/hoaDon.service";
import { HoaDon } from "@/types/hoaDon";

export function useTableOrder() {
  const [selectedTable, setSelectedTable] = useState<{ id: string; so_ban: string } | null>(null);
  // hóa đơn bàn ht
  const [activeOrder, setActiveOrder] = useState<HoaDon | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const fetchActiveOrder = useCallback(async (id_ban: string) => {
    setIsLoadingOrder(true);
    try {
      const invoices = await hoaDonService.getAll({ id_ban });
      // lấy hóa đơn có trngaj thái
      const active = invoices.find(
        (i) => i.trang_thai_hd === 'DangPhucVu' || i.trang_thai_hd === 'ChoXuLy'
      );
      if (active) {
        const details = await hoaDonService.getById(active.id);
        setActiveOrder(details);
      } else {
        setActiveOrder(null);
      }
    } catch (error) {
      console.error('Lỗi tải hóa đơn bàn:', error);
      setActiveOrder(null);
    } finally {
      setIsLoadingOrder(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchActiveOrder(selectedTable.id);
    } else {
      setActiveOrder(null);
    }
  }, [selectedTable, fetchActiveOrder]);

  const refreshActiveOrder = async () => {
    if (selectedTable) {
      await fetchActiveOrder(selectedTable.id);
    }
  };

  return {
    selectedTable,
    setSelectedTable,
    activeOrder,
    setActiveOrder,
    isLoadingOrder,
    fetchActiveOrder,
    refreshActiveOrder
  };
}
