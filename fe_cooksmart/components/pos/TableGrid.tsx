"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Loader2,
  ArrowRightLeft,
  Merge,
  X,
} from "lucide-react";
import { banAnService } from "@/services/banAn.service";
import { hoaDonService } from "@/services/hoaDon.service";
import { BanAn, TrangThaiBan } from "@/types/banAn";
import { useSocket } from "@/context/SocketContext";

// Định nghĩa kiểu dữ liệu cho trạng thái hành động
type ActionState = {
  type: "transfer" | "merge" | null;
  sourceTable: BanAn | null;
};

// ==========================================
// COMPONENT: Item Bàn Ăn
// ==========================================
const TableCard = ({
  table,
  actionState,
  selectedTableId,
  processing,
  onClick,
  onActionClick,
}: {
  table: BanAn;
  actionState: ActionState;
  selectedTableId: string | undefined;
  processing: boolean;
  onClick: (table: BanAn) => void;
  onActionClick: (type: "transfer" | "merge", table: BanAn) => void;
}) => {
  const getStatusText = (status: TrangThaiBan) => {
    if (status === "DangPhucVu") return "Đang phục vụ";
    if (status === "DatTruoc") return "Đặt trước";
    return "Trống";
  };

  const isSource = actionState.sourceTable?.id === table.id;
  const isOccupied = table.trang_thai_ban !== "Trong";
  const isSelected = selectedTableId === table.id;

  // Logic xác định màu sắc hiển thị
  let cardClassName =
    "w-full flex flex-col items-center justify-center gap-1.5 aspect-square border-2 rounded-3xl transition-all active:scale-95 relative ";
  if (isSource) {
    cardClassName += "border-amber-500 ring-4 ring-amber-100 bg-amber-50";
  } else if (isSelected) {
    cardClassName +=
      "border-[#d9a01e] bg-[#d9a01e]/10 shadow-lg shadow-[#d9a01e]/20 ring-2 ring-[#d9a01e]/20";
  } else if (isOccupied) {
    cardClassName += "border-amber-100 bg-amber-50/30";
  } else {
    cardClassName += "border-gray-100 bg-white";
  }

  return (
    <div className="relative group">
      <button
        disabled={processing}
        onClick={() => onClick(table)}
        className={cardClassName}
      >
        <span
          className={`text-[24px] font-black ${isOccupied ? "text-[#d9a01e]" : "text-gray-400"}`}
        >
          {table.so_ban.replace(/bàn\s/i, "")}
        </span>
        <span
          className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-full ${isOccupied ? "bg-amber-100 text-[#d9a01e]" : "bg-gray-100 text-gray-400"}`}
        >
          {getStatusText(table.trang_thai_ban)}
        </span>
      </button>

      {/* Các nút hành động (Chuyển/Gộp) hiển thị khi hover nếu bàn đang có khách */}
      {isOccupied && !actionState.type && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick("transfer", table);
            }}
            className="p-1.5 bg-violet-500 text-white rounded-lg shadow-lg hover:bg-violet-600 active:scale-90 transition-all"
            title="Chuyển bàn"
          >
            <ArrowRightLeft size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick("merge", table);
            }}
            className="p-1.5 bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 active:scale-90 transition-all"
            title="Gộp bàn"
          >
            <Merge size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT: TableGrid
// ==========================================
export default function TableGrid({
  selectedTable,
  setSelectedTable,
}: {
  selectedTable: { id: string; so_ban: string } | null;
  setSelectedTable: (val: { id: string; so_ban: string } | null) => void;
}) {
  const { socket } = useSocket();

  const [filter, setFilter] = useState("all");
  const [tables, setTables] = useState<BanAn[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actionState, setActionState] = useState<ActionState>({
    type: null,
    sourceTable: null,
  });

  // Tải danh sách bàn
  const fetchTables = async () => {
    try {
      const data = await banAnService.getAll();
      setTables(data);
    } catch (error) {
      console.error("Lỗi tải danh sách bàn:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTables().finally(() => setLoading(false));
  }, []);

  // Lắng nghe realtime trạng thái bàn
  useEffect(() => {
    if (!socket) return;

    socket.on(
      "cap_nhat_trang_thai_ban",
      (payload: { id_ban: string; trang_thai_ban: TrangThaiBan }) => {
        setTables((prev) =>
          prev.map((t) =>
            t.id === payload.id_ban
              ? { ...t, trang_thai_ban: payload.trang_thai_ban }
              : t
          )
        );
      }
    );

    return () => {
      socket.off("cap_nhat_trang_thai_ban");
    };
  }, [socket]);

  // Xử lý logic khi click vào bàn ăn
  const handleTableClick = async (targetTable: BanAn) => {
    if (!actionState.type) {
      setSelectedTable({ id: targetTable.id, so_ban: targetTable.so_ban });
      return;
    }

    const source = actionState.sourceTable;
    if (!source || source.id === targetTable.id) return;

    setProcessing(true);
    try {
      const sourceInvoices = await hoaDonService.getAll({ id_ban: source.id });
      const sourceActive = sourceInvoices.find(
        (i) => i.trang_thai_hd === "DangPhucVu" || i.trang_thai_hd === "ChoXuLy"
      );

      if (!sourceActive) throw new Error("Không tìm thấy hóa đơn bàn nguồn");

      if (actionState.type === "transfer") {
        if (targetTable.trang_thai_ban !== "Trong") {
          throw new Error("Bàn đích phải trống");
        }
        await hoaDonService.chuyenBan(sourceActive.id, targetTable.id);
        alert(`Đã chuyển ${source.so_ban} -> ${targetTable.so_ban}`);
      } else {
        if (targetTable.trang_thai_ban === "Trong") {
          throw new Error("Bàn đích phải có khách để gộp");
        }
        const targetInvoices = await hoaDonService.getAll({
          id_ban: targetTable.id,
        });
        const targetActive = targetInvoices.find(
          (i) => i.trang_thai_hd === "DangPhucVu" || i.trang_thai_hd === "ChoXuLy"
        );
        if (!targetActive) throw new Error("Bàn đích không có hóa đơn");

        await hoaDonService.gopBan(sourceActive.id, targetActive.id);
        alert(`Đã gộp ${source.so_ban} vào ${targetTable.so_ban}`);
      }

      setActionState({ type: null, sourceTable: null });
      await fetchTables();
      setSelectedTable({ id: targetTable.id, so_ban: targetTable.so_ban });
    } catch (err: any) {
      alert(err.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleActionClick = (type: "transfer" | "merge", table: BanAn) => {
    setActionState({ type, sourceTable: table });
  };

  // Lọc bàn hiển thị
  const filteredTables = tables.filter((t) => {
    if (filter === "all") return true;
    if (filter === "Trống") return t.trang_thai_ban === "Trong";
    if (filter === "Đang phục vụ") return t.trang_thai_ban === "DangPhucVu";
    if (filter === "Đặt trước") return t.trang_thai_ban === "DatTruoc";
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-xl shadow-md">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                Sơ Đồ Bàn
              </h2>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                Khu vực sảnh chung
              </p>
            </div>
          </div>
          {actionState.type && (
            <button
              onClick={() => setActionState({ type: null, sourceTable: null })}
              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 border border-red-100 animate-pulse"
            >
              <X size={14} /> Hủy {actionState.type === "transfer" ? "Chuyển" : "Gộp"}
            </button>
          )}
        </div>

        {!actionState.type ? (
          <div className="flex gap-2 overflow-x-auto pos-scrollbar pb-1">
            {["all", "Trống", "Đang phục vụ", "Đặt trước"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? "bg-[#d9a01e] text-white" : "bg-gray-50 text-gray-500"
                }`}
              >
                {f === "all" ? "Tất cả" : f}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest text-center">
              Đang {actionState.type === "transfer" ? "chuyển" : "gộp"} bàn{" "}
              <span className="text-amber-900 underline font-black">
                {actionState.sourceTable?.so_ban}
              </span>
              . Hãy chọn bàn đích...
            </p>
          </div>
        )}
      </div>

      {/* Grid Danh sách Bàn */}
      <div className="flex-1 overflow-y-auto p-5 pos-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-300 gap-3">
            <Loader2 className="animate-spin text-[#d9a01e]" size={32} />
            <span className="font-bold text-xs uppercase tracking-widest">
              Đang tải bàn...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                actionState={actionState}
                selectedTableId={selectedTable?.id}
                processing={processing}
                onClick={handleTableClick}
                onActionClick={handleActionClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
