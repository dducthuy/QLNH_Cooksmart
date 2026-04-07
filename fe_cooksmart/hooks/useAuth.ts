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
        isQuanLy: vaiTro === 'Admin',
        isPhucVu: vaiTro === 'PhucVu',
        isBep: vaiTro === 'Bep',

        // Kiểm tra nhiều quyền cùng lúc
        hasRole: (roles: VaiTro[]) => !!vaiTro && roles.includes(vaiTro),
    };
}
