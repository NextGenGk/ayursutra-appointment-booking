'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppointmentWithDetails } from '@/types/database';
import { getMinDate, formatDate, formatTime } from '@/lib/utils/date';
import { toast } from '@/components/ui/use-toast';

const rescheduleSchema = z.object({
    newDate: z.string().min(1, 'Date is required'),
    newTime: z.string().min(1, 'Time is required'),
    reason: z.string().optional(),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface RescheduleModalProps {
    open: boolean;
    onClose: () => void;
    appointment: AppointmentWithDetails | null;
    onSubmit: (appointmentId: string, data: RescheduleFormData) => Promise<void>;
}

export function RescheduleModal({
    open,
    onClose,
    appointment,
    onSubmit,
}: RescheduleModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<RescheduleFormData>({
        resolver: zodResolver(rescheduleSchema),
    });

    const handleFormSubmit = async (data: RescheduleFormData) => {
        if (!appointment) return;

        setIsSubmitting(true);
        try {
            await onSubmit(appointment.aid, data);
            toast({
                title: 'Appointment Rescheduled',
                description: 'The appointment has been rescheduled successfully.',
                variant: 'success',
            });
            reset();
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to reschedule appointment. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!appointment) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Reschedule Appointment</DialogTitle>
                    <DialogDescription>
                        Update the appointment date and time
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold">Current Appointment Details</h4>
                    <p className="text-sm">
                        <span className="text-muted-foreground">Patient:</span>{' '}
                        {appointment.patient_name}
                    </p>
                    <p className="text-sm">
                        <span className="text-muted-foreground">Current Date:</span>{' '}
                        {formatDate(appointment.scheduled_date)}
                    </p>
                    <p className="text-sm">
                        <span className="text-muted-foreground">Current Time:</span>{' '}
                        {formatTime(appointment.scheduled_time)}
                    </p>
                    <p className="text-sm">
                        <span className="text-muted-foreground">Mode:</span>{' '}
                        {appointment.mode === 'online' ? 'Online' : 'Offline'}
                    </p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="newDate">New Date *</Label>
                            <Input
                                id="newDate"
                                type="date"
                                min={getMinDate()}
                                {...register('newDate')}
                            />
                            {errors.newDate && (
                                <p className="text-sm text-destructive">{errors.newDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newTime">New Time *</Label>
                            <Input
                                id="newTime"
                                type="time"
                                {...register('newTime')}
                            />
                            {errors.newTime && (
                                <p className="text-sm text-destructive">{errors.newTime.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Rescheduling (Optional)</Label>
                        <Textarea
                            id="reason"
                            {...register('reason')}
                            placeholder="Provide a reason for rescheduling..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="default" disabled={isSubmitting}>
                            {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
