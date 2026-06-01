import { useState, useCallback, useEffect } from "react";
import { ketCaService } from "@/services/ketCa.service";

export function useShiftManager({ isAdmin, isThuNgan }: { isAdmin: boolean, isThuNgan: boolean }) {
  const [currentShift, setCurrentShift] = useState<any | null>(null);
  const [isInitialShiftCheckDone, setIsInitialShiftCheckDone] = useState(false);
  const hasActiveShift = currentShift ? true : false;
  // đóng mở form
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  // shuftmode = open hiện form mở ca, close hiện form đóng ca
  const [shiftMode, setShiftMode] = useState<"OPEN" | "CLOSE">("OPEN");

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
    refreshShiftStatus();
  }, [refreshShiftStatus]);

  useEffect(() => {
    if (hasActiveShift && shiftMode === "OPEN") {
      setIsShiftModalOpen(false);
    }
    if (!hasActiveShift && (isAdmin || isThuNgan)) {
      setShiftMode("OPEN");
      setIsShiftModalOpen(true);
    }
  }, [hasActiveShift, isAdmin, isThuNgan, shiftMode]);

  return {
    currentShift,
    isInitialShiftCheckDone,
    hasActiveShift,
    isShiftModalOpen,
    setIsShiftModalOpen,
    shiftMode,
    setShiftMode,
    refreshShiftStatus
  };
}
