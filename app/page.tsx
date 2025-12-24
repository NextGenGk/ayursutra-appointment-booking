import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Stethoscope, Heart, Shield, Clock } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                <div className="text-center mb-12 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Heart className="w-12 h-12 text-primary-green animate-pulse-green" />
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-green to-secondary-green bg-clip-text text-transparent">
                            HealthCare
                        </h1>
                    </div>
                    <p className="text-xl text-text-secondary-custom mb-2">
                        Connect with healthcare professionals seamlessly
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-text-muted-custom">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary-green" />
                            <span>Secure</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary-green" />
                            <span>Fast</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-primary-green" />
                            <span>Reliable</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Patient Login Card */}
                    <Card className="group hover:shadow-green-lg transition-all duration-300 border-2 hover:border-primary-green/30 overflow-hidden glass-green">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="relative">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-button flex items-center justify-center shadow-green-md group-hover:scale-110 transition-transform animate-bounce-gentle">
                                <UserCircle className="w-10 h-10 text-white" />
                            </div>
                            <CardTitle className="text-2xl text-center text-text-primary-custom">Patient Portal</CardTitle>
                            <CardDescription className="text-center text-text-secondary-custom">
                                Book appointments with verified healthcare professionals
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <ul className="space-y-3 mb-6 text-sm text-text-secondary-custom">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary-green animate-pulse" />
                                    Browse verified doctors by specialization
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-secondary-green animate-pulse" />
                                    Book online or offline appointments instantly
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-tertiary-green animate-pulse" />
                                    Join secure video consultations
                                </li>
                            </ul>
                            <Link href="/patient-login" className="block">
                                <Button
                                    variant="gradient"
                                    className="w-full group-hover:scale-105 transition-transform"
                                    size="lg"
                                >
                                    Access Patient Portal
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Doctor Login Card */}
                    <Card className="group hover:shadow-green-lg transition-all duration-300 border-2 hover:border-health-accent/30 overflow-hidden glass-green">
                        <div className="absolute inset-0 bg-gradient-to-br from-health-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="relative">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-health-accent to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-bounce-gentle">
                                <Stethoscope className="w-10 h-10 text-white" />
                            </div>
                            <CardTitle className="text-2xl text-center text-text-primary-custom">Doctor Portal</CardTitle>
                            <CardDescription className="text-center text-text-secondary-custom">
                                Manage your practice and patient consultations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <ul className="space-y-3 mb-6 text-sm text-text-secondary-custom">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-health-accent animate-pulse" />
                                    Manage appointment requests efficiently
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    Conduct secure video consultations
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    Track patient history and appointments
                                </li>
                            </ul>
                            <Link href="/doctor-login" className="block">
                                <Button
                                    variant="info"
                                    className="w-full group-hover:scale-105 transition-transform"
                                    size="lg"
                                >
                                    Access Doctor Portal
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center mt-12 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-green border border-primary-green/20">
                        <Heart className="w-5 h-5 text-primary-green animate-pulse" />
                        <span className="text-sm font-medium text-text-primary-custom">
                            Trusted Healthcare Platform
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
