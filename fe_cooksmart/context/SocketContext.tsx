'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { getTokenPayload, isTokenExpired } from '@/lib/token';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

/**
 * SocketProvider – Kết nối Socket.io và tự đăng ký userId khi user đã đăng nhập.
 * Bọc ở layout cấp cao (admin, POS, Bếp) để tất cả pages con đều share 1 kết nối.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log("Socket connected:", socketInstance.id);
            // Gửi userId để server track online status
            if (!isTokenExpired()) {
                const payload = getTokenPayload();
                if (payload?.id) {
                    socketInstance.emit('dang_nhap', payload.id);
                }
            }
        });

        return () => {
            socketInstance.disconnect();
            setSocket(null);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
