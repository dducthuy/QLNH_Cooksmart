'use client';

import React from 'react';
import {
    Users,
    ChefHat,
    CircleDollarSign,
    TrendingUp,
    Zap
} from 'lucide-react';
import { StatCard, ActivityLog, SystemHealth } from '@/components/admin/dashboard';

export default function AdminDashboard() {
    const stats = [
        { title: 'Người Dùng', value: '1,284', icon: <Users size={24} />, change: 12.5, color: 'from-[#3b82f6] to-[#1d4ed8]' },
        { title: 'Tổng Món Ăn', value: '156', icon: <ChefHat size={24} />, change: 8.2, color: 'from-[#f59e0b] to-[#d97706]' },
        { title: 'Doanh Thu', value: '42.8M', icon: <CircleDollarSign size={24} />, change: 18.1, color: 'from-[#10b981] to-[#047857]' },
        { title: 'Lượt Truy Cập', value: '8,420', icon: <TrendingUp size={24} />, change: 24.5, color: 'from-[#ec4899] to-[#be185d]' },
    ];

    const activities = [
        { id: 1, user: 'Nguyễn Minh Quân', action: 'vừa cập nhật thực đơn món "Bún Bò"', time: '3 phút trước', type: 'info' as const },
        { id: 2, user: 'Lê Thanh Thảo', action: 'vừa thanh toán đơn hàng #9842', time: '12 phút trước', type: 'success' as const },
        { id: 3, user: 'Trần Văn Mạnh', action: 'đang đăng ký thẻ khách hành thân thiết', time: '28 phút trước', type: 'warning' as const },
        { id: 4, user: 'Admin Hệ Thống', action: 'vừa cấu hình lại quyền hạn API', time: '1 giờ trước', type: 'info' as const },
    ];

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tighter">
                        Chào Quản Trị Viên <span className="text-[#d9a01e]">👋</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Hệ thống đang hoạt động tối ưu với thời gian phản hồi 120ms.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-sm">
                        <Zap size={16} fill="currentColor" /> Trực Tuyến: 154
                    </div>
                    <button className="px-6 py-2.5 bg-linear-to-r from-[#d9a01e] to-[#c89117] text-white font-bold rounded-xl shadow-lg border-t border-white/20 hover:scale-105 active:scale-95 transition-all">
                        Xuất Báo Cáo
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Logs & Activities */}
                <ActivityLog items={activities} />

                {/* Right Side Panel */}
                <div className="space-y-8">
                    {/* System Pulse */}
                    <SystemHealth />

                    {/* Quick Access Card */}
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 hover:border-[#d9a01e]/30 transition-all shadow-sm hover:shadow-md">
                        <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest">Phím Tắt</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['Thêm Món', 'Quét Đơn', 'Gửi Thông Báo', 'Sao Lưu'].map((tool, i) => (
                                <button key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-[#d9a01e] hover:text-white hover:border-transparent transition-all">
                                    {tool}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
