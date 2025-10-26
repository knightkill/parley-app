import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log("New socket connection:", socket.id);

      // Join a conversation room
      socket.on("join-conversation", (conversationId: string) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      // Leave a conversation room
      socket.on("leave-conversation", (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      // Handle new messages
      socket.on("send-message", (data: { conversationId: string; message: any }) => {
        // Broadcast to all clients in the conversation room
        io.to(data.conversationId).emit("new-message", data.message);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
