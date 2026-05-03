import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CookSmart - Hệ Thống Quản Lý Nhà Hàng Thông Minh",
  description: "Giải pháp quản lý nhà hàng toàn diện và hiện đại",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0202]`}>
        {children}
      </body>
    </html>
  );
}
