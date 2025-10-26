import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate a random 8-character invite code
function generateInviteCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// GET - List all invite codes for the teacher
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inviteCodes = await prisma.inviteCode.findMany({
      where: {
        teacherId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ inviteCodes });
  } catch (error) {
    console.error("Error fetching invite codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite codes" },
      { status: 500 }
    );
  }
}

// POST - Generate a new invite code
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a unique code
    let code = generateInviteCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await prisma.inviteCode.findUnique({
        where: { code },
      });

      if (!existing) break;

      code = generateInviteCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique code" },
        { status: 500 }
      );
    }

    // Create invite code that expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        teacherId: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json({ inviteCode }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite code:", error);
    return NextResponse.json(
      { error: "Failed to create invite code" },
      { status: 500 }
    );
  }
}
