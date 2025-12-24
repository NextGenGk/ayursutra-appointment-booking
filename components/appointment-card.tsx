'use client';

import { AppointmentWithDetails } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    User,
    Video,
    MapPin,
    FileText,
    Hash
} from 'lucide-react';
import { formatDate, formatTime, isCallButtonActive } from '@/lib/utils/date';

interface AppointmentCardProps {
    appointment: AppointmentWithDetails;
    viewType: 'patient' | 'doctor';
    onApprove?: (appointmentId: string) => void;
    onReschedule?: (appointment: AppointmentWithDetails) => void;
    onStartCall?: (appointmentId: string) => void;
    onCompleteCall?: (appointmentId: string) => void;
    onJoinCall?: (meetingLink: string) => void;
    onMarkComplete?: (appointmentId: string) => void;
}

const statusColors: Record<string, string> = {
    scheduled: 'pending-soft',
    confirmed: 'confirmed-soft', 
    rescheduled: 'info',
    in_progress: 'health',
    completed: 'completed-soft',
    cancelled: 'cancelled-soft',
};

export function AppointmentCard({
    appointment,
    viewType,
    onApprove,
    onReschedule,
    onStartCall,
    onCompleteCall,
    onJoinCall,
    onMarkComplete,
}: AppointmentCardProps) {
    const canStartCall =
        appointment.mode === 'online' &&
        (appointment.status === 'confirmed' || appointment.status === 'rescheduled') &&
        isCallButtonActive(appointment.scheduled_date, appointment.scheduled_time);

    const isCallInProgress = appointment.status === 'in_progress';

    return (
        <Card className="overflow-hidden hover:shadow-green-md transition-all duration-300 hover:-translate-y-1 border hover:border-primary-green/30">
            <CardHeader className="pb-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {viewType === 'patient' && appointment.doctor
                                ? `Dr. ${appointment.doctor.user.name}`
                                : appointment.patient_name}
                        </h3>
                        {viewType === 'doctor' && (
                            <p className="text-sm text-muted-foreground">
                                Age: {appointment.patient_age} years
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={statusColors[appointment.status] as any}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant={appointment.mode === 'online' ? 'health' : 'info'}>
                            {appointment.mode === 'online' ? (
                                <><Video className="w-3 h-3 mr-1" /> Online</>
                            ) : (
                                <><MapPin className="w-3 h-3 mr-1" /> Offline</>
                            )}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary-green" />
                        <span>{formatDate(appointment.scheduled_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary-green" />
                        <span>{formatTime(appointment.scheduled_time)}</span>
                    </div>
                </div>

                {appointment.mode === 'offline' && appointment.token_number && (
                    <div className="flex items-center gap-2 text-sm">
                        <Hash className="w-4 h-4 text-primary-green" />
                        <span className="font-semibold">Token: {appointment.token_number}</span>
                    </div>
                )}


                {viewType === 'doctor' && appointment.chief_complaint && (
                    <div className="flex items-start gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary-green mt-0.5" />
                        <div>
                            <p className="font-medium">Chief Complaint:</p>
                            <p className="text-muted-foreground">{appointment.chief_complaint}</p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
                {/* Doctor Actions */}
                {viewType === 'doctor' && appointment.status === 'scheduled' && (
                    <>
                        <Button
                            onClick={() => onApprove?.(appointment.aid)}
                            variant="success"
                            size="sm"
                            className="flex-1"
                        >
                            Approve
                        </Button>
                        <Button
                            onClick={() => onReschedule?.(appointment)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            Reschedule
                        </Button>
                    </>
                )}


                {viewType === 'doctor' &&
                    (appointment.status === 'confirmed' || appointment.status === 'rescheduled' || appointment.status === 'in_progress') &&
                    appointment.mode === 'online' && (
                        <>
                            {!isCallInProgress && (
                                <Button
                                    onClick={() => onStartCall?.(appointment.aid)}
                                    variant="gradient"
                                    size="sm"
                                    className="flex-1"
                                    disabled={!canStartCall}
                                >
                                    {canStartCall ? 'Start Call' : 'Call not available yet'}
                                </Button>
                            )}
                            {isCallInProgress && (
                                <Button
                                    onClick={() => onCompleteCall?.(appointment.aid)}
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                >
                                    Complete Call
                                </Button>
                            )}
                        </>
                    )}

                {viewType === 'doctor' &&
                    (appointment.status === 'confirmed' || appointment.status === 'rescheduled' || appointment.status === 'in_progress') &&
                    appointment.mode === 'offline' && (
                        <Button
                            onClick={() => onMarkComplete?.(appointment.aid)}
                            variant="success"
                            size="sm"
                            className="flex-1"
                        >
                            Mark as Completed
                        </Button>
                    )}

                {viewType === 'doctor' &&
                    (appointment.status === 'confirmed' || appointment.status === 'rescheduled') && (
                        <Button
                            onClick={() => onReschedule?.(appointment)}
                            variant="outline"
                            size="sm"
                        >
                            Reschedule
                        </Button>
                    )}

                {/* Patient Actions */}
                {(() => {
                    if (viewType === 'patient') {
                        console.log('Patient view - Appointment:', {
                            aid: appointment.aid,
                            status: appointment.status,
                            meeting_link: appointment.meeting_link,
                            mode: appointment.mode,
                        });
                    }
                    return null;
                })()}

                {viewType === 'patient' &&
                    appointment.status === 'in_progress' &&
                    appointment.meeting_link && (
                        <Button
                            onClick={() => onJoinCall?.(appointment.meeting_link!)}
                            variant="gradient"
                            size="sm"
                            className="w-full"
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Join Call
                        </Button>
                    )}

                {viewType === 'patient' &&
                    (appointment.status === 'confirmed' || appointment.status === 'rescheduled') &&
                    appointment.mode === 'online' &&
                    canStartCall && (
                        <div className="w-full text-center text-sm text-muted-foreground">
                            Waiting for doctor to start the call...
                        </div>
                    )}
            </CardFooter>
        </Card>
    );
}
