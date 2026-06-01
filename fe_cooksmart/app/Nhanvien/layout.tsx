"use client";

import AdminGuard from "@/components/admin/layout/Guard";
import { SocketProvider } from "@/context/SocketContext";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard allowedRoles={["Admin", "PhucVu", "ThuNgan"]}>
      <SocketProvider>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-800">
          {/* Main Content */}
          <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
        </div>
        <style jsx global>{`
          .pos-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .pos-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .pos-scrollbar::-webkit-scrollbar-thumb {
            background: #d9a01e40;
            border-radius: 10px;
          }
          .pos-scrollbar:hover::-webkit-scrollbar-thumb {
            background: #d9a01e80;
          }
        `}</style>
      </SocketProvider>
    </AdminGuard>
  );
}
