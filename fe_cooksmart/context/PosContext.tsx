'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { HoaDon } from '@/types/hoaDon';
import { hoaDonService } from '@/services/hoaDon.service';
import { ketCaService } from '@/services/ketCa.service';
import { useSocket } from './SocketContext';

export interface CartItem {
  id_mon_an?: string;
  id_combo?: string;
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
  removeFromCart: (id: string, isCombo?: boolean) => void;
  updateQuantity: (id: string, delta: number, isCombo?: boolean) => void;
  updateNote: (id: string, note: string, isCombo?: boolean) => void;
  clearCart: () => void;
  // Shift management
  currentShift: any | null;
  setCurrentShift: (shift: any | null) => void;
  hasActiveShift: boolean;
  refreshShiftStatus: () => Promise<void>;
  isInitialShiftCheckDone: boolean;
  // Modal control
  isShiftModalOpen: boolean;
  setIsShiftModalOpen: (open: boolean) => void;
  shiftMode: 'OPEN' | 'CLOSE';
  setShiftMode: (mode: 'OPEN' | 'CLOSE') => void;
  // Pending orders
  pendingOrdersCount: number;
  setPendingOrdersCount: (count: number) => void;
  isPendingOrdersOpen: boolean;
  setIsPendingOrdersOpen: (open: boolean) => void;
  // Notifications
  notifications: any[];
  addNotification: (noti: any) => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
  // Combo view
  viewingCombo: any | null;
  setViewingCombo: (combo: any | null) => void;
  // Sound
  playNotificationSound: () => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children }: { children: ReactNode }) {
  const [selectedTable, setSelectedTable] = useState<{ id: string; so_ban: string } | null>(null);
  const [activeOrder, setActiveOrder] = useState<HoaDon | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);


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

  // Shift Management State
  const [currentShift, setCurrentShift] = useState<any | null>(null);
  const [isInitialShiftCheckDone, setIsInitialShiftCheckDone] = useState(false);
  const hasActiveShift = !!currentShift;

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftMode, setShiftMode] = useState<'OPEN' | 'CLOSE'>('OPEN');

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isPendingOrdersOpen, setIsPendingOrdersOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [viewingCombo, setViewingCombo] = useState<any | null>(null);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pos_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi parse thông báo từ localStorage", e);
      }
    }
  }, []);

  const { socket } = useSocket();

  // Cơ chế "mở khóa" âm thanh
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  useEffect(() => {
    const unlock = () => {
      if (!isAudioUnlocked) {
        const audio = new Audio();
        audio.play().then(() => {
          setIsAudioUnlocked(true);
          window.removeEventListener('click', unlock);
        }).catch(() => {

        });
      }
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, [isAudioUnlocked]);

  const playNotificationSound = useCallback(() => {
    if (!isAudioUnlocked) return;

    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => {
        if (e.name !== 'NotAllowedError') {
          console.error("Lỗi phát âm thanh:", e);
        }
      });
    } catch (err) {

    }
  }, [isAudioUnlocked]);

  const addNotification = useCallback((noti: any) => {
    setNotifications(prev => {
      const updated = [noti, ...prev].slice(0, 50);
      localStorage.setItem('pos_notifications', JSON.stringify(updated));
      return updated;
    });
    playNotificationSound();
  }, [playNotificationSound]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('pos_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('pos_notifications');
  }, []);


  useEffect(() => {
    if (!socket) return;

    const handleDishDone = (data: any) => {
      console.log("🔔 Nhận thông báo món xong:", data);
      if (data.trang_thai_mon === 'DaXong') {
        addNotification({
          id: Date.now(),
          type: 'DISH_DONE',
          message: `${data.so_ban}: ${data.ten_mon} đã xong!`,
          data: data,
          time: new Date()
        });
      }
    };

    socket.on('trang_thai_mon_da_doi', handleDishDone);

    // Lắng nghe đơn QR mới chờ duyệt
    const handleNewQROrder = (data: any) => {
      console.log("🔔 Nhận thông báo đơn QR mới:", data);


      playNotificationSound();


      setPendingOrdersCount(prev => prev + 1);
    };

    socket.on('don_qr_cho_duyet', handleNewQROrder);

    return () => {
      socket.off('trang_thai_mon_da_doi', handleDishDone);
      socket.off('don_qr_cho_duyet', handleNewQROrder);
    };
  }, [socket, addNotification]);

  const refreshShiftStatus = useCallback(async () => {
    try {
      const res = await ketCaService.getCaHienTai();
      setCurrentShift(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCurrentShift(null);
      }
    } finally {
      setIsInitialShiftCheckDone(true);
    }
  }, []);


  useEffect(() => {
    if (!socket) return;

    const handleDishUpdate = (payload: any) => {
      setActiveOrder((prev) => {
        if (!prev) return prev;
        if (prev.id === payload.id_hoa_don) {
          return {
            ...prev,
            ChiTietHoaDons: prev.ChiTietHoaDons?.map(item =>
              item.id === payload.id_chi_tiet
                ? { ...item, trang_thai_mon: payload.trang_thai_mon }
                : item
            )
          };
        }
        return prev;
      });


      setTimeout(() => {
        if (selectedTable && selectedTable.id === payload.id_ban) {
          fetchActiveOrder && fetchActiveOrder(payload.id_ban);
        } else if (payload.id_ban) {
          fetchActiveOrder && fetchActiveOrder(payload.id_ban);
        }
      }, 300);
    };

    socket.on('trang_thai_mon_da_doi', handleDishUpdate);

    socket.on('cap_nhat_ca', (payload: any) => {
      console.log("🔄 Nhận thông báo cập nhật ca từ Socket:", payload.status);
      refreshShiftStatus();
    });

    return () => {
      socket.off('trang_thai_mon_da_doi', handleDishUpdate);
      socket.off('cap_nhat_ca');
    };
  }, [socket, refreshShiftStatus, selectedTable, fetchActiveOrder]);

  useEffect(() => {
    refreshShiftStatus();
  }, [refreshShiftStatus]);

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

  const addToCart = useCallback((newItem: CartItem) => {
    if (!selectedTable) return;
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      const existingItemIndex = currentTableCart.findIndex((item) =>
        (newItem.id_mon_an && item.id_mon_an === newItem.id_mon_an) ||
        (newItem.id_combo && item.id_combo === newItem.id_combo)
      );

      let updatedCart;
      if (existingItemIndex > -1) {
        updatedCart = currentTableCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, so_luong: item.so_luong + newItem.so_luong }
            : item
        );
      } else {
        updatedCart = [...currentTableCart, newItem];
      }
      return { ...prev, [tableId]: updatedCart };
    });
  }, [selectedTable]);

  const removeFromCart = useCallback((id: string, isCombo: boolean = false) => {
    if (!selectedTable) return;
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      const updatedCart = currentTableCart.filter((item) => isCombo ? item.id_combo !== id : item.id_mon_an !== id);
      return { ...prev, [tableId]: updatedCart };
    });
  }, [selectedTable]);

  const updateQuantity = useCallback((id: string, delta: number, isCombo: boolean = false) => {
    if (!selectedTable) return;
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      const updatedCart = currentTableCart.map((item) => {
        const match = isCombo ? item.id_combo === id : item.id_mon_an === id;
        if (match) {
          const newQuantity = Math.max(1, item.so_luong + delta);
          return { ...item, so_luong: newQuantity };
        }
        return item;
      });
      return { ...prev, [tableId]: updatedCart };
    });
  }, [selectedTable]);

  const updateNote = (id: string, note: string, isCombo: boolean = false) => {
    if (!selectedTable) return;
    setCarts((prev) => {
      const tableId = selectedTable.id;
      const currentTableCart = prev[tableId] || [];
      const updatedCart = currentTableCart.map((item) => {
        const match = isCombo ? item.id_combo === id : item.id_mon_an === id;
        return match ? { ...item, ghi_chu: note } : item;
      });
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
        refreshShiftStatus,
        isInitialShiftCheckDone,
        isShiftModalOpen,
        setIsShiftModalOpen,
        shiftMode,
        setShiftMode,
        pendingOrdersCount,
        setPendingOrdersCount,
        isPendingOrdersOpen,
        setIsPendingOrdersOpen,
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        viewingCombo,
        setViewingCombo,
        playNotificationSound,
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
