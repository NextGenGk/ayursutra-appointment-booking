'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface UserSession {
    uid: string;
    role: 'patient' | 'doctor';
    pid?: string;
    did?: string;
    name: string;
}

// ZEGO Cloud configuration
const ZEGO_APP_ID = 1200963791;
const ZEGO_SERVER_SECRET = "efa1221bda70ba86f1124cff9bed296c";

// Declare ZegoUIKitPrebuilt for TypeScript
declare global {
    interface Window {
        ZegoUIKitPrebuilt: any;
    }
}

export default function VideoCallPage() {
    const params = useParams();
    const router = useRouter();
    const meetingId = params.meetingId as string;
    const containerRef = useRef<HTMLDivElement>(null);
    const zegoInstanceRef = useRef<any>(null);

    const [userSession, setUserSession] = useState<UserSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zegoLoaded, setZegoLoaded] = useState(false);
    const [zegoInitialized, setZegoInitialized] = useState(false);

    // Load ZEGO script dynamically
    useEffect(() => {
        const loadZegoScript = () => {
            // Check if script is already loaded
            if (window.ZegoUIKitPrebuilt) {
                setZegoLoaded(true);
                return;
            }

            // Check if script is already in DOM
            const existingScript = document.querySelector('script[src*="zego-uikit-prebuilt"]');
            if (existingScript) {
                // Wait for existing script to load
                existingScript.addEventListener('load', () => setZegoLoaded(true));
                existingScript.addEventListener('error', () => setError('Failed to load video call library'));
                return;
            }

            // Create and load script
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
            script.async = true;
            script.onload = () => {
                console.log('ZEGO UI Kit script loaded successfully');
                setZegoLoaded(true);
            };
            script.onerror = () => {
                console.error('Failed to load ZEGO UI Kit script');
                setError('Failed to load video call library');
            };

            document.head.appendChild(script);
        };

        loadZegoScript();
    }, []);

    // Get user session
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/auth/session');
                const data = await response.json();

                if (data.success && data.session) {
                    setUserSession(data.session);
                    console.log('User session loaded:', data.session);
                } else {
                    setError('No valid session found');
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching session:', error);
                setError('Failed to load session');
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [router]);

    // Initialize ZEGO UI Kit when both session and script are ready
    useEffect(() => {
        if (!userSession || !zegoLoaded || !containerRef.current || zegoInitialized) return;

        const initializeZegoUIKit = async () => {
            try {
                // Prevent multiple initializations
                if (zegoInstanceRef.current) {
                    console.log('ZEGO already initialized, skipping...');
                    return;
                }

                // Wait a bit to ensure ZEGO is fully loaded
                await new Promise(resolve => setTimeout(resolve, 500));

                if (!window.ZegoUIKitPrebuilt) {
                    throw new Error('ZEGO UI Kit not available');
                }

                // Ensure container is still valid
                if (!containerRef.current) {
                    throw new Error('Container not available');
                }

                // Clear container content before initialization
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                // Generate unique user ID based on session
                const uniqueUserID = userSession.role === 'doctor'
                    ? `doctor_${userSession.did}`
                    : `patient_${userSession.pid}`;

                const userName = `${userSession.role === 'doctor' ? 'Dr. ' : ''}${userSession.name}`;

                // CRITICAL NOTE: Token generation should be done server-side in production
                // using the ZEGO Server API to prevent exposing the Server Secret.
                // This client-side generation is for testing/demo purposes only.

                // Generate kit token
                const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
                    ZEGO_APP_ID,
                    ZEGO_SERVER_SECRET,
                    meetingId,
                    uniqueUserID,
                    userName
                );

                console.log('Kit token generated successfully');

                // Create ZEGO instance
                const zp = window.ZegoUIKitPrebuilt.create(kitToken);
                zegoInstanceRef.current = zp;
                console.log('ZEGO instance created');

                // Join room with healthcare-specific configuration
                await zp.joinRoom({
                    container: containerRef.current,
                    sharedLinks: [{
                        name: 'Meeting Link',
                        url: `${window.location.protocol}//${window.location.host}/call/${meetingId}`,
                    }],
                    scenario: {
                        mode: window.ZegoUIKitPrebuilt.VideoConference,
                    },
                    turnOnMicrophoneWhenJoining: true,
                    turnOnCameraWhenJoining: true,
                    showMyCameraToggleButton: true,
                    showMyMicrophoneToggleButton: true,
                    showAudioVideoSettingsButton: true,
                    showScreenSharingButton: userSession.role === 'doctor', // Only doctors can share screen
                    showTextChat: true,
                    showUserList: true,
                    maxUsers: 2, // Doctor + Patient
                    layout: "Auto",
                    showLayoutButton: false,
                    showLeavingView: true,
                    onJoinRoom: () => {
                        console.log('Successfully joined room');
                        toast({
                            title: 'Connected',
                            description: `Joined as ${userName}`,
                            variant: 'default',
                        });
                    },
                    onLeaveRoom: () => {
                        console.log('Left room');
                        handleCallEnd();
                    },
                    onUserJoin: (users: any[]) => {
                        console.log('User joined:', users);
                        if (users.length > 1) {
                            toast({
                                title: 'Participant Joined',
                                description: `${userSession.role === 'doctor' ? 'Patient' : 'Doctor'} has joined the call`,
                                variant: 'default',
                            });
                        }
                    },
                    onUserLeave: (users: any[]) => {
                        console.log('User left:', users);
                        toast({
                            title: 'Participant Left',
                            description: `${userSession.role === 'doctor' ? 'Patient' : 'Doctor'} has left the call`,
                            variant: 'default',
                        });
                    }
                });

                console.log('ZEGO UI Kit initialized successfully');
                setZegoInitialized(true);

            } catch (error) {
                console.error('Error initializing ZEGO UI Kit:', error);
                setError('Failed to initialize video call: ' + (error as Error).message);
                toast({
                    title: 'Connection Error',
                    description: 'Failed to initialize video call',
                    variant: 'destructive',
                });
            }
        };

        initializeZegoUIKit();
    }, [userSession, zegoLoaded, meetingId, zegoInitialized]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (zegoInstanceRef.current) {
                try {
                    zegoInstanceRef.current.destroy?.();
                    zegoInstanceRef.current = null;
                } catch (error) {
                    console.warn('Error during ZEGO cleanup:', error);
                }
            }
        };
    }, []);

    const handleCallEnd = async () => {
        // If user is a doctor, mark the call as completed
        if (userSession?.role === 'doctor') {
            try {
                // Extract appointment ID safely
                // Format: appointment_{id}_{timestamp}
                const parts = meetingId.split('_');
                const appointmentId = parts.length >= 2 ? parts[1] : null;

                if (appointmentId) {
                    await fetch(`/api/doctor/appointments/${appointmentId}/complete-call`, {
                        method: 'PUT',
                    });
                }
            } catch (error) {
                console.error('Error completing call:', error);
            }
        }

        // Navigate back to respective dashboard
        if (userSession?.role === 'doctor') {
            router.push('/doctor/dashboard');
        } else {
            router.push('/patient/dashboard');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4">Loading session...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
                    <p className="text-gray-400 mb-4 text-sm">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (!zegoLoaded) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4">Loading video call library...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-screen bg-[#1a1a1a] relative"
            style={{ height: '100dvh' }} // Use dynamic viewport height for mobile
        >
            <div
                ref={containerRef}
                className="w-full h-full absolute inset-0"
            />
            {!zegoInitialized && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900 h-full">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4">Initializing video call...</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Meeting ID: {meetingId}
                        </p>
                        <p className="text-sm text-green-400 mt-1">
                            {userSession?.role === 'doctor' ? 'Dr. ' : ''}{userSession?.name}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
