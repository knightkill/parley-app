import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const body = await req.json();
    const { status } = updateSchema.parse(body);

    // Find the appointment and verify access
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        connection: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this appointment
    const hasAccess =
      appointment.connection.parentId === session.user.id ||
      appointment.connection.teacherId === session.user.id;

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        connection: {
          include: {
            parent: true,
            teacher: true,
          },
        },
      },
    });

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
