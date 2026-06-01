import { VaiTro } from '@/types/auth';

const TOKEN_KEY = 'accessToken';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 ngày (giây)


export interface TokenPayload {
    id: string;
    ten_dang_nhap: string;
    ho_ten: string | null;
    vai_tro: VaiTro;
    iat: number;
    exp: number;
}


export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEY);
};


export const decodeToken = (token: string): TokenPayload | null => {
    try {
        const base64Payload = token.split('.')[1];
        if (!base64Payload) return null;


        const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }


        const jsonPayload = new TextDecoder().decode(bytes);

        return JSON.parse(jsonPayload) as TokenPayload;
    } catch (error) {
        console.error('Lỗi giải mã token:', error);
        return null;
    }
};


export const getTokenPayload = (): TokenPayload | null => {
    const token = getToken();
    if (!token) return null;
    return decodeToken(token);
};


export const isTokenExpired = (): boolean => {
    const payload = getTokenPayload();
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
};
