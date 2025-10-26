"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Bell, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type Notice = {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  connection: {
    id: string;
    childName: string;
    parent: {
      name: string;
    };
    teacher: {
      name: string;
    };
  };
};

type Connection = {
  id: string;
  childName: string;
  parent?: { name: string };
  teacher?: { name: string };
};

export default function NoticesPage() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [selectedConnection, setSelectedConnection] = useState("");
  const [type, setType] = useState<"NOTICE" | "COMPLAINT">("NOTICE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const isTeacher = session?.user.role === "TEACHER";

  useEffect(() => {
    fetchNotices();
    if (isTeacher) {
      fetchConnections();
    }
  }, [isTeacher]);

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/notices");
      const data = await response.json();
      setNotices(data.notices || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: selectedConnection,
          type,
          title,
          content,
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setSelectedConnection("");
        setTitle("");
        setContent("");
        setType("NOTICE");
        fetchNotices();
      }
    } catch (error) {
      console.error("Error creating notice:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!session?.user) return null;

  const getTypeBadge = (type: string) => {
    if (type === "COMPLAINT") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Complaint
        </Badge>
      );
    }
    return (
      <Badge className="gap-1">
        <Bell className="h-3 w-3" />
        Notice
      </Badge>
    );
  };

  return (
    <DashboardLayout user={session.user as any}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notices & Complaints</h1>
            <p className="text-muted-foreground">
              {isTeacher
                ? "Create and manage notices for parents"
                : "View notices from teachers"}
            </p>
          </div>
          {isTeacher && !showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Create Notice
            </Button>
          )}
        </div>

        {isTeacher && showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Notice or Complaint</CardTitle>
              <CardDescription>
                Send a notice or complaint to a parent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNotice} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connection">Select Parent</Label>
                  <select
                    id="connection"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedConnection}
                    onChange={(e) => setSelectedConnection(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {connections.map((conn) => (
                      <option key={conn.id} value={conn.id}>
                        {conn.parent?.name} - {conn.childName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "NOTICE" | "COMPLAINT")
                    }
                  >
                    <option value="NOTICE">Notice</option>
                    <option value="COMPLAINT">Complaint</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter details..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={5}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {isTeacher ? "Sent Notices" : "Received Notices"}
            </CardTitle>
            <CardDescription>
              {isTeacher
                ? "All notices and complaints you've sent"
                : "All notices and complaints from teachers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-6 text-muted-foreground">
                Loading...
              </p>
            ) : notices.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No notices yet
              </p>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => {
                  const otherUser = isTeacher
                    ? notice.connection.parent
                    : notice.connection.teacher;

                  return (
                    <Card key={notice.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getTypeBadge(notice.type)}
                              <CardTitle className="text-lg">
                                {notice.title}
                              </CardTitle>
                            </div>
                            <CardDescription>
                              {isTeacher ? "To" : "From"} {otherUser.name} •{" "}
                              {notice.connection.childName} •{" "}
                              {format(
                                new Date(notice.createdAt),
                                "MMM d, yyyy"
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">
                          {notice.content}
                        </p>
                      </CardContent>
                    </Card>
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
