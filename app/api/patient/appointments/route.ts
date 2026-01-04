import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getPatientSession } from '@/lib/utils/session';
import { generateTokenNumber } from '@/lib/utils/token';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getPatientSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createServerClient();

        // Fetch patient's appointments (without FK joins)
        const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*')
            .eq('pid', session.pid)
            .neq('status', 'completed')
            .order('scheduled_date', { ascending: true })
            .order('scheduled_time', { ascending: true });

        if (appointmentsError) {
            console.error('Error fetching appointments:', appointmentsError);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch appointments' },
                { status: 500 }
            );
        }

        if (!appointments || appointments.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
            });
        }

        // Fetch doctor details for all appointments
        const doctorIds = Array.from(new Set(appointments.map(apt => apt.did).filter(Boolean)));
        
        const { data: doctors, error: doctorsError } = await supabase
            .from('doctors')
            .select('did, uid, specialization, qualification, consultation_fee, bio, clinic_name, city, state, languages, is_verified')
            .in('did', doctorIds);

        if (doctorsError) {
            console.error('Error fetching doctors:', doctorsError);
        }

        // Fetch user details for doctors
        const doctorUids = doctors?.map(d => d.uid).filter(Boolean) || [];
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('uid, name, email, profile_image_url')
            .in('uid', doctorUids);

        if (usersError) {
            console.error('Error fetching users:', usersError);
        }

        // Manually join the data
        const appointmentsWithDoctors = appointments.map(appointment => {
            const doctor = doctors?.find(d => d.did === appointment.did);
            const user = doctor ? users?.find(u => u.uid === doctor.uid) : null;
            
            return {
                ...appointment,
                doctor: doctor ? {
                    ...doctor,
                    user: user || null
                } : null
            };
        });

        return NextResponse.json({
            success: true,
            data: appointmentsWithDoctors,
        });
    } catch (error) {
        console.error('Get patient appointments error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getPatientSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { did, mode, scheduledDate, scheduledTime, chiefComplaint, symptoms } = body;

        // Validate required fields
        if (!did || !mode || !scheduledDate || !scheduledTime || !chiefComplaint) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Generate token number for offline appointments
        let tokenNumber = null;
        if (mode === 'offline') {
            tokenNumber = await generateTokenNumber(did, scheduledDate);
        }

        // Create appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                pid: session.pid,
                did,
                mode,
                status: 'scheduled',
                scheduled_date: scheduledDate,
                scheduled_time: scheduledTime,
                chief_complaint: chiefComplaint,
                symptoms: symptoms || null,
                token_number: tokenNumber,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating appointment:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create appointment' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
