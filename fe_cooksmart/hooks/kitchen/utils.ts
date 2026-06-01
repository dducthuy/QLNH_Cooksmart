import { HoaDon } from '@/types/hoaDon';

// Ticket còn hiển thị nếu có ít nhất 1 món chưa DaLayDi
export const hasVisibleItems = (ticket: HoaDon) =>
    ticket.ChiTietHoaDons?.some(i => i.trang_thai_mon !== 'DaLayDi') ?? false;

// Ticket cần hiển thị khi load ban đầu: còn món DangCho hoặc DangNau
export const hasActiveItems = (ticket: HoaDon) =>
    ticket.ChiTietHoaDons?.some(i => i.trang_thai_mon === 'DangCho' || i.trang_thai_mon === 'DangNau') ?? false;
