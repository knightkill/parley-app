import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId } = await params;

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { parentId: session.user.id },
          { teacherId: session.user.id },
        ],
      },
      include: {
        parent: true,
        teacher: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Determine the other user
    const otherUser =
      connection.parentId === session.user.id
        ? connection.teacher
        : connection.parent;

    return NextResponse.json({
      connection,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role,
      },
    });
  } catch (error) {
    console.error("Error fetching connection:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection" },
      { status: 500 }
    );
  }
}
