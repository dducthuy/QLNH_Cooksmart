"use client";

import React, { useState } from "react";
import TableGrid from "@/components/pos/TableGrid";
import MenuSection from "@/components/pos/MenuSection";
import OrderCart from "@/components/pos/OrderCart";
import PendingOrdersPanel from "@/components/pos/PendingOrdersPanel";
import ShiftModal from "@/components/pos/ShiftModal";
import ComboDetailModal from "@/components/ui/ComboDetailModal";
import PosHeader from "@/components/pos/PosHeader";
import {
  LayoutGrid,
  UtensilsCrossed,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { usePosLogic } from "@/hooks/pos/usePosLogic";

export default function PosPage() {
  const [mobileTab, setMobileTab] = useState<"tables" | "menu" | "cart" | "pending">("menu");

  const {
    // Ca làm việc
    isInitialShiftCheckDone,
    currentShift,
    hasActiveShift,
    isShiftModalOpen, setIsShiftModalOpen,
    shiftMode, setShiftMode,
    refreshShiftStatus,
    // Combo
    viewingCombo, setViewingCombo,
    // Thông báo & đơn chờ
    pendingOrdersCount, setPendingOrdersCount,
    isPendingOrdersOpen, setIsPendingOrdersOpen,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    playNotificationSound,
    // Bàn & đơn hàng
    selectedTable, setSelectedTable,
    activeOrder,
    isLoadingOrder,
    refreshActiveOrder,
    // Giỏ hàng
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    clearCart,
  } = usePosLogic();

  const isCheckingShift = !isInitialShiftCheckDone;

  if (isCheckingShift) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f8f9fc]">
        <Loader2 size={48} className="animate-spin text-amber-500 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
          Đang tải cấu hình máy POS...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <PosHeader
        hasActiveShift={hasActiveShift}
        currentShift={currentShift}
        setIsShiftModalOpen={setIsShiftModalOpen}
        setShiftMode={setShiftMode}
        refreshShiftStatus={refreshShiftStatus}
        pendingOrdersCount={pendingOrdersCount}
        setIsPendingOrdersOpen={setIsPendingOrdersOpen}
        notifications={notifications}
      />

      <div className="flex flex-col lg:flex-row w-full h-full bg-[#f8f9fc] p-0 lg:p-4 gap-0 lg:gap-4 overflow-hidden relative">
        {/* Cột 1: Quản lý Bàn Ăn */}
        <div
          className={`w-full lg:w-[25%] bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col h-full ${mobileTab === "tables" ? "flex" : "hidden lg:flex"
            }`}
        >
          <TableGrid
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
          />
        </div>

        {/* Cột 2: Thực Đơn & Chọn Món */}
        <div
          className={`flex-1 bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col relative z-0 h-full ${mobileTab === "menu" ? "flex" : "hidden lg:flex"
            }`}
        >
          <MenuSection
            addToCart={addToCart}
            setViewingCombo={setViewingCombo}
          />
        </div>

        {/* Cột 3: Giỏ Hàng & Thanh Toán */}
        <div
          className={`w-full lg:w-[25%] bg-white lg:rounded-3xl border-0 lg:border border-gray-100 shadow-sm overflow-hidden flex-col z-10 h-full ${mobileTab === "cart" ? "flex" : "hidden lg:flex"
            }`}
        >
          <OrderCart
            cart={cart}
            activeOrder={activeOrder}
            isLoadingOrder={isLoadingOrder}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            updateNote={updateNote}
            clearCart={clearCart}
            selectedTable={selectedTable}
            refreshActiveOrder={refreshActiveOrder}
            hasActiveShift={hasActiveShift}
            playNotificationSound={playNotificationSound}
            setViewingCombo={setViewingCombo}
          />
        </div>

        <PendingOrdersPanel
          pendingOrdersCount={pendingOrdersCount}
          setPendingOrdersCount={setPendingOrdersCount}
          isPendingOrdersOpen={isPendingOrdersOpen}
          setIsPendingOrdersOpen={setIsPendingOrdersOpen}
          notifications={notifications}
          removeNotification={removeNotification}
          clearNotifications={clearNotifications}
          playNotificationSound={playNotificationSound}
          refreshActiveOrder={refreshActiveOrder}
        />

        <div className="lg:hidden shrink-0 flex items-center justify-around bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] p-2 pb-safe z-50">
          <button
            onClick={() => setMobileTab("tables")}
            className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all ${mobileTab === "tables"
              ? "text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <LayoutGrid size={22} className="mb-1.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Bàn Ăn
            </span>
          </button>
          <button
            onClick={() => setMobileTab("menu")}
            className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all ${mobileTab === "menu"
              ? "text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <UtensilsCrossed size={22} className="mb-1.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Thực Đơn
            </span>
          </button>
          <button
            onClick={() => setMobileTab("cart")}
            className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all relative ${mobileTab === "cart"
              ? "text-[#d9a01e] bg-[#d9a01e]/10 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <ShoppingBag size={22} className="mb-1.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Giỏ Hàng
            </span>
          </button>
        </div>

        <ShiftModal
          isOpen={isShiftModalOpen}
          mode={shiftMode}
          currentShiftData={currentShift}
          onClose={() => {
            setIsShiftModalOpen(false);
          }}
          onSuccess={() => {
            refreshShiftStatus();
          }}
        />

        {viewingCombo && (
          <ComboDetailModal
            combo={viewingCombo}
            onClose={() => setViewingCombo(null)}
          />
        )}
      </div>
    </div>
  );
}
