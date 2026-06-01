import { useState, useEffect } from 'react';
import { banAnService } from '@/services/banAn.service';
import { BanAn } from '@/types/banAn';

export function useTableQR(ban: BanAn) {
    const [qrData, setQrData] = useState<{ qr_code: string; order_url: string } | null>(null);
    const [isLoadingQR, setIsLoadingQR] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        banAnService.getQRCode(ban.id)
            .then(data => setQrData(data))
            .catch(() => setQrData(null))
            .finally(() => setIsLoadingQR(false));
    }, [ban.id]);

    const handleDownload = () => {
        if (!qrData) return;
        const link = document.createElement('a');
        link.href = qrData.qr_code;
        link.download = `QR_Ban_${ban.so_ban.replace(/\s/g, '_')}.png`;
        link.click();
    };

    const handleCopyLink = async () => {
        if (!qrData) return;
        await navigator.clipboard.writeText(qrData.order_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return { qrData, isLoadingQR, copied, handleDownload, handleCopyLink };
}
