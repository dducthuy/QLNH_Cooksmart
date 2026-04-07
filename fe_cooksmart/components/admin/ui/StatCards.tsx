'use client';

export interface StatItem {
    label: string;
    value: number;
    color: string;   // Tailwind text color, e.g. 'text-gray-800'
    bg: string;      // Tailwind bg color, e.g. 'bg-white'
    border: string;  // Tailwind border color, e.g. 'border-gray-100'
}

interface AdminStatCardsProps {
    items: StatItem[];
    /** Số cột (mặc định tự động theo số item) */
    cols?: number;
}

export function AdminStatCards({ items, cols }: AdminStatCardsProps) {
    const gridColsMap: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    };

    const colClass = cols
        ? gridColsMap[cols] || 'grid-cols-3'
        : items.length <= 3
        ? gridColsMap[items.length] || 'grid-cols-3'
        : 'grid-cols-2 md:grid-cols-4';

    return (
        <div className={`grid ${colClass} gap-4`}>
            {items.map((s) => (
                <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 shadow-sm`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
            ))}
        </div>
    );
}
