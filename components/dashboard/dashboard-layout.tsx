"use client";

import { User } from "@prisma/client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Calendar,
  Bell,
  Home,
  LogOut,
  UserPlus,
  KeyRound,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type DashboardLayoutProps = {
  user: User;
  children: React.ReactNode;
};

export default function DashboardLayout({
  user,
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  const isTeacher = user.role === "TEACHER";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/notices", label: "Notices", icon: Bell },
    ...(isTeacher
      ? [{ href: "/invite-codes", label: "Invite Codes", icon: KeyRound }]
      : [{ href: "/connect", label: "Connect", icon: UserPlus }]),
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-2xl font-bold">
                Parley
              </Link>
              <span className="text-sm text-muted-foreground">
                {isTeacher ? "Teacher" : "Parent"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
