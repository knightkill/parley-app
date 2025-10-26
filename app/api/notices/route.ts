import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const noticeSchema = z.object({
  connectionId: z.string(),
  type: z.enum(["NOTICE", "COMPLAINT"]),
  title: z.string().min(1),
  content: z.string().min(1),
});

// GET - Fetch all notices for the user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "TEACHER") {
      // Teacher: fetch all notices they created
      const notices = await prisma.notice.findMany({
        where: {
          teacherId: session.user.id,
        },
        include: {
          connection: {
            include: {
              parent: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ notices });
    } else {
      // Parent: fetch all notices for their connections
      const connections = await prisma.connection.findMany({
        where: {
          parentId: session.user.id,
        },
      });

      const connectionIds = connections.map((c) => c.id);

      const notices = await prisma.notice.findMany({
        where: {
          connectionId: {
            in: connectionIds,
          },
        },
        include: {
          connection: {
            include: {
              teacher: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ notices });
    }
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}

// POST - Create a new notice (teachers only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { connectionId, type, title, content } = noticeSchema.parse(body);

    // Verify connection exists and teacher has access
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        teacherId: session.user.id,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found or unauthorized" },
        { status: 404 }
      );
    }

    const notice = await prisma.notice.create({
      data: {
        teacherId: session.user.id,
        connectionId,
        type,
        title,
        content,
      },
      include: {
        connection: {
          include: {
            parent: true,
          },
        },
      },
    });

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating notice:", error);
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    );
  }
}
