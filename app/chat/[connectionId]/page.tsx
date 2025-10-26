"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ArrowLeft } from "lucide-react";
import { useSocket } from "@/lib/socket";
import { format } from "date-fns";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
};

export default function ChatConversationPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const connectionId = params?.connectionId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!connectionId) return;

    fetchMessages();
    fetchConnectionDetails();
  }, [connectionId]);

  useEffect(() => {
    if (socket && connectionId) {
      // Join the conversation room
      socket.emit("join-conversation", connectionId);

      // Set up the message listener
      const handleNewMessage = (message: Message) => {
        setMessages((prev) => {
          // Prevent duplicate messages
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      };

      socket.on("new-message", handleNewMessage);

      return () => {
        socket.emit("leave-conversation", connectionId);
        socket.off("new-message", handleNewMessage);
      };
    }
  }, [socket, connectionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/messages?connectionId=${connectionId}`
      );
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnectionDetails = async () => {
    try {
      const response = await fetch(`/api/connections/${connectionId}`);
      if (response.ok) {
        const data = await response.json();
        setOtherUser(data.otherUser);
      }
    } catch (error) {
      console.error("Error fetching connection details:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewMessage("");

        // Emit socket event for real-time update
        if (socket) {
          socket.emit("send-message", {
            conversationId: connectionId,
            message: data.message,
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!session?.user) return null;

  return (
    <DashboardLayout user={session.user as any}>
      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-lg">
                {otherUser ? otherUser.name : "Loading..."}
              </CardTitle>
              {otherUser && (
                <p className="text-sm text-muted-foreground">
                  {otherUser.role === "TEACHER" ? "Teacher" : "Parent"}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet</p>
                <p className="text-sm mt-2">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === session.user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {format(new Date(message.createdAt), "p")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t flex gap-2"
          >
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="flex-1"
            />
            <Button type="submit" disabled={isSending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
