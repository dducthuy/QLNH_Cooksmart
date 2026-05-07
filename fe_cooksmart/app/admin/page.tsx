'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign,
    ShoppingBag,
    Users,
    AlertTriangle,
    Zap,
    LineChart as LineChartIcon,
    Loader2
} from 'lucide-react';
import { StatCard } from '@/components/admin/dashboard';
import { dashboardService } from '@/services/dashboard.service';
import { useSocket } from '@/context/SocketContext';
import { DashboardData } from '@/types/dashboard';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
    const { socket } = useSocket();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    const loadData = useCallback(async () => {
        try {
            const data = await dashboardService.getTongQuan();
            setDashboardData(data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!socket) return;

        // Bắt các sự kiện để tải lại dashboard
        socket.on('cap_nhat_menu', loadData);
        socket.on('cap_nhat_trang_thai_ban', loadData);
        socket.on('thanh_toan_xong', loadData);
        socket.on('cap_nhat_ca', loadData); // Có thể cần khi kết ca

        return () => {
            socket.off('cap_nhat_menu', loadData);
            socket.off('cap_nhat_trang_thai_ban', loadData);
            socket.off('thanh_toan_xong', loadData);
            socket.off('cap_nhat_ca', loadData);
        };
    }, [socket, loadData]);

    if (isLoading || !dashboardData) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#d9a01e]" size={48} />
                <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-sm">Đang tải dữ liệu tổng quan...</p>
            </div>
        );
    }

    const { thongKeNhanh, doanhThuTheoGio, topMonBanChay } = dashboardData;

    // ── Data for Cards ──
    const stats = [
        { label: 'Doanh Thu Thuần', value: `${(thongKeNhanh.doanhThuThuan / 1000000).toFixed(1).replace('.0', '')}M`, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <DollarSign size={20} className="text-emerald-500" /> },
        { label: 'Số Đơn Hàng', value: thongKeNhanh.soDonHang.toString(), color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: <ShoppingBag size={20} className="text-blue-500" /> },
        { label: 'Lấp Đầy Bàn', value: `${thongKeNhanh.tyLeLapDayBan}%`, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Users size={20} className="text-amber-500" /> },
        { label: 'Món Dừng Bán', value: thongKeNhanh.monDungBan.toString(), color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertTriangle size={20} className="text-red-500" /> },
    ];

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#d9a01e] to-[#c89117] rounded-2xl shadow-md shadow-[#d9a01e]/20">
                        <LineChartIcon size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-wide">Tổng Quan Hệ Thống</h1>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Theo dõi hiệu suất kinh doanh hôm nay.</p>
                    </div>
                </div>


            </div>

            {/* Quick Stats Grid - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, idx) => (
                    <div key={idx} className={`${s.bg} border ${s.border} rounded-3xl p-5 shadow-sm flex items-center justify-between`}>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                        <div className={`p-3 bg-white/50 rounded-2xl shadow-sm border border-white/60`}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Larger) - Line Chart */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest">Doanh thu theo giờ</h2>
                        <p className="text-xs text-gray-400 font-medium mt-1">Giúp theo dõi các khung giờ cao điểm để điều phối nhân sự</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={doanhThuTheoGio} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000000}M`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#d9a01e', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value: any) => [`${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`, 'Doanh thu']}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    name="Doanh thu"
                                    stroke="#d9a01e"
                                    strokeWidth={4}
                                    dot={{ fill: '#fff', stroke: '#d9a01e', strokeWidth: 3, r: 5 }}
                                    activeDot={{ r: 8, fill: '#d9a01e', stroke: '#fff', strokeWidth: 3 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column (Smaller) - Horizontal Bar Chart */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest">Top 5 Món Bán Chạy</h2>
                        <p className="text-xs text-gray-400 font-medium mt-1">Đảm bảo bếp luôn sẵn sàng nguyên liệu</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMonBanChay} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value: any) => [`${value} phần`, 'Đã bán']}
                                />
                                <Bar
                                    dataKey="sold"
                                    fill="#10b981"
                                    radius={[0, 8, 8, 0]}
                                    barSize={24}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
