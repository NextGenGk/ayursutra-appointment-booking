import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDoctorSession } from '@/lib/utils/session';
import { generateTokenNumber } from '@/lib/utils/token';

export async function PUT(
    request: NextRequest,
    { params }: { params: { aid: string } }
) {
    try {
        const session = await getDoctorSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { aid } = params;
        const body = await request.json();
        const { newDate, newTime, reason } = body;

        if (!newDate || !newTime) {
            return NextResponse.json(
                { success: false, error: 'New date and time are required' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Get current appointment to check mode
        const { data: currentAppointment } = await supabase
            .from('appointments')
            .select('mode, did')
            .eq('aid', aid)
            .single();

        // Generate new token number if offline appointment and date changed
        let tokenNumber = null;
        if (currentAppointment?.mode === 'offline') {
            tokenNumber = await generateTokenNumber(currentAppointment.did, newDate);
        }

        // Update appointment
        const updateData: any = {
            scheduled_date: newDate,
            scheduled_time: newTime,
            status: 'rescheduled',
            updated_at: new Date().toISOString(),
        };

        if (reason) {
            updateData.doctor_notes = reason;
        }

        if (tokenNumber !== null) {
            updateData.token_number = tokenNumber;
        }

        const { data: appointment, error } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('aid', aid)
            .eq('did', session.did)
            .select()
            .single();

        if (error) {
            console.error('Error rescheduling appointment:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to reschedule appointment' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Reschedule appointment error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
