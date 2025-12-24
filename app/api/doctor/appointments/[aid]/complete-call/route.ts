import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDoctorSession } from '@/lib/utils/session';

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

        // Update appointment to completed status
        const { data: appointment, error } = await supabase
            .from('appointments')
            .update({
                status: 'completed',
                end_time: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('aid', aid)
            .eq('did', session.did)
            .select()
            .single();

        if (error) {
            console.error('Error completing call:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to complete call' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Complete call error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}