import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDoctorSession } from '@/lib/utils/session';
import { getTodayDate } from '@/lib/utils/date';

export async function GET(request: NextRequest) {
    try {
        const session = await getDoctorSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        const supabase = createServerClient();

        let query = supabase
            .from('appointments')
            .select('*')
            .eq('did', session.did)
            .neq('status', 'completed');

        // Filter by status if provided
        if (status) {
            query = query.eq('status', status);
        }

        // Filter by date if provided
        if (date === 'today') {
            query = query.eq('scheduled_date', getTodayDate());
        }

        query = query
            .order('scheduled_date', { ascending: true })
            .order('scheduled_time', { ascending: true });

        const { data: appointments, error } = await query;

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
        console.error('Get doctor appointments error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
