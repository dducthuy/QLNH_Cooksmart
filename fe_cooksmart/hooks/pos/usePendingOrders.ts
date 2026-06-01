import { useState, useCallback, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { hoaDonService } from "@/services/hoaDon.service";
import { HoaDon } from "@/types/hoaDon";

type UsePendingOrdersProps = {
  setPendingOrdersCount: (count: number) => void;
  playNotificationSound: () => void;
  refreshActiveOrder: () => Promise<void>;
};

export function usePendingOrders({
  setPendingOrdersCount,
  playNotificationSound,
  refreshActiveOrder,
}: UsePendingOrdersProps) {
  const { socket } = useSocket();


  // State


  const [pendingOrders, setPendingOrders] = useState<HoaDon[]>([]);
  const [activeInvoices, setActiveInvoices] = useState<
    Record<string, HoaDon>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hasNewOrder, setHasNewOrder] = useState(false);


  // fech


  const fetchPending = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await hoaDonService.getAll({
        trang_thai_hd: "ChoXuLy",
      });

      const orders = Array.isArray(data) ? data : [];

      setPendingOrders(orders);
      setPendingOrdersCount(orders.length);

      const activeMap: Record<string, HoaDon> = {};

      await Promise.all(
        orders.map(async (order) => {
          if (!order.id_ban) return;

          try {
            const tableInvoices =
              await hoaDonService.getAll({
                id_ban: order.id_ban,
              });

            if (!Array.isArray(tableInvoices)) return;

            const active = tableInvoices.find(
              (invoice) =>
                invoice.id !== order.id &&
                ["DangPhucVu", "ChoXuLy"].includes(
                  invoice.trang_thai_hd
                )
            );

            if (!active) return;

            const fullInvoice =
              await hoaDonService.getById(active.id);

            activeMap[order.id_ban] = fullInvoice;
          } catch (error) {
            console.error(
              "Lỗi tải đơn hiện tại của bàn:",
              order.id_ban,
              error
            );
          }
        })
      );

      setActiveInvoices(activeMap);
    } catch (error) {
      console.error("Lỗi tải đơn chờ duyệt:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setPendingOrdersCount]);


  // Actions


  const handleApprove = async (hoaDonId: string) => {
    try {
      setProcessingId(hoaDonId);

      await hoaDonService.updateStatus(hoaDonId, {
        trang_thai_hd: "DangPhucVu",
      });

      playNotificationSound();

      await refreshActiveOrder();

      const updatedOrders = pendingOrders.filter(
        (order) => order.id !== hoaDonId
      );

      setPendingOrders(updatedOrders);
      setPendingOrdersCount(updatedOrders.length);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        "Lỗi duyệt đơn!"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (hoaDonId: string) => {
    if (
      !confirm(
        "Hủy đơn này? Khách hàng sẽ cần đặt lại."
      )
    )
      return;

    try {
      setProcessingId(hoaDonId);

      await hoaDonService.updateStatus(hoaDonId, {
        trang_thai_hd: "DaHuy",
      });

      const updatedOrders = pendingOrders.filter(
        (order) => order.id !== hoaDonId
      );

      setPendingOrders(updatedOrders);
      setPendingOrdersCount(updatedOrders.length);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        "Lỗi hủy đơn!"
      );
    } finally {
      setProcessingId(null);
    }
  };



  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      console.log("🔔 Nhận thông báo đơn QR mới");

      playNotificationSound();
      setHasNewOrder(true);

      fetchPending();
    };

    const handleProcessedOrder = (
      data: { id_hoa_don: string }
    ) => {
      console.log(
        "🔔 Đơn QR đã được thiết bị khác xử lý",
        data
      );

      fetchPending();
    };

    socket.on(
      "don_qr_cho_duyet",
      handleNewOrder
    );

    socket.on(
      "don_qr_da_xu_ly",
      handleProcessedOrder
    );

    return () => {
      socket.off(
        "don_qr_cho_duyet",
        handleNewOrder
      );

      socket.off(
        "don_qr_da_xu_ly",
        handleProcessedOrder
      );
    };
  }, [socket, fetchPending, playNotificationSound]);



  return {
    pendingOrders,
    activeInvoices,

    isLoading,
    processingId,

    hasNewOrder,
    setHasNewOrder,

    fetchPending,

    handleApprove,
    handleReject,
  };
}