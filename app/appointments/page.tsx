"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Calendar, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";

type Appointment = {
  id: string;
  dateTime: string;
  status: string;
  notes: string | null;
  connection: {
    id: string;
    childName: string;
    parent: {
      id: string;
      name: string;
    };
    teacher: {
      id: string;
      name: string;
    };
  };
};

type Connection = {
  id: string;
  childName: string;
  parent?: { name: string };
  teacher?: { name: string };
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [selectedConnection, setSelectedConnection] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchConnections();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: selectedConnection,
          dateTime,
          notes,
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setSelectedConnection("");
        setDateTime("");
        setNotes("");
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  if (!session?.user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout user={session.user as any}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">
              Schedule and manage appointments
            </p>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          )}
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Appointment</CardTitle>
              <CardDescription>
                Create a new appointment request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connection">
                    {session.user.role === "TEACHER"
                      ? "Select Parent"
                      : "Select Teacher"}
                  </Label>
                  <select
                    id="connection"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedConnection}
                    onChange={(e) => setSelectedConnection(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {connections.map((conn) => {
                      const name =
                        session.user.role === "TEACHER"
                          ? conn.parent?.name
                          : conn.teacher?.name;
                      return (
                        <option key={conn.id} value={conn.id}>
                          {name} - {conn.childName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTime">Date & Time</Label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Appointment"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
            <CardDescription>
              All scheduled and pending appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-6 text-muted-foreground">
                Loading...
              </p>
            ) : appointments.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No appointments yet
              </p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const otherUser =
                    session.user.role === "TEACHER"
                      ? appointment.connection.parent
                      : appointment.connection.teacher;
                  const canManageStatus =
                    session.user.role === "TEACHER" &&
                    appointment.status === "PENDING";

                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {format(
                              new Date(appointment.dateTime),
                              "PPP 'at' p"
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          With {otherUser.name} (
                          {appointment.connection.childName})
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {canManageStatus && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(
                                  appointment.id,
                                  "CONFIRMED"
                                )
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(
                                  appointment.id,
                                  "CANCELLED"
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
