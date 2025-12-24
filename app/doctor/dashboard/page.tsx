'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentCard } from '@/components/appointment-card';
import { RescheduleModal } from '@/components/reschedule-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentWithDetails } from '@/types/database';
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments';
import { LogOut, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function DoctorDashboard() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [doctorId, setDoctorId] = useState<string | null>(null);

    // Fetch appointments
    const fetchAppointments = async () => {
        try {
            const response = await fetch('/api/doctor/appointments');
            const data = await response.json();

            if (data.success) {
                setAppointments(data.data);
                // Extract doctor ID from first appointment if available
                if (data.data.length > 0) {
                    setDoctorId(data.data[0].did);
                }
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast({
                title: 'Error',
                description: 'Failed to load appointments',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Set up real-time subscriptions
    useRealtimeAppointments({
        doctorId: doctorId || undefined,
        onUpdate: (updatedAppointment) => {
            setAppointments((prev) =>
                prev.map((apt) =>
                    apt.aid === updatedAppointment.aid ? { ...apt, ...updatedAppointment } : apt
                )
            );
        },
    });

    const handleApprove = async (appointmentId: string) => {
        try {
            const response = await fetch(`/api/doctor/appointments/${appointmentId}/approve`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Appointment Approved',
                    description: 'The appointment has been confirmed',
                    variant: 'success',
                });
                fetchAppointments();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to approve appointment',
                variant: 'destructive',
            });
        }
    };

    const handleReschedule = (appointment: AppointmentWithDetails) => {
        setSelectedAppointment(appointment);
        setIsRescheduleModalOpen(true);
    };

    const handleSubmitReschedule = async (appointmentId: string, data: any) => {
        try {
            const response = await fetch(`/api/doctor/appointments/${appointmentId}/reschedule`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                fetchAppointments();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            throw error;
        }
    };

    const handleStartCall = async (appointmentId: string) => {
        try {
            const response = await fetch(`/api/doctor/appointments/${appointmentId}/start-call`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Call Started',
                    description: 'Redirecting to video call...',
                    variant: 'success',
                });
                // Redirect to call page
                router.push(data.data.meeting_link);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to start call',
                variant: 'destructive',
            });
        }
    };

    const handleCompleteCall = async (appointmentId: string) => {
        try {
            const response = await fetch(`/api/doctor/appointments/${appointmentId}/complete`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Appointment Completed',
                    description: 'The appointment has been marked as completed',
                    variant: 'success',
                });
                fetchAppointments();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to complete appointment',
                variant: 'destructive',
            });
        }
    };

    const handleMarkComplete = handleCompleteCall;

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    // Filter appointments by status
    const scheduledAppointments = appointments.filter((a) => a.status === 'scheduled');
    const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed' || a.status === 'in_progress');
    const rescheduledAppointments = appointments.filter((a) => a.status === 'rescheduled');
    const todayAppointments = appointments.filter((a) => {
        const today = new Date().toISOString().split('T')[0];
        return a.scheduled_date === today && ['scheduled', 'confirmed', 'rescheduled', 'in_progress'].includes(a.status);
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Doctor Dashboard
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage your appointments and consultations
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="pending" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                        <TabsTrigger value="pending">
                            Pending ({scheduledAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="confirmed">
                            Confirmed ({confirmedAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="rescheduled">
                            Rescheduled ({rescheduledAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="today">
                            Today ({todayAppointments.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {scheduledAppointments.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border">
                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No pending appointments</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {scheduledAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.aid}
                                        appointment={appointment}
                                        viewType="doctor"
                                        onApprove={handleApprove}
                                        onReschedule={handleReschedule}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="confirmed" className="space-y-4">
                        {confirmedAppointments.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border">
                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No confirmed appointments</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {confirmedAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.aid}
                                        appointment={appointment}
                                        viewType="doctor"
                                        onReschedule={handleReschedule}
                                        onStartCall={handleStartCall}
                                        onCompleteCall={handleCompleteCall}
                                        onMarkComplete={handleMarkComplete}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rescheduled" className="space-y-4">
                        {rescheduledAppointments.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border">
                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No rescheduled appointments</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rescheduledAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.aid}
                                        appointment={appointment}
                                        viewType="doctor"
                                        onReschedule={handleReschedule}
                                        onStartCall={handleStartCall}
                                        onCompleteCall={handleCompleteCall}
                                        onMarkComplete={handleMarkComplete}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="today" className="space-y-4">
                        {todayAppointments.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border">
                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No appointments today</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {todayAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.aid}
                                        appointment={appointment}
                                        viewType="doctor"
                                        onApprove={handleApprove}
                                        onReschedule={handleReschedule}
                                        onStartCall={handleStartCall}
                                        onCompleteCall={handleCompleteCall}
                                        onMarkComplete={handleMarkComplete}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            {/* Reschedule Modal */}
            <RescheduleModal
                open={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                appointment={selectedAppointment}
                onSubmit={handleSubmitReschedule}
            />
        </div>
    );
}
