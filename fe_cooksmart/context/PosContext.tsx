'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { HoaDon } from '@/types/hoaDon';
import { hoaDonService } from '@/services/hoaDon.service';
import { io } from 'socket.io-client';

export interface CartItem {
  id_mon_an: string;
  ten_mon: string;
  gia_tien: number;
  hinh_anh_mon?: string | null;
  so_luong: number;
  ghi_chu?: string;
}

interface PosContextType {
  selectedTable: { id: string; so_ban: string } | null;
  setSelectedTable: (table: { id: string; so_ban: string } | null) => void;
  activeOrder: HoaDon | null;
  isLoadingOrder: boolean;
  refreshActiveOrder: () => Promise<void>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id_mon_an: string) => void;
  updateQuantity: (id_mon_an: string, delta: number) => void;
  updateNote: (id_mon_an: string, note: string) => void;
  clearCart: () => void;
  // Shift management
  currentShift: any | null;
  setCurrentShift: (shift: any | null) => void;
  hasActiveShift: boolean;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children }: { children: ReactNode }) {
  const [selectedTable, setSelectedTable] = useState<{ id: string; so_ban: string } | null>(null);
  const [activeOrder, setActiveOrder] = useState<HoaDon | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  
  // Lưu trữ nhiều giỏ hàng, mỗi bàn một giỏ
  const [carts, setCarts] = useState<Record<string, CartItem[]>>({});

  // Giỏ hàng hiện tại dựa trên bàn đang chọn
  const cart = selectedTable ? (carts[selectedTable.id] || []) : [];

  const fetchActiveOrder = useCallback(async (id_ban: string) => {
    setIsLoadingOrder(true);
    try {
      const invoices = await hoaDonService.getAll({ id_ban });
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

  // --- BẮT ĐẦU CODE MỚI THÊM: SOCKET REALTIME CHO TRẠNG THÁI MÓN ---
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    socket.on('cap_nhat_trang_thai_mon', (payload: any) => {
      // payload = { id_hoa_don, id_chi_tiet, trang_thai_mon }
      setActiveOrder((prev) => {
        // Nếu POS hiện tại không mở đúng hóa đơn này thì bỏ qua
        if (!prev || prev.id !== payload.id_hoa_don) return prev;

        // Nếu đúng hóa đơn, cập nhật trạng thái món ngay lập tức
        return {
          ...prev,
          ChiTietHoaDons: prev.ChiTietHoaDons?.map(item =>
            item.id === payload.id_chi_tiet
              ? { ...item, trang_thai_mon: payload.trang_thai_mon }
              : item
          )
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  // --- KẾT THÚC CODE MỚI THÊM ---

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

  const addToCart = (newItem: CartItem) => {
    if (!selectedTable) return;
    
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      
      const existing = currentTableCart.find(
        (item) => item.id_mon_an === newItem.id_mon_an && item.ghi_chu === newItem.ghi_chu
      );
      
      let updatedCart;
      if (existing) {
        updatedCart = currentTableCart.map((item) =>
          item.id_mon_an === newItem.id_mon_an && item.ghi_chu === newItem.ghi_chu
            ? { ...item, so_luong: item.so_luong + newItem.so_luong }
            : item
        );
      } else {
        updatedCart = [...currentTableCart, newItem];
      }
      
      return { ...prev, [tableId]: updatedCart };
    });
  };

  const removeFromCart = (id_mon_an: string) => {
    if (!selectedTable) return;
    
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      const updatedCart = currentTableCart.filter((item) => item.id_mon_an !== id_mon_an);
      return { ...prev, [tableId]: updatedCart };
    });
  };

  const updateQuantity = (id_mon_an: string, delta: number) => {
    if (!selectedTable) return;
    
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      const updatedCart = currentTableCart.map((item) => {
        if (item.id_mon_an === id_mon_an) {
          const newQuantity = Math.max(1, item.so_luong + delta);
          return { ...item, so_luong: newQuantity };
        }
        return item;
      });
      return { ...prev, [tableId]: updatedCart };
    });
  };

  const updateNote = (id_mon_an: string, note: string) => {
    if (!selectedTable) return;
    
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      const updatedCart = currentTableCart.map((item) => 
        (item.id_mon_an === id_mon_an ? { ...item, ghi_chu: note } : item)
      );
      return { ...prev, [tableId]: updatedCart };
    });
  };

  const clearCart = () => {
    if (selectedTable) {
      setCarts((prev) => {
        const tableId = selectedTable.id;
        return { ...prev, [tableId]: [] };
      });
    }
  };

  // Shift Management State
  const [currentShift, setCurrentShift] = useState<any | null>(null);
  const hasActiveShift = !!currentShift;

  return (
    <PosContext.Provider
      value={{
        selectedTable,
        setSelectedTable,
        activeOrder,
        isLoadingOrder,
        refreshActiveOrder,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNote,
        clearCart,
        currentShift,
        setCurrentShift,
        hasActiveShift,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);
  if (context === undefined) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
}
