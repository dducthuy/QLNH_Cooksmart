"use client";

import React, { useState } from 'react';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { DangNhapBody } from '@/types/auth';
import { setToken } from '@/lib/token';

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<DangNhapBody>({
        ten_dang_nhap: '',
        mat_khau: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: DangNhapBody) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const result = await authService.login(formData);
            if (result.status === 'success') {
                setToken(result.token);

                // Redirection based on role
                const { getTokenPayload } = await import('@/lib/token');
                const payload = getTokenPayload();

                if (payload?.vai_tro === 'Admin') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
        } catch (error: any) {
            // Next.js dev server sẽ tự bật màn hình lỗi đỏ chót nếu ta dùng console.error(error) bắt AxiosError
            setErrorMsg(
                error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại!'
            );
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a0202] via-[#2a0606] to-[#0a0202] p-4 text-white relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d9a01e]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d9a01e]/5 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10 w-full max-w-md bg-[#1a0505]/80 backdrop-blur-2xl rounded-[32px] shadow-2xl p-10 border border-[#d9a01e]/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-[#d9a01e] tracking-tight">Đăng Nhập</h1>
                    <p className="text-gray-300 mt-2 text-sm">Chào mừng bạn quay lại hệ thống CookSmart</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-4 text-sm text-red-100 bg-red-500/20 border border-red-500/50 rounded-lg text-center transition-all duration-300">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1" htmlFor="ten_dang_nhap">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            id="ten_dang_nhap"
                            name="ten_dang_nhap"
                            value={formData.ten_dang_nhap}
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên đăng nhập"
                            className="w-full px-4 py-3 bg-[#4a1515]/50 border border-[#7c2424] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d9a01e] focus:border-transparent transition-all duration-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1" htmlFor="mat_khau">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="mat_khau"
                            name="mat_khau"
                            value={formData.mat_khau}
                            onChange={handleChange}
                            required
                            placeholder="Nhập mật khẩu"
                            className="w-full px-4 py-3 bg-[#4a1515]/50 border border-[#7c2424] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d9a01e] focus:border-transparent transition-all duration-300"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-linear-to-r from-[#d9a01e] to-[#c89117] hover:from-[#c89117] hover:to-[#a77a13] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d9a01e] focus:ring-offset-[#3b0909] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Chưa có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/auth/register')}
                            className="font-medium text-[#d9a01e] hover:text-[#f8b500] transition-colors"
                        >
                            Đăng ký tại đây
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
