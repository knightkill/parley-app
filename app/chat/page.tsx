import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherConnections: {
        include: {
          parent: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
      parentConnections: {
        include: {
          teacher: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const connections =
    user.role === "TEACHER"
      ? user.teacherConnections
      : user.parentConnections;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Chat with {user.role === "TEACHER" ? "parents" : "teachers"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              Select a conversation to start chatting
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-2">
                  {user.role === "TEACHER"
                    ? "Generate an invite code to connect with parents"
                    : "Connect with a teacher to start chatting"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((connection: any) => {
                  const otherUser =
                    user.role === "TEACHER"
                      ? connection.parent
                      : connection.teacher;
                  const lastMessage = connection.messages[0];

                  return (
                    <Link key={connection.id} href={`/chat/${connection.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{otherUser.name}</p>
                            <span className="text-sm text-muted-foreground">
                              • {connection.childName}
                            </span>
                          </div>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
