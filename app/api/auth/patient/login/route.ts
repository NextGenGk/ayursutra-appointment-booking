import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createSession } from '@/lib/utils/session';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Query user with patient role
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('role', 'patient')
            .single();

        if (userError || !users) {
            return NextResponse.json(
                { success: false, error: 'No patient account found with this email' },
                { status: 404 }
            );
        }

        // Get patient details
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('uid', users.uid)
            .single();

        if (patientError || !patient) {
            return NextResponse.json(
                { success: false, error: 'Patient profile not found' },
                { status: 404 }
            );
        }

        // Update last_login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('uid', users.uid);

        // Create session
        await createSession({
            uid: users.uid,
            email: users.email,
            role: 'patient',
            name: users.name,
            pid: patient.pid,
        });

        return NextResponse.json({
            success: true,
            data: {
                user: users,
                patient,
            },
        });
    } catch (error) {
        console.error('Patient login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
