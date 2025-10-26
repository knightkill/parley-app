"use client";

import { User, Connection } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Calendar, Bell, Users } from "lucide-react";
import DashboardLayout from "./dashboard-layout";

type ParentDashboardProps = {
  user: User & {
    parentConnections: (Connection & {
      teacher: User;
    })[];
  };
};

export default function ParentDashboard({ user }: ParentDashboardProps) {
  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">
            Stay connected with your child&apos;s teachers
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Connected Teachers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.parentConnections.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href="/chat">View Chats</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href="/appointments">View</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notices</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href="/notices">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Children&apos;s Teachers</CardTitle>
            <CardDescription>
              Teachers you&apos;re currently connected with
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.parentConnections.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No teachers connected yet.</p>
                <p className="text-sm mt-2">
                  Use an invite code from a teacher to connect.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/connect">Connect with Teacher</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {user.parentConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{connection.teacher.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Child: {connection.childName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/chat/${connection.id}`}>Chat</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
