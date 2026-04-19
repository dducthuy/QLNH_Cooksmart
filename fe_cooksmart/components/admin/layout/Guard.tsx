'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminGuardProps {
    children: React.ReactNode;
    allowedRoles?: ('Admin' | 'ThuNgan' | 'PhucVu' | 'Bep')[];
}

export default function AdminGuard({ children, allowedRoles = ['Admin'] }: AdminGuardProps) {
    const { isAuthenticated, vaiTro, isAdmin } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    const isAllowed = !allowedRoles || (vaiTro && allowedRoles.includes(vaiTro)) || isAdmin;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (!isAllowed) {
                router.push('/');
            }
        }
    }, [isAuthenticated, isAllowed, router, isMounted]);

    if (!isMounted || !isAuthenticated || !isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0202]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#d9a01e] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#d9a01e] font-bold animate-pulse tracking-wide uppercase text-sm">Đang bảo mật truy cập...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
