import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef   = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // fetch real unread count from DB on mount / login
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data.count ?? 0);
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      setUnreadCount(0);
      return;
    }

    // load real count from DB immediately on login
    fetchUnreadCount();

    const SOCKET_URL =
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const socket = io(SOCKET_URL, {
      transports:      ['websocket', 'polling'],
      withCredentials: true,
      reconnection:        true,
      reconnectionAttempts: 10,
      reconnectionDelay:    1000,
    });

    socketRef.current = socket;

    //join private room on first connect
    socket.on('connect', () => {
      console.log(`🔌 Socket connected: ${socket.id}`);
      socket.emit('join', user._id);
    });

    // re-join room after reconnect (network drop, server restart etc.)
    socket.on('reconnect', () => {
      console.log('🔄 Socket reconnected — re-joining room');
      socket.emit('join', user._id);
    });

    // real-time notification arrives,increment badge
    socket.on('new_notification', (notification) => {
      setUnreadCount(prev => prev + 1);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?._id, fetchUnreadCount]);

  const resetUnreadCount    = () => setUnreadCount(0);
  const decrementUnreadCount = (by = 1) =>
    setUnreadCount(prev => Math.max(0, prev - by));

  return (
    <SocketContext.Provider
      value={{
        socket:              socketRef.current,
        unreadCount,
        setUnreadCount,
        resetUnreadCount,
        decrementUnreadCount,
        fetchUnreadCount,    
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export default SocketContext;