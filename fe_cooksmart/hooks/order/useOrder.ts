import { useState } from 'react';
import { Combo } from '@/types/combo';
import { useMenuData } from './useMenuData';
import { useCart } from './useCart';
import { useMenuFilter } from './useMenuFilter';
import { useOrderActions } from './useOrderActions';

export * from './types';

export function useOrder(tableId: string | null) {
    const { tableInfo, monAnList, comboList, danhMucList, activeOrder, isLoading, error, setError } = useMenuData(tableId);
    
    const { cart, isCartOpen, setIsCartOpen, getQty, addToCart, removeFromCart, deleteFromCart, clearCart, totalItems, totalPrice } = useCart();
    
    const { searchTerm, setSearchTerm, selectedDanhMuc, setSelectedDanhMuc, filteredDishes, filteredCombos } = useMenuFilter(monAnList, comboList);
    
    const { isSubmitting, isPaying, orderSuccess, setOrderSuccess, handleDatMon, handleThanhToanZaloPay } = useOrderActions(
        tableId, cart, activeOrder, clearCart, () => setIsCartOpen(false), setError
    );

    const [viewingCombo, setViewingCombo] = useState<Combo | null>(null);

    return {
        tableInfo, danhMucList, selectedDanhMuc, setSelectedDanhMuc,
        searchTerm, setSearchTerm, cart, isCartOpen, setIsCartOpen,
        isLoading, isSubmitting, orderSuccess, setOrderSuccess,
        error, setError, activeOrder, viewingCombo, setViewingCombo,
        isPaying, getQty, addToCart, removeFromCart, deleteFromCart,
        totalItems, totalPrice, handleDatMon, handleThanhToanZaloPay,
        filteredDishes, filteredCombos
    };
}
