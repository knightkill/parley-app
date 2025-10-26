"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Copy, Plus, Check } from "lucide-react";
import { format } from "date-fns";

type InviteCode = {
  id: string;
  code: string;
  expiresAt: string;
  createdAt: string;
  isUsed: boolean;
};

export default function InviteCodesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user.role !== "TEACHER") {
      router.push("/dashboard");
      return;
    }

    fetchInviteCodes();
  }, [session, router]);

  const fetchInviteCodes = async () => {
    try {
      const response = await fetch("/api/invite-codes");
      const data = await response.json();
      setInviteCodes(data.inviteCodes || []);
    } catch (error) {
      console.error("Error fetching invite codes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/invite-codes", {
        method: "POST",
      });

      if (response.ok) {
        fetchInviteCodes();
      }
    } catch (error) {
      console.error("Error generating invite code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  if (!session?.user) return null;

  return (
    <DashboardLayout user={session.user as any}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invite Codes</h1>
            <p className="text-muted-foreground">
              Generate codes for parents to connect with you
            </p>
          </div>
          <Button onClick={generateCode} disabled={isGenerating}>
            <Plus className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Code"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Invite Codes</CardTitle>
            <CardDescription>
              Share these codes with parents to connect with their children
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-6 text-muted-foreground">
                Loading...
              </p>
            ) : inviteCodes.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No invite codes yet. Generate one to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {inviteCodes.map((invite) => {
                  const isExpired = new Date() > new Date(invite.expiresAt);
                  return (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <code className="text-2xl font-mono font-bold">
                          {invite.code}
                        </code>
                        <div className="flex gap-2">
                          {invite.isUsed && (
                            <Badge variant="secondary">Used</Badge>
                          )}
                          {isExpired && !invite.isUsed && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                          {!invite.isUsed && !isExpired && (
                            <Badge>Active</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Created: {format(new Date(invite.createdAt), "MMM d, yyyy")}</p>
                          <p>Expires: {format(new Date(invite.expiresAt), "MMM d, yyyy")}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(invite.code)}
                          disabled={invite.isUsed || isExpired}
                        >
                          {copiedCode === invite.code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
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
