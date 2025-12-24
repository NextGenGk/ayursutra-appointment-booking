'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorCard } from '@/components/doctor-card';
import { AppointmentCard } from '@/components/appointment-card';
import { BookingModal } from '@/components/booking-modal';
import { Button } from '@/components/ui/button';
import { DoctorWithUser, AppointmentWithDetails } from '@/types/database';
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments';
import { LogOut, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function PatientDashboard() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [patientId, setPatientId] = useState<string | null>(null);
    const hasFetched = useRef(false);

    // Fetch doctors and appointments
    useEffect(() => {
        // Prevent duplicate fetches (React 18 strict mode runs effects twice in dev)
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchData = async () => {
            try {
                // Fetch doctors
                const doctorsRes = await fetch('/api/patient/doctors');
                const doctorsData = await doctorsRes.json();

                if (doctorsData.success) {
                    setDoctors(doctorsData.data);
                }

                // Fetch appointments
                const appointmentsRes = await fetch('/api/patient/appointments');
                const appointmentsData = await appointmentsRes.json();

                if (appointmentsData.success) {
                    setAppointments(appointmentsData.data);
                    // Extract patient ID from first appointment if available
                    if (appointmentsData.data.length > 0) {
                        setPatientId(appointmentsData.data[0].pid);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load data',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Set up real-time subscriptions
    useRealtimeAppointments({
        patientId: patientId || undefined,
        onUpdate: (updatedAppointment) => {
            console.log('Real-time update received:', updatedAppointment);

            // If appointment is completed, remove it from the list
            if (updatedAppointment.status === 'completed') {
                setAppointments((prev) => prev.filter((apt) => apt.aid !== updatedAppointment.aid));
            } else {
                // Otherwise, update the appointment in the list
                setAppointments((prev) =>
                    prev.map((apt) =>
                        apt.aid === updatedAppointment.aid ? { ...apt, ...updatedAppointment } : apt
                    )
                );
            }
        },
    });

    const handleBookAppointment = (doctor: DoctorWithUser) => {
        setSelectedDoctor(doctor);
        setIsBookingModalOpen(true);
    };

    const handleSubmitBooking = async (data: any) => {
        try {
            const response = await fetch('/api/patient/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                // Refresh appointments
                const appointmentsRes = await fetch('/api/patient/appointments');
                const appointmentsData = await appointmentsRes.json();
                if (appointmentsData.success) {
                    setAppointments(appointmentsData.data);
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            throw error;
        }
    };

    const handleJoinCall = (meetingLink: string) => {
        router.push(meetingLink);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Patient Dashboard
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Book appointments and manage your healthcare
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
                {/* My Appointments Section */}
                {appointments.filter(apt => apt.status !== 'completed').length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">My Appointments</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {appointments
                                .filter(apt => apt.status !== 'completed')
                                .map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.aid}
                                        appointment={appointment}
                                        viewType="patient"
                                        onJoinCall={handleJoinCall}
                                    />
                                ))}
                        </div>
                    </section>
                )}

                {/* Available Doctors Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Available Doctors</h2>
                    {doctors.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border">
                            <p className="text-muted-foreground">No doctors available at the moment</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor.did}
                                    doctor={doctor}
                                    onBookAppointment={handleBookAppointment}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Booking Modal */}
            <BookingModal
                open={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                doctor={selectedDoctor}
                onSubmit={handleSubmitBooking}
            />
        </div>
    );
}
