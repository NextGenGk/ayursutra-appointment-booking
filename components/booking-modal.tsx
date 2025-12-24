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
import { DoctorWithUser } from '@/types/database';
import { getMinDate } from '@/lib/utils/date';
import { toast } from '@/components/ui/use-toast';

const bookingSchema = z.object({
    mode: z.enum(['online', 'offline']),
    scheduledDate: z.string().min(1, 'Date is required'),
    scheduledTime: z.string().min(1, 'Time is required'),
    chiefComplaint: z.string().min(10, 'Please provide at least 10 characters'),
    symptoms: z.array(z.string()).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
    open: boolean;
    onClose: () => void;
    doctor: DoctorWithUser | null;
    onSubmit: (data: BookingFormData & { did: string }) => Promise<void>;
}

export function BookingModal({ open, onClose, doctor, onSubmit }: BookingModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            mode: 'online',
        },
    });

    const mode = watch('mode');

    const handleFormSubmit = async (data: BookingFormData) => {
        if (!doctor) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ ...data, did: doctor.did });
            toast({
                title: 'Appointment Requested',
                description: `Your appointment request has been sent to Dr. ${doctor.user.name}`,
                variant: 'success',
            });
            reset();
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to book appointment. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!doctor) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Book Appointment</DialogTitle>
                    <DialogDescription>
                        Dr. {doctor.user.name} • {doctor.specialization} • ₹{doctor.consultation_fee}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Mode of Appointment *</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="online"
                                    {...register('mode')}
                                    className="w-4 h-4 text-primary"
                                />
                                <span>Online (Video Call)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="offline"
                                    {...register('mode')}
                                    className="w-4 h-4 text-primary"
                                />
                                <span>Offline (In-person)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="scheduledDate">Preferred Date *</Label>
                            <Input
                                id="scheduledDate"
                                type="date"
                                min={getMinDate()}
                                {...register('scheduledDate')}
                            />
                            {errors.scheduledDate && (
                                <p className="text-sm text-destructive">{errors.scheduledDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledTime">Preferred Time *</Label>
                            <Input
                                id="scheduledTime"
                                type="time"
                                {...register('scheduledTime')}
                            />
                            {errors.scheduledTime && (
                                <p className="text-sm text-destructive">{errors.scheduledTime.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="chiefComplaint">Reason for Appointment *</Label>
                        <Textarea
                            id="chiefComplaint"
                            {...register('chiefComplaint')}
                            placeholder="Describe your symptoms or reason for consultation..."
                            rows={4}
                        />
                        {errors.chiefComplaint && (
                            <p className="text-sm text-destructive">{errors.chiefComplaint.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Symptoms (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2 p-4 border rounded-md max-h-48 overflow-y-auto">
                            {[
                                'Fever',
                                'Cough',
                                'Headache',
                                'Fatigue',
                                'Nausea',
                                'Vomiting',
                                'Diarrhea',
                                'Abdominal pain',
                                'Chest pain',
                                'Shortness of breath',
                                'Dizziness',
                                'Joint pain',
                                'Muscle pain',
                                'Skin rash',
                                'Sore throat',
                                'Runny nose',
                                'Loss of appetite',
                                'Weight loss',
                                'Insomnia',
                                'Anxiety',
                            ].map((symptom) => (
                                <label key={symptom} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                                    <input
                                        type="checkbox"
                                        value={symptom}
                                        {...register('symptoms')}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm">{symptom}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gradient" disabled={isSubmitting}>
                            {isSubmitting ? 'Booking...' : 'Book Appointment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
