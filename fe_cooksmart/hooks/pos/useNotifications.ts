import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";

export function useNotifications() {
  const { socket } = useSocket();


  // State

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isPendingOrdersOpen, setIsPendingOrdersOpen] = useState(false);


  // Audio


  const playNotificationSound = useCallback(() => {
    if (!isAudioUnlocked) return;

    try {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      );

      audio.play().catch((e) => {
        if (e.name !== "NotAllowedError") {
          console.error("Lỗi phát âm thanh:", e);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }, [isAudioUnlocked]);


  // Notification Actions


  const addNotification = useCallback(
    (noti: any) => {
      setNotifications((prev) => {
        const updated = [noti, ...prev].slice(0, 50);

        localStorage.setItem(
          "pos_notifications",
          JSON.stringify(updated)
        );

        return updated;
      });

      playNotificationSound();
    },
    [playNotificationSound]
  );

  const removeNotification = useCallback(
    (id: string | number, emitSocket = true) => {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);

        localStorage.setItem(
          "pos_notifications",
          JSON.stringify(updated)
        );

        return updated;
      });

      if (emitSocket && socket) {
        socket.emit("xoa_thong_bao", { id });
      }
    },
    [socket]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem("pos_notifications");
  }, []);


  // Load Notifications


  useEffect(() => {
    const saved = localStorage.getItem("pos_notifications");

    if (!saved) return;

    try {
      setNotifications(JSON.parse(saved));
    } catch (error) {
      console.error(
        "Lỗi parse thông báo từ localStorage",
        error
      );
    }
  }, []);


  // Unlock Audio


  useEffect(() => {
    const unlock = () => {
      if (isAudioUnlocked) return;

      const audio = new Audio();

      audio
        .play()
        .then(() => {
          setIsAudioUnlocked(true);
          window.removeEventListener("click", unlock);
        })
        .catch(() => { });
    };

    window.addEventListener("click", unlock);

    return () => {
      window.removeEventListener("click", unlock);
    };
  }, [isAudioUnlocked]);


  // Socket Events

  useEffect(() => {
    if (!socket) return;

    const handleDishUpdate = (payload: any) => {
      if (payload.trang_thai_mon !== "DaXong") return;

      console.log(
        "🔔 Nhận thông báo món xong:",
        payload
      );

      addNotification({
        id:
          payload.id_chi_tiet ||
          Date.now().toString(),
        type: "DISH_DONE",
        message: `${payload.so_ban}: ${payload.ten_mon} đã xong!`,
        data: payload,
        time: new Date(),
      });
    };

    const handleRemoveNotification = (
      payload: any
    ) => {
      removeNotification(payload.id, false);
    };

    socket.on(
      "trang_thai_mon_da_doi",
      handleDishUpdate
    );

    socket.on(
      "da_xoa_thong_bao",
      handleRemoveNotification
    );

    return () => {
      socket.off(
        "trang_thai_mon_da_doi",
        handleDishUpdate
      );

      socket.off(
        "da_xoa_thong_bao",
        handleRemoveNotification
      );
    };
  }, [socket, addNotification, removeNotification]);


  return {
    notifications,

    addNotification,
    removeNotification,
    clearNotifications,

    playNotificationSound,

    pendingOrdersCount,
    setPendingOrdersCount,

    isPendingOrdersOpen,
    setIsPendingOrdersOpen,
  };
}