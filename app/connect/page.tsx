"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function ConnectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [childName, setChildName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.toUpperCase(),
          childName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to connect");
      } else {
        setSuccess(data.message);
        setInviteCode("");
        setChildName("");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) return null;

  return (
    <DashboardLayout user={session.user as any}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Connect with a Teacher</h1>
          <p className="text-muted-foreground">
            Use an invite code from your child&apos;s teacher to connect
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Invite Code</CardTitle>
            <CardDescription>
              Ask your child&apos;s teacher for an invite code to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="ABCD1234"
                  value={inviteCode}
                  onChange={(e) =>
                    setInviteCode(e.target.value.toUpperCase())
                  }
                  required
                  disabled={isLoading}
                  maxLength={8}
                  className="font-mono text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 8-character code provided by your teacher
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="childName">Child&apos;s Name</Label>
                <Input
                  id="childName"
                  type="text"
                  placeholder="John Doe"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your child&apos;s name to help the teacher identify them
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect with Teacher"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Ask your child&apos;s teacher for an invite code</p>
            <p>2. Enter the code and your child&apos;s name above</p>
            <p>3. Once connected, you can chat and schedule appointments</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
