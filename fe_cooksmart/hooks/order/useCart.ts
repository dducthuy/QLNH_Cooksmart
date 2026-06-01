import { useState } from 'react';
import { CartItem } from './types';

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const getQty = (id: string) => cart.find(c => c.id === id)?.so_luong ?? 0;

    const addToCart = (item: any, isCombo = false) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) return prev.map(c => c.id === item.id ? { ...c, so_luong: c.so_luong + 1 } : c);

            const cartItem: CartItem = {
                id: item.id,
                ten_mon: isCombo ? item.ten_combo : item.ten_mon,
                gia_tien: item.gia_tien,
                hinh_anh_mon: isCombo ? item.hinh_anh_combo : item.hinh_anh_mon,
                so_luong: 1
            };
            if (isCombo) cartItem.id_combo = item.id;
            else cartItem.id_mon_an = item.id;

            return [...prev, cartItem];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === id);
            if (!existing) return prev;
            if (existing.so_luong <= 1) return prev.filter(c => c.id !== id);
            return prev.map(c => c.id === id ? { ...c, so_luong: c.so_luong - 1 } : c);
        });
    };

    const deleteFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((s, i) => s + i.so_luong, 0);
    const totalPrice = cart.reduce((s, i) => s + i.gia_tien * i.so_luong, 0);

    return { cart, isCartOpen, setIsCartOpen, getQty, addToCart, removeFromCart, deleteFromCart, clearCart, totalItems, totalPrice };
}
