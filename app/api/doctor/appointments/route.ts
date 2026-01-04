import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDoctorSession } from '@/lib/utils/session';
import { getTodayDate } from '@/lib/utils/date';

export const dynamic = 'force-dynamic';

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

        const { data: appointments, error: appointmentsError } = await query;

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

        // Fetch patient details for all appointments
        const patientIds = Array.from(new Set(appointments.map(apt => apt.pid).filter(Boolean)));
        
        const { data: patients, error: patientsError } = await supabase
            .from('patients')
            .select('pid, uid, gender, date_of_birth, blood_group, allergies, chronic_conditions')
            .in('pid', patientIds);

        if (patientsError) {
            console.error('Error fetching patients:', patientsError);
        }

        // Fetch user details for patients
        const patientUids = patients?.map(p => p.uid).filter(Boolean) || [];
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('uid, name, email, phone, profile_image_url')
            .in('uid', patientUids);

        if (usersError) {
            console.error('Error fetching users:', usersError);
        }

        // Manually join the data
        const appointmentsWithPatients = appointments.map(appointment => {
            const patient = patients?.find(p => p.pid === appointment.pid);
            const user = patient ? users?.find(u => u.uid === patient.uid) : null;
            
            return {
                ...appointment,
                patient: patient ? {
                    ...patient,
                    user: user || null
                } : null
            };
        });

        return NextResponse.json({
            success: true,
            data: appointmentsWithPatients,
        });
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
