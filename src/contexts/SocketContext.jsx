// contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ token, children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!token) return;

        const socket = io(import.meta.env.VITE_BACKEND_URL.replace('/api/v1/', ''), {
        auth: { token },
        transports: ['polling','websocket'],
        });

        socket.on('connect', () => console.log('🟢 Socket conectado'));
        socket.on('disconnect', () => console.log('🔴 Socket desconectado'));
        socket.on('connect_error', (error) => console.log('Error socket:', error));

        setSocket(socket);

        return () => socket.disconnect();
    }, [token]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);



