import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gọi Món | CookSmart',
    description: 'Chọn món yêu thích và đặt hàng ngay tại bàn của bạn.',
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#fdf6ec]">
            {children}
        </div>
    );
}
