import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = createServerClient();

        // Fetch all active doctors with user details
        const { data: doctors, error } = await supabase
            .from('doctors')
            .select(`
        *,
        user:users!doctors_uid_fkey (
          uid,
          name,
          email,
          profile_image_url,
          is_active
        )
      `)
            .eq('user.is_active', true);

        if (error) {
            console.error('Error fetching doctors:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch doctors' },
                { status: 500 }
            );
        }

        // Filter out doctors where user is null (shouldn't happen with proper FK)
        const activeDoctors = doctors?.filter((d: any) => d.user) || [];

        return NextResponse.json({
            success: true,
            data: activeDoctors,
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
