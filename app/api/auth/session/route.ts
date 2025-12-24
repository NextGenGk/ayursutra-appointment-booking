import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getPatientSession, getDoctorSession } from '@/lib/utils/session';

export async function GET(request: NextRequest) {
    try {
        // Try to get doctor session first (Prioritize higher privilege)
        const doctorSession = await getDoctorSession();
        if (doctorSession) {
            const supabase = createServerClient();

            // Get doctor details with user info
            const { data: doctor, error } = await supabase
                .from('doctors')
                .select(`
                    *,
                    user:users(*)
                `)
                .eq('did', doctorSession.did)
                .single();

            if (!error && doctor) {
                return NextResponse.json({
                    success: true,
                    session: {
                        uid: doctor.user.uid,
                        did: doctor.did,
                        role: 'doctor',
                        name: doctor.user.name,
                        email: doctor.user.email,
                    },
                });
            }
        }

        // Then try to get patient session
        const patientSession = await getPatientSession();
        if (patientSession) {
            const supabase = createServerClient();

            // Get patient details with user info
            const { data: patient, error } = await supabase
                .from('patients')
                .select(`
                    *,
                    user:users(*)
                `)
                .eq('pid', patientSession.pid)
                .single();

            if (!error && patient) {
                return NextResponse.json({
                    success: true,
                    session: {
                        uid: patient.user.uid,
                        pid: patient.pid,
                        role: 'patient',
                        name: patient.user.name,
                        email: patient.user.email,
                    },
                });
            }
        }

        // No valid session found
        return NextResponse.json({
            success: false,
            error: 'No valid session found',
        }, { status: 401 });

    } catch (error) {
        console.error('Session fetch error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}