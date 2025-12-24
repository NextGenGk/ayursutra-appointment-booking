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

        // Update appointment status to confirmed
        const { data: appointment, error } = await supabase
            .from('appointments')
            .update({
                status: 'confirmed',
                updated_at: new Date().toISOString(),
            })
            .eq('aid', aid)
            .eq('did', session.did)
            .select()
            .single();

        if (error) {
            console.error('Error approving appointment:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to approve appointment' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Approve appointment error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
