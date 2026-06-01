import { useState, useCallback } from "react";

export interface CartItem {
  id_mon_an?: string;
  id_combo?: string;
  ten_mon: string;
  gia_tien: number;
  hinh_anh_mon?: string | null;
  so_luong: number;
  ghi_chu?: string;
}
// prev = carts ht
export function useCartManager(selectedTable: { id: string } | null) {
  const [carts, setCarts] = useState<Record<string, CartItem[]>>({});
  const cart = selectedTable ? (carts[selectedTable.id] || []) : [];

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
      // (...) để copy toàn bộ giỏ hàng cũ.
      //Thêm newItem vào cuối mảng.
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

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    clearCart
  };
}
