import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getPatientSession } from '@/lib/utils/session';

export const dynamic = 'force-dynamic';

// GET patient profile
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

        // Get patient profile with user details
        const { data: patient, error } = await supabase
            .from('patients')
            .select(`
                *,
                user:users!patients_uid_fkey (
                    uid,
                    name,
                    email,
                    phone,
                    profile_image_url,
                    is_verified,
                    is_active
                )
            `)
            .eq('pid', session.pid)
            .single();

        if (error) {
            console.error('Error fetching patient profile:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch patient profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        console.error('Get patient profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT update patient profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getPatientSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            name,
            phone,
            date_of_birth,
            gender,
            blood_group,
            allergies,
            current_medications,
            chronic_conditions,
            address_line1,
            address_line2,
            city,
            state,
            country,
            postal_code,
            emergency_contact_name,
            emergency_contact_phone,
        } = body;

        const supabase = createServerClient();

        // Update user table if name or phone provided
        if (name || phone) {
            const userUpdateData: any = {};
            if (name) userUpdateData.name = name;
            if (phone) userUpdateData.phone = phone;

            const { error: userError } = await supabase
                .from('users')
                .update(userUpdateData)
                .eq('uid', session.uid);

            if (userError) {
                console.error('Error updating user:', userError);
                return NextResponse.json(
                    { success: false, error: 'Failed to update user information' },
                    { status: 500 }
                );
            }
        }

        // Update patient table
        const patientUpdateData: any = {};
        if (date_of_birth !== undefined) patientUpdateData.date_of_birth = date_of_birth;
        if (gender !== undefined) patientUpdateData.gender = gender;
        if (blood_group !== undefined) patientUpdateData.blood_group = blood_group;
        if (allergies !== undefined) patientUpdateData.allergies = allergies;
        if (current_medications !== undefined) patientUpdateData.current_medications = current_medications;
        if (chronic_conditions !== undefined) patientUpdateData.chronic_conditions = chronic_conditions;
        if (address_line1 !== undefined) patientUpdateData.address_line1 = address_line1;
        if (address_line2 !== undefined) patientUpdateData.address_line2 = address_line2;
        if (city !== undefined) patientUpdateData.city = city;
        if (state !== undefined) patientUpdateData.state = state;
        if (country !== undefined) patientUpdateData.country = country;
        if (postal_code !== undefined) patientUpdateData.postal_code = postal_code;
        if (emergency_contact_name !== undefined) patientUpdateData.emergency_contact_name = emergency_contact_name;
        if (emergency_contact_phone !== undefined) patientUpdateData.emergency_contact_phone = emergency_contact_phone;

        const { data: updatedPatient, error: patientError } = await supabase
            .from('patients')
            .update(patientUpdateData)
            .eq('pid', session.pid)
            .select(`
                *,
                user:users!patients_uid_fkey (
                    uid,
                    name,
                    email,
                    phone,
                    profile_image_url
                )
            `)
            .single();

        if (patientError) {
            console.error('Error updating patient:', patientError);
            return NextResponse.json(
                { success: false, error: 'Failed to update patient profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedPatient,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Update patient profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}