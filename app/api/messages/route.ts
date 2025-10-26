import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  connectionId: z.string(),
  content: z.string().min(1),
});

// GET - Fetch messages for a connection
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this connection
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { parentId: session.user.id },
          { teacherId: session.user.id },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found or unauthorized" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        connectionId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { connectionId, content } = messageSchema.parse(body);

    // Verify connection and get receiver ID
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { parentId: session.user.id },
          { teacherId: session.user.id },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found or unauthorized" },
        { status: 404 }
      );
    }

    // Determine receiver ID
    const receiverId =
      connection.parentId === session.user.id
        ? connection.teacherId
        : connection.parentId;

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        connectionId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
