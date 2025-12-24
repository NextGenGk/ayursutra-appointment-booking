import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDoctorSession } from '@/lib/utils/session';
import { generateMeetingId } from '@/lib/zego/config';

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

        // Generate meeting details
        const meetingId = generateMeetingId(aid);
        const meetingLink = `/call/${meetingId}`;

        // Update appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .update({
                status: 'in_progress',
                meeting_id: meetingId,
                meeting_link: meetingLink,
                start_time: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('aid', aid)
            .eq('did', session.did)
            .select()
            .single();

        if (error) {
            console.error('Error starting call:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to start call' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Start call error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
