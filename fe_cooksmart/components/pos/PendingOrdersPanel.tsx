"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Loader2,
  UtensilsCrossed,
  RefreshCw,
  Clock,
  Bell,
  X,
  PackageCheck,
} from "lucide-react";
import { hoaDonService } from "@/services/hoaDon.service";
import { HoaDon } from "@/types/hoaDon";


const vnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  return `${Math.floor(mins / 60)} giờ trước`;
}


// THÀNH PHẦN CON: TAB MÓN HOÀN THÀNH

function NotificationsTab({
  notifications,
  removeNotification,
  clearNotifications,
  refreshActiveOrder,
}: {
  notifications: any[];
  removeNotification: (id: string | number) => void;
  clearNotifications: () => void;
  refreshActiveOrder: () => Promise<void>;
}) {
  const dishNotifications = notifications.filter((n) => n.type === "DISH_DONE");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const handleTakeItem = async (noti: any) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(noti.id));
      await hoaDonService.updateItemStatus(noti.data.id_chi_tiet, 'DaLayDi');
      removeNotification(noti.id);
      await refreshActiveOrder();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi lấy món!");
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(noti.id);
        return next;
      });
    }
  };

  const handleTakeAll = async (hdId: string, items: any[]) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(hdId));
      await hoaDonService.layTatCa(hdId);
      items.forEach(noti => removeNotification(noti.id));
      await refreshActiveOrder();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi lấy tất cả món!");
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(hdId);
        return next;
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-1">
        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Món chờ lấy ({dishNotifications.length})
        </div>
        {dishNotifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest"
          >
            Xóa thông báo
          </button>
        )}
      </div>

      {dishNotifications.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center gap-3 text-center grayscale opacity-40">
          <UtensilsCrossed size={32} className="text-gray-300" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Chưa có món nào chờ lấy
          </p>
        </div>
      ) : (
        Object.entries(
          dishNotifications.reduce((acc: any, noti) => {
            const key = noti.data?.id_hoa_don || "other";
            if (!acc[key]) acc[key] = { so_ban: noti.data?.so_ban, items: [] };
            acc[key].items.push(noti);
            return acc;
          }, {}),
        ).map(([hdId, group]: [string, any]) => (
          <div
            key={hdId}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="bg-emerald-500 px-3 py-2 flex justify-between items-center">
              <p className="text-[11px] font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <UtensilsCrossed size={12} />
                {group.so_ban ? `BÀN ${group.so_ban}` : "MANG VỀ"}
              </p>
              <button
                onClick={() => handleTakeAll(hdId, group.items)}
                disabled={updatingIds.has(hdId)}
                className="flex items-center gap-1 text-[9px] font-black bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg text-white transition-colors active:scale-95 disabled:opacity-50 uppercase tracking-wider"
              >
                {updatingIds.has(hdId) ? <Loader2 size={10} className="animate-spin" /> : <PackageCheck size={10} />}
                Lấy Tất Cả
              </button>
            </div>
            <div className="p-2 space-y-1.5">
              {group.items.map((noti: any, idx: number) => (
                <div
                  key={`${noti.id}-${idx}`}
                  className="bg-white border border-emerald-100 rounded-xl p-2.5 flex items-center gap-3 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-emerald-900 leading-tight">
                      {noti.data?.ten_mon || "Món ăn"}
                    </p>
                    <p className="text-[9px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                      <Clock size={9} />
                      {timeAgo(noti.time)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTakeItem(noti)}
                    disabled={updatingIds.has(noti.id) || updatingIds.has(hdId)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                  >
                    {updatingIds.has(noti.id) ? <Loader2 size={12} className="animate-spin" /> : <PackageCheck size={12} />}
                    Lấy
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}




function OrdersTab({
  pendingOrders,
  isLoading,
  activeInvoices,
  processingId,
  handleReject,
  handleApprove,
}: {
  pendingOrders: HoaDon[];
  isLoading: boolean;
  activeInvoices: Record<string, HoaDon>;
  processingId: string | null;
  handleReject: (id: string) => void;
  handleApprove: (id: string) => void;
}) {
  return (
    <>
      <h3 className="text-[10px] font-black text-[#d9a01e] uppercase tracking-widest px-1">
        Đơn hàng cần duyệt ({pendingOrders.length})
      </h3>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-300">
          <Loader2 size={28} className="animate-spin text-[#d9a01e]/60" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Đang tải...
          </span>
        </div>
      ) : pendingOrders.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center gap-3 text-center grayscale opacity-40">
          <ClipboardList size={32} className="text-gray-300" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Không có đơn chờ
          </p>
        </div>
      ) : (
        pendingOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden ring-1 ring-[#d9a01e]/10"
          >
            {/* Top strip */}
            <div className="h-1 w-full bg-gradient-to-r from-[#d9a01e] to-amber-300" />
            <div className="p-3.5">
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-gray-800 text-base leading-none">
                    {order.BanAn?.so_ban
                      ? `BÀN ${order.BanAn.so_ban}`
                      : "Bàn không xác định"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock size={10} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {timeAgo(order.thoi_gian_tao)}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-[#d9a01e] border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Bell size={9} className="animate-pulse" />
                  Đơn QR
                </span>
              </div>

              {/* Existing Order Context */}
              {order.id_ban && activeInvoices[order.id_ban] && (
                <div className="mb-3">
                  <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Món đã gọi trước đó
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2 space-y-1">
                    {activeInvoices[order.id_ban].ChiTietHoaDons?.map(
                      (ct: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px]"
                        >
                          <span className="text-amber-800/60 font-medium flex-1 truncate">
                            {ct.MonAn?.ten_mon ||
                              ct.Combo?.ten_combo ||
                              "Món ăn"}
                          </span>
                          <span className="font-bold text-amber-700">
                            x{ct.so_luong}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Dishes */}
              <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d9a01e] animate-pulse" />
                Món đang yêu cầu
              </div>
              {(() => {
                const details = order.ChiTietHoaDons || [];

                if (details.length === 0)
                  return (
                    <div className="bg-gray-50 rounded-xl p-2.5 mb-3 text-[10px] text-gray-400 italic">
                      Đang tải chi tiết món...
                    </div>
                  );

                return (
                  <div className="bg-gray-50 rounded-xl p-2.5 mb-3 space-y-1">
                    {details.map((ct: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs"
                      >
                        <UtensilsCrossed
                          size={10}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="text-gray-700 font-medium flex-1 truncate">
                          {ct.MonAn?.ten_mon ||
                            ct.Combo?.ten_combo ||
                            "Món ăn"}
                        </span>
                        <span className="font-black text-gray-600">
                          x{ct.so_luong}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Tổng tiền đơn này
                </span>
                <span className="font-black text-gray-800 text-sm">
                  {vnd(Number(order.tong_tien))}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(order.id)}
                  disabled={processingId === order.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all disabled:opacity-50 uppercase tracking-wider"
                >
                  {processingId === order.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <XCircle size={13} />
                  )}
                  Hủy
                </button>
                <button
                  onClick={() => handleApprove(order.id)}
                  disabled={processingId === order.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-md hover:shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wider"
                >
                  {processingId === order.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  Duyệt
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}

import { usePendingOrders } from "@/hooks/pos/usePendingOrders";

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function PendingOrdersPanel({
  pendingOrdersCount,
  setPendingOrdersCount,
  isPendingOrdersOpen,
  setIsPendingOrdersOpen,
  notifications,
  removeNotification,
  clearNotifications,
  playNotificationSound,
  refreshActiveOrder,
}: {
  pendingOrdersCount: number;
  setPendingOrdersCount: (count: number) => void;
  isPendingOrdersOpen: boolean;
  setIsPendingOrdersOpen: (isOpen: boolean) => void;
  notifications: any[];
  removeNotification: (id: string | number) => void;
  clearNotifications: () => void;
  playNotificationSound: () => void;
  refreshActiveOrder: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"orders" | "notifications">("orders");

  const {
    pendingOrders,
    isLoading,
    processingId,
    hasNewOrder,
    setHasNewOrder,
    activeInvoices,
    fetchPending,
    handleApprove,
    handleReject,
  } = usePendingOrders({
    setPendingOrdersCount,
    playNotificationSound,
    refreshActiveOrder,
  });


  return (
    <>
      {/* Drawer Modal */}
      {isPendingOrdersOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPendingOrdersOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-xl shadow-md shadow-amber-200">
                    <Bell size={18} className="text-white" />
                  </div>
                  <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                    Thông Báo
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetchPending();
                      setHasNewOrder(false);
                    }}
                    className={`p-2 rounded-xl border transition-all ${hasNewOrder ? "bg-amber-50 border-amber-200 text-[#d9a01e] animate-pulse" : "border-gray-100 text-gray-400 hover:text-[#d9a01e]"}`}
                    title="Làm mới"
                  >
                    <RefreshCw
                      size={15}
                      className={isLoading ? "animate-spin" : ""}
                    />
                  </button>
                  <button
                    onClick={() => setIsPendingOrdersOpen(false)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs — chỉ còn 2 tab: Duyệt Đơn + Món Xong */}
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === "orders"
                    ? "bg-white text-[#d9a01e] shadow-sm border border-amber-100"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Duyệt Đơn
                  {pendingOrders.length > 0 && (
                    <span
                      className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] ${activeTab === "orders"
                        ? "bg-[#d9a01e] text-white"
                        : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      {pendingOrders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === "notifications"
                    ? "bg-white text-emerald-600 shadow-sm border border-emerald-100"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Món Xong
                  {notifications.filter(n => n.type === 'DISH_DONE').length > 0 && (
                    <span
                      className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] ${activeTab === "notifications"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      {notifications.filter(n => n.type === 'DISH_DONE').length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            ...
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 pos-scrollbar space-y-4">
              {activeTab === "notifications" ? (
                <NotificationsTab
                  notifications={notifications}
                  removeNotification={removeNotification}
                  clearNotifications={clearNotifications}
                  refreshActiveOrder={refreshActiveOrder}
                />
              ) : (
                <OrdersTab
                  pendingOrders={pendingOrders}
                  isLoading={isLoading}
                  activeInvoices={activeInvoices}
                  processingId={processingId}
                  handleReject={handleReject}
                  handleApprove={handleApprove}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
