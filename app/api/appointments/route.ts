import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const appointmentSchema = z.object({
  connectionId: z.string(),
  dateTime: z.string(),
  notes: z.string().optional(),
});

// GET - Fetch all appointments for the user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all connections for the user
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { parentId: session.user.id },
          { teacherId: session.user.id },
        ],
      },
    });

    const connectionIds = connections.map((c) => c.id);

    const appointments = await prisma.appointment.findMany({
      where: {
        connectionId: {
          in: connectionIds,
        },
      },
      include: {
        connection: {
          include: {
            parent: true,
            teacher: true,
          },
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST - Create a new appointment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { connectionId, dateTime, notes } = appointmentSchema.parse(body);

    // Verify connection exists and user has access
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

    const appointment = await prisma.appointment.create({
      data: {
        connectionId,
        dateTime: new Date(dateTime),
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        connection: {
          include: {
            parent: true,
            teacher: true,
          },
        },
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
