import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const connectSchema = z.object({
  inviteCode: z.string().min(1),
  childName: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inviteCode, childName } = connectSchema.parse(body);

    // Find the invite code
    const invite = await prisma.inviteCode.findUnique({
      where: { code: inviteCode.toUpperCase() },
      include: { teacher: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    if (invite.isUsed) {
      return NextResponse.json(
        { error: "This invite code has already been used" },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "This invite code has expired" },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findUnique({
      where: {
        parentId_teacherId: {
          parentId: session.user.id,
          teacherId: invite.teacherId,
        },
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: "You are already connected to this teacher" },
        { status: 400 }
      );
    }

    // Create the connection
    const connection = await prisma.connection.create({
      data: {
        parentId: session.user.id,
        teacherId: invite.teacherId,
        childName,
      },
      include: {
        teacher: true,
      },
    });

    // Mark invite code as used
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: { isUsed: true },
    });

    return NextResponse.json(
      {
        connection,
        message: `Successfully connected with ${invite.teacher.name}!`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error connecting:", error);
    return NextResponse.json(
      { error: "Failed to connect with teacher" },
      { status: 500 }
    );
  }
}
