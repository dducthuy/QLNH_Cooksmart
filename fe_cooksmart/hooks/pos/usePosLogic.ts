import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext";
import { useNotifications } from "./useNotifications";
import { useShiftManager } from "./useShiftManager";
import { useTableOrder } from "./useTableOrder";
import { useCartManager } from "./useCartManager";
export type { CartItem } from "./useCartManager";

export function usePosLogic() {
  const { isThuNgan, isAdmin } = useAuth();
  const { socket } = useSocket();

  // 1. Quản lý ca
  const shiftManager = useShiftManager({ isAdmin, isThuNgan });

  // 2. Notifications & UI
  const [viewingCombo, setViewingCombo] = useState<any | null>(null);
  const notificationsManager = useNotifications();

  // 3. Quản lý Bàn và Hóa đơn
  const tableOrder = useTableOrder();

  // 4. Quản lý Giỏ hàng
  const cartManager = useCartManager(tableOrder.selectedTable);

  // 5. Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleDishUpdate = (payload: any) => {
      tableOrder.setActiveOrder((prev) => {
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
        if (tableOrder.selectedTable && tableOrder.selectedTable.id === payload.id_ban) {
          tableOrder.fetchActiveOrder && tableOrder.fetchActiveOrder(payload.id_ban);
        } else if (payload.id_ban) {
          tableOrder.fetchActiveOrder && tableOrder.fetchActiveOrder(payload.id_ban);
        }
      }, 300);
    };

    const handleShiftUpdate = (payload: any) => {
      console.log("🔄 Nhận thông báo cập nhật ca từ Socket:", payload.status);
      shiftManager.refreshShiftStatus();
    };

    socket.on('trang_thai_mon_da_doi', handleDishUpdate);
    socket.on('cap_nhat_ca', handleShiftUpdate);

    return () => {
      socket.off('trang_thai_mon_da_doi', handleDishUpdate);
      socket.off('cap_nhat_ca', handleShiftUpdate);
    };
  }, [socket, shiftManager.refreshShiftStatus, tableOrder.selectedTable, tableOrder.fetchActiveOrder, tableOrder.setActiveOrder]);

  return {
    // Từ Shift Manager
    isInitialShiftCheckDone: shiftManager.isInitialShiftCheckDone,
    currentShift: shiftManager.currentShift,
    hasActiveShift: shiftManager.hasActiveShift,
    isShiftModalOpen: shiftManager.isShiftModalOpen,
    setIsShiftModalOpen: shiftManager.setIsShiftModalOpen,
    shiftMode: shiftManager.shiftMode,
    setShiftMode: shiftManager.setShiftMode,
    refreshShiftStatus: shiftManager.refreshShiftStatus,

    // UI state
    viewingCombo,
    setViewingCombo,

    // Từ Notifications
    pendingOrdersCount: notificationsManager.pendingOrdersCount,
    setPendingOrdersCount: notificationsManager.setPendingOrdersCount,
    isPendingOrdersOpen: notificationsManager.isPendingOrdersOpen,
    setIsPendingOrdersOpen: notificationsManager.setIsPendingOrdersOpen,
    notifications: notificationsManager.notifications,
    addNotification: notificationsManager.addNotification,
    removeNotification: notificationsManager.removeNotification,
    clearNotifications: notificationsManager.clearNotifications,
    playNotificationSound: notificationsManager.playNotificationSound,

    // Từ Table Order
    selectedTable: tableOrder.selectedTable,
    setSelectedTable: tableOrder.setSelectedTable,
    activeOrder: tableOrder.activeOrder,
    isLoadingOrder: tableOrder.isLoadingOrder,
    refreshActiveOrder: tableOrder.refreshActiveOrder,

    // Từ Cart
    cart: cartManager.cart,
    addToCart: cartManager.addToCart,
    removeFromCart: cartManager.removeFromCart,
    updateQuantity: cartManager.updateQuantity,
    updateNote: cartManager.updateNote,
    clearCart: cartManager.clearCart,
  };
}
