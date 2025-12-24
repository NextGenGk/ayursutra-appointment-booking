import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDoctorSession } from '@/lib/utils/session';
import { calculateDuration } from '@/lib/utils/date';

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
        const supabase = createServerClient();

        // Get current appointment to calculate duration
        const { data: currentAppointment } = await supabase
            .from('appointments')
            .select('start_time')
            .eq('aid', aid)
            .single();

        const endTime = new Date().toISOString();
        const duration = currentAppointment?.start_time
            ? calculateDuration(currentAppointment.start_time, endTime)
            : null;

        // Update appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .update({
                status: 'completed',
                end_time: endTime,
                duration_minutes: duration,
                updated_at: endTime,
            })
            .eq('aid', aid)
            .eq('did', session.did)
            .select()
            .single();

        if (error) {
            console.error('Error completing appointment:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to complete appointment' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Complete appointment error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
