'use client';

import { DoctorWithUser } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stethoscope, Award, IndianRupee } from 'lucide-react';
import Image from 'next/image';

interface DoctorCardProps {
    doctor: DoctorWithUser;
    onBookAppointment: (doctor: DoctorWithUser) => void;
}

export function DoctorCard({ doctor, onBookAppointment }: DoctorCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-primary flex-shrink-0">
                        {doctor.user.profile_image_url ? (
                            <Image
                                src={doctor.user.profile_image_url}
                                alt={doctor.user.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                                <User className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground truncate">
                            Dr. {doctor.user.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Stethoscope className="w-4 h-4" />
                            {doctor.specialization}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                        {doctor.years_of_experience} years experience
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-lg text-foreground">
                        ₹{doctor.consultation_fee}
                    </span>
                    <span className="text-muted-foreground">consultation fee</span>
                </div>

                {doctor.qualification && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {doctor.qualification}
                    </p>
                )}

                {doctor.languages && doctor.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {doctor.languages.slice(0, 3).map((lang) => (
                            <span
                                key={lang}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                                {lang}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    onClick={() => onBookAppointment(doctor)}
                    className="w-full group-hover:scale-105 transition-transform"
                    variant="gradient"
                >
                    Book Appointment
                </Button>
            </CardFooter>
        </Card>
    );
}
