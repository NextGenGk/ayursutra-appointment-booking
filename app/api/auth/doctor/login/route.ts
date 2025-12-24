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

        // Query user with doctor role
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('role', 'doctor')
            .single();

        if (userError || !users) {
            return NextResponse.json(
                { success: false, error: 'No doctor account found with this email' },
                { status: 404 }
            );
        }

        // Get doctor details
        const { data: doctor, error: doctorError } = await supabase
            .from('doctors')
            .select('*')
            .eq('uid', users.uid)
            .single();

        if (doctorError || !doctor) {
            return NextResponse.json(
                { success: false, error: 'Doctor profile not found' },
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
            role: 'doctor',
            name: users.name,
            did: doctor.did,
        });

        return NextResponse.json({
            success: true,
            data: {
                user: users,
                doctor,
            },
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
