import { createServerClient } from '../supabase/server';

/**
 * Generate the next token number for a doctor on a specific date
 * Token numbers are sequential per doctor per day for offline appointments
 */
export async function generateTokenNumber(
    doctorId: string,
    scheduledDate: string
): Promise<number> {
    const supabase = createServerClient();

    // Get the maximum token number for this doctor on this date
    const { data, error } = await supabase
        .from('appointments')
        .select('token_number')
        .eq('did', doctorId)
        .eq('scheduled_date', scheduledDate)
        .eq('mode', 'offline')
        .order('token_number', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching token numbers:', error);
        return 1; // Start from 1 if error
    }

    // If no appointments exist for this date, start from 1
    if (!data || data.length === 0) {
        return 1;
    }

    // Increment the maximum token number
    const maxToken = data[0].token_number || 0;
    return maxToken + 1;
}
