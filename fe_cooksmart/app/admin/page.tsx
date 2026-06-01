'use client';


import {
    DollarSign,
    ShoppingBag,
    Users,
    AlertTriangle,
    Zap,
    LineChart as LineChartIcon,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { StatCard } from '@/components/admin/dashboard';
import { useDashboard } from '@/hooks/admin/useDashboard';
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
    PieChart,
    Pie,
    Cell
} from 'recharts';

const PIE_COLORS = ['#d9a01e', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
    const { isLoading, dashboardData } = useDashboard();

    if (isLoading || !dashboardData) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#d9a01e]" size={48} />
                <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-sm">Đang tải dữ liệu tổng quan...</p>
            </div>
        );
    }

    const { thongKeNhanh, doanhThuTheoGio, topMonBanChay, nguyenLieuSapHet, doanhThuTheoDanhMuc } = dashboardData;

    // ── Data for Cards ──
    const stats = [
        {
            label: 'Doanh Thu Thuần',
            value: `${(thongKeNhanh.doanhThuThuan / 1000000).toFixed(1).replace('.0', '')}M`,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            icon: <DollarSign size={20} className="text-emerald-500" />,
            subText: (
                <div className="flex items-center gap-3 mt-3 text-xs font-bold text-emerald-700/70">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Lãi: {new Intl.NumberFormat('vi-VN').format(thongKeNhanh.tienLoi)}</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>Vốn: {new Intl.NumberFormat('vi-VN').format(thongKeNhanh.tongTienCost)}</span>
                </div>
            )
        },
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
                    <div key={idx} className={`${s.bg} border ${s.border} rounded-3xl p-5 shadow-sm flex flex-col justify-center`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                            </div>
                            <div className={`p-3 bg-white/50 rounded-2xl shadow-sm border border-white/60`}>
                                {s.icon}
                            </div>
                        </div>
                        {s.subText && s.subText}
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

            {/* Second Row of Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Column (Larger) - Doughnut Chart */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest">Doanh thu theo danh mục</h2>
                        <p className="text-xs text-gray-400 font-medium mt-1">Phân tích xu hướng tiêu dùng của khách hàng</p>
                    </div>
                    <div className="h-[350px] w-full flex items-center justify-center">
                        {doanhThuTheoDanhMuc && doanhThuTheoDanhMuc.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={doanhThuTheoDanhMuc}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={90}
                                        outerRadius={130}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {doanhThuTheoDanhMuc.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: any) => [`${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`, 'Doanh thu']}
                                    />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ lineHeight: '40px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 font-medium">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>

                {/* Right Column (Smaller) - Low Stock List */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest">Sắp Hết Nguyên Liệu</h2>
                            <p className="text-xs text-gray-400 font-medium mt-1">Cảnh báo tồn kho thấp</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        {nguyenLieuSapHet && nguyenLieuSapHet.length > 0 ? (
                            <div className="space-y-4">
                                {nguyenLieuSapHet.map(nl => (
                                    <div key={nl.id} className="flex items-center justify-between p-4 rounded-2xl border border-red-100 bg-red-50/50">
                                        <div>
                                            <p className="font-bold text-gray-800">{nl.ten_nguyen_lieu}</p>
                                            <p className="text-xs text-red-500 font-medium mt-1">Cần nhập thêm</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-red-600">{nl.so_luong_ton}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{nl.don_vi_tinh}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
                                <p className="text-sm font-bold text-gray-500">Tồn kho ổn định</p>
                                <p className="text-xs text-gray-400 mt-1">Không có nguyên liệu nào sắp hết.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
