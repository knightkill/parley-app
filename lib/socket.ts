"use client";

import { useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Use environment variable or fallback to current origin
    const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

    const socketInstance = ClientIO(socketUrl, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
