'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Appointment } from '@/types/database';
import { toast } from '@/components/ui/use-toast';

interface UseRealtimeAppointmentsProps {
    patientId?: string;
    doctorId?: string;
    onUpdate?: (appointment: Appointment) => void;
}

export function useRealtimeAppointments({
    patientId,
    doctorId,
    onUpdate,
}: UseRealtimeAppointmentsProps) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!patientId && !doctorId) return;

        const channel = supabase
            .channel('appointments-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'appointments',
                    filter: patientId ? `pid=eq.${patientId}` : `did=eq.${doctorId}`,
                },
                (payload) => {
                    const updatedAppointment = payload.new as Appointment;

                    // Show notification based on status change
                    if (patientId) {
                        // Patient notifications
                        if (updatedAppointment.status === 'confirmed') {
                            toast({
                                title: 'Appointment Confirmed',
                                description: `Your appointment has been confirmed for ${new Date(updatedAppointment.scheduled_date).toLocaleDateString()}`,
                                variant: 'success',
                            });
                        } else if (updatedAppointment.status === 'rescheduled') {
                            toast({
                                title: 'Appointment Rescheduled',
                                description: `Your appointment has been rescheduled to ${new Date(updatedAppointment.scheduled_date).toLocaleDateString()}`,
                                variant: 'default',
                            });
                        } else if (updatedAppointment.status === 'in_progress') {
                            toast({
                                title: 'Call Started',
                                description: 'The doctor has started the video call. Click to join!',
                                variant: 'success',
                            });
                        }
                    }

                    // Call the onUpdate callback
                    if (onUpdate) {
                        onUpdate(updatedAppointment);
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                } else if (status === 'CLOSED') {
                    setIsConnected(false);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [patientId, doctorId, onUpdate]);

    return { isConnected };
}
