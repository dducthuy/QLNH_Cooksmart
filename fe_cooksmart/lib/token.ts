import { VaiTro } from '@/types/auth';

const TOKEN_KEY = 'accessToken';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 ngày (giây)

// ========================
// KIỂU DỮ LIỆU PAYLOAD
// ========================
export interface TokenPayload {
    id: string;
    vai_tro: VaiTro;
    iat: number;
    exp: number;
}

// ========================
// LƯU / LẤY / XÓA TOKEN (cookie)
// ========================
export const getToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

export const setToken = (token: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Strict`;
};

export const removeToken = (): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
};

// ========================
// GIẢI MÃ TOKEN
// ========================

/**
 * Giải mã JWT để lấy payload (id, vai_tro, iat, exp).
 * Chỉ DECODE, không VERIFY chữ ký — dùng để đọc thông tin trên UI.
 */
export const decodeToken = (token: string): TokenPayload | null => {
    try {
        const base64Payload = token.split('.')[1];
        const jsonPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(jsonPayload) as TokenPayload;
    } catch {
        return null;
    }
};

/**
 * Lấy payload từ token đang lưu trong cookie.
 */
export const getTokenPayload = (): TokenPayload | null => {
    const token = getToken();
    if (!token) return null;
    return decodeToken(token);
};

/**
 * Kiểm tra token đã hết hạn chưa.
 */
export const isTokenExpired = (): boolean => {
    const payload = getTokenPayload();
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
};
