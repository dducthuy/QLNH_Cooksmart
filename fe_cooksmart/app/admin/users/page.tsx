'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    ShieldCheck,
    UtensilsCrossed,
    ChefHat,
    LayoutGrid,
    Wifi,
    WifiOff,
    ToggleLeft,
    ToggleRight,
    Edit2,
    KeyRound,
    Trash2,
    Loader2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { nguoiDungService } from '@/services/nguoiDung.service';
import { NguoiDung, VaiTro } from '@/types/nguoiDung';
import {
    useAdminToast,
    AdminPageHeader,
    AdminStatCards,
    AdminFilterTabs,
    AdminTableCard,
    AdminDeleteConfirm,
    AdminModal,
} from '@/components/admin/ui';
import DynamicForm, { FormField } from '@/components/admin/form/DynamicForm';

const VAI_TRO_CONFIG: Record<VaiTro, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    Admin: { label: 'Quản Trị', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: <ShieldCheck size={13} /> },
    ThuNgan: { label: 'Thu Ngân', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <LayoutGrid size={13} /> },
    PhucVu: { label: 'Phục Vụ', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <UtensilsCrossed size={13} /> },
    Bep: { label: 'Bếp', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <ChefHat size={13} /> },
};

const VAI_TRO_OPTIONS = [
    { value: 'Admin', label: 'Quản Trị Viên' },
    { value: 'ThuNgan', label: 'Nhân Viên Thu Ngân' },
    { value: 'PhucVu', label: 'Nhân Viên Phục Vụ' },
    { value: 'Bep', label: 'Nhân Viên Bếp' },
];

function Avatar({ nguoiDung, isOnline }: { nguoiDung: NguoiDung; isOnline?: boolean }) {
    const initials = (nguoiDung.ho_ten || nguoiDung.ten_dang_nhap).charAt(0).toUpperCase();
    const colorMap: Record<VaiTro, string> = {
        Admin: 'from-purple-500 to-purple-700',
        ThuNgan: 'from-emerald-500 to-emerald-700',
        PhucVu: 'from-blue-500 to-blue-700',
        Bep: 'from-amber-500 to-amber-700',
    };

    return (
        <div className="relative">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[nguoiDung.vai_tro]} flex items-center justify-center text-white font-black text-base shadow-sm`}>
                {initials}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
        </div>
    );
}

type ModalMode = 'add' | 'edit' | 'reset-pw' | 'delete' | null;

export default function UserManagementPage() {
    const [users, setUsers] = useState<NguoiDung[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<VaiTro | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const [modal, setModal] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<NguoiDung | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    const { showToast, toastNode } = useAdminToast();

    const closeModal = () => { setModal(null); setSelected(null); };

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await nguoiDungService.getAll();
            setUsers(data);
        } catch {
            showToast('Không thể tải danh sách người dùng!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        nguoiDungService.getOnlineUsers()
            .then((ids) => setOnlineUserIds(new Set(ids)))
            .catch(() => {});

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

        socket.on('user_online', ({ userId }: { userId: string }) => {
            setOnlineUserIds((prev) => new Set(prev).add(userId));
        });

        socket.on('user_offline', ({ userId }: { userId: string }) => {
            setOnlineUserIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        });

        return () => { socket.disconnect(); };
    }, []);

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const payload: any = {
                ten_dang_nhap: data.ten_dang_nhap.trim(),
                ho_ten: data.ho_ten?.trim() || null,
                vai_tro: data.vai_tro,
            };
            
            if (modal === 'edit' && selected) {
                await nguoiDungService.update(selected.id, payload);
                showToast('Cập nhật thành công!');
            } else {
                payload.mat_khau = data.mat_khau;
                await nguoiDungService.create(payload);
                showToast(`Đã tạo tài khoản "${data.ten_dang_nhap}"!`);
            }
            closeModal();
            fetchUsers();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Lưu thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPw = async (data: any) => {
        if (!selected) return;
        try {
            setIsSubmitting(true);
            await nguoiDungService.resetPassword(selected.id, data.mat_khau);
            showToast('Đặt lại mật khẩu thành công!');
            closeModal();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: NguoiDung) => {
        try {
            const result = await nguoiDungService.toggleStatus(user.id);
            showToast(result.trang_thai ? 'Đã kích hoạt tài khoản!' : 'Đã vô hiệu hóa tài khoản!');
            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, trang_thai: result.trang_thai } : u));
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Thất bại!', 'error');
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            setIsSubmitting(true);
            await nguoiDungService.delete(selected.id);
            showToast(`Đã xóa tài khoản "${selected.ten_dang_nhap}"!`);
            closeModal();
            fetchUsers();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Xóa thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = users.filter((u) => {
        const matchSearch = u.ten_dang_nhap.toLowerCase().includes(searchTerm.toLowerCase()) || (u.ho_ten ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'all' || u.vai_tro === filterRole;
        const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? u.trang_thai : !u.trang_thai);
        return matchSearch && matchRole && matchStatus;
    });

    const activeCount = users.filter((u) => u.trang_thai).length;
    const onlineCount = users.filter((u) => onlineUserIds.has(u.id)).length;

    const statItems = [
        { label: 'Tổng', value: users.length, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
        { label: 'Quản Trị', value: users.filter((u) => u.vai_tro === 'Admin').length, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
        { label: 'Thu Ngân', value: users.filter((u) => u.vai_tro === 'ThuNgan').length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Phục Vụ', value: users.filter((u) => u.vai_tro === 'PhucVu').length, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Bếp', value: users.filter((u) => u.vai_tro === 'Bep').length, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
    ];

    const filterTabs = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Admin', label: 'Quản Trị' },
        { value: 'ThuNgan', label: 'Thu Ngân' },
        { value: 'PhucVu', label: 'Phục Vụ' },
        { value: 'Bep', label: 'Bếp' },
    ];

    const userFormFields: FormField[] = [
        { key: 'ten_dang_nhap', label: 'Tên Đăng Nhập', type: 'text', placeholder: 'VD: nhanvien01', required: true },
        { key: 'ho_ten', label: 'Họ & Tên', type: 'text', placeholder: 'Nguyễn Văn A' },
        { key: 'vai_tro', label: 'Vai Trò', type: 'select', options: VAI_TRO_OPTIONS, required: true },
    ];

    if (modal === 'add') {
        userFormFields.push({ key: 'mat_khau', label: 'Mật Khẩu', type: 'password', placeholder: 'Ít nhất 6 ký tự', required: true });
    }

    const resetPwFields: FormField[] = [
        { key: 'mat_khau', label: 'Mật Khẩu Mới', type: 'password', placeholder: 'Nhập mật khẩu mới', required: true },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {toastNode}

            <AdminPageHeader
                icon={<Users size={22} className="text-white" />}
                title="Quản Lý Người Dùng"
                subtitle={`${users.length} tài khoản • ${activeCount} hoạt động • ${onlineCount} online`}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm tên đăng nhập, họ tên..."
                onRefresh={fetchUsers}
                isLoading={isLoading}
                onAdd={() => { setSelected(null); setModal('add'); }}
                addLabel="Thêm Mới"
            />

            <AdminStatCards items={statItems} cols={5} />

            <div className="flex items-center justify-between flex-wrap gap-2">
                <AdminFilterTabs tabs={filterTabs} active={filterRole} onChange={setFilterRole as any} />
                <div className="flex gap-2">
                    {([
                        { v: 'all', l: 'Mọi trạng thái' },
                        { v: 'active', l: 'Hoạt động' },
                        { v: 'inactive', l: 'Đã khóa' },
                    ] as const).map((s) => (
                        <button key={s.v} onClick={() => setFilterStatus(s.v)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterStatus === s.v ? 'bg-gray-700 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}>
                            {s.l}
                        </button>
                    ))}
                </div>
            </div>

            <AdminTableCard icon={<Users size={16} />} title="Danh Sách Người Dùng" count={filtered.length}>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4 w-12 text-center">STT</th>
                            <th className="px-6 py-4">Người Dùng</th>
                            <th className="px-6 py-4">Vai Trò</th>
                            <th className="px-6 py-4">Online</th>
                            <th className="px-6 py-4">Trạng Thái</th>
                            <th className="px-6 py-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={36} className="animate-spin text-[#d9a01e]" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Users size={40} className="text-gray-200" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy người dùng</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((user, index) => {
                            const roleCfg = VAI_TRO_CONFIG[user.vai_tro];
                            return (
                                <tr key={user.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar nguoiDung={user} isOnline={onlineUserIds.has(user.id)} />
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm group-hover:text-[#d9a01e] transition-colors">{user.ho_ten || '—'}</p>
                                                <p className="text-xs text-gray-400 font-mono">@{user.ten_dang_nhap}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${roleCfg.color} ${roleCfg.bg} ${roleCfg.border}`}>
                                            {roleCfg.icon} {roleCfg.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {onlineUserIds.has(user.id) ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold"><Wifi size={12} /> Online</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-400 text-[11px] font-bold"><WifiOff size={12} /> Offline</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleToggleStatus(user)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${user.trang_thai ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'}`} title="Nhấn để bật/tắt">
                                            {user.trang_thai ? <><ToggleRight size={15} /> Hoạt động</> : <><ToggleLeft size={15} /> Bị khóa</>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => { setSelected(user); setModal('edit'); }} className="p-2 bg-gray-100 hover:bg-[#d9a01e]/15 text-gray-500 hover:text-[#d9a01e] rounded-xl border border-gray-200 hover:border-[#d9a01e]/30 transition-all" title="Chỉnh sửa"><Edit2 size={14} /></button>
                                            <button onClick={() => { setSelected(user); setModal('reset-pw'); }} className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl border border-gray-200 hover:border-blue-200 transition-all" title="Đặt lại mật khẩu"><KeyRound size={14} /></button>
                                            <button onClick={() => { setSelected(user); setModal('delete'); }} className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all" title="Xóa tài khoản"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </AdminTableCard>

            {modal && (
                <AdminModal onClose={closeModal} maxWidth={modal === 'delete' ? 'max-w-sm' : 'max-w-xl'}>
                    {(modal === 'add' || modal === 'edit') && (
                        <DynamicForm
                            title={modal === 'edit' ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
                            fields={userFormFields}
                            initialData={modal === 'edit' ? selected : { vai_tro: 'PhucVu' }}
                            onSubmit={handleFormSubmit}
                            onCancel={closeModal}
                            isLoading={isSubmitting}
                        />
                    )}
                    {modal === 'reset-pw' && selected && (
                        <DynamicForm
                            title={`Đặt lại mật khẩu cho ${selected.ten_dang_nhap}`}
                            fields={resetPwFields}
                            onSubmit={handleResetPw}
                            onCancel={closeModal}
                            isLoading={isSubmitting}
                        />
                    )}
                    {modal === 'delete' && selected && (
                        <AdminDeleteConfirm
                            itemName={selected.ten_dang_nhap}
                            itemType="tài khoản"
                            onConfirm={handleDelete}
                            onCancel={closeModal}
                            isDeleting={isSubmitting}
                        />
                    )}
                </AdminModal>
            )}
        </div>
    );
}
