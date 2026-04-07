import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: "--font-roboto",
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
      <body className={`${roboto.variable} font-sans antialiased bg-[#0a0202]`}>
        {children}
      </body>
    </html>
  );
}
