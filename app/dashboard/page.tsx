import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherDashboard from "@/components/dashboard/teacher-dashboard";
import ParentDashboard from "@/components/dashboard/parent-dashboard";

export default async function DashboardPage() {
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
        },
      },
      parentConnections: {
        include: {
          teacher: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role === "TEACHER") {
    return <TeacherDashboard user={user} />;
  }

  return <ParentDashboard user={user} />;
}
