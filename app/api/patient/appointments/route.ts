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

        // Fetch patient's appointments with doctor details
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
        *,
        doctor:doctors!appointments_did_fkey (
          *,
          user:users!doctors_uid_fkey (
            uid,
            name,
            email,
            profile_image_url
          )
        )
      `)
            .eq('pid', session.pid)
            .neq('status', 'completed')
            .order('scheduled_date', { ascending: true })
            .order('scheduled_time', { ascending: true });

        if (error) {
            console.error('Error fetching appointments:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch appointments' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointments || [],
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
