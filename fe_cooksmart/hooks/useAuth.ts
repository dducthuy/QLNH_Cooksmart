'use client';

import { useMemo } from 'react';
import { getTokenPayload, isTokenExpired } from '@/lib/token';
import { VaiTro } from '@/types/auth';

export function useAuth() {
    const payload = useMemo(() => {
        if (isTokenExpired()) return null;
        return getTokenPayload();
    }, []);

    const vaiTro = payload?.vai_tro as VaiTro | undefined;

    return {
        isAuthenticated: !!payload,
        userId: payload?.id ?? null,
        vaiTro,

        // Kiểm tra quyền cụ thể
        isAdmin: payload?.vai_tro === 'Admin',
        isQuanLy: payload?.vai_tro === 'Admin',
        isThuNgan: payload?.vai_tro === 'ThuNgan',
        isPhucVu: payload?.vai_tro === 'PhucVu',
        isBep: payload?.vai_tro === 'Bep',

        // Kiểm tra nhiều quyền cùng lúc
        hasRole: (roles: VaiTro[]) => !!vaiTro && roles.includes(vaiTro),
    };
}
