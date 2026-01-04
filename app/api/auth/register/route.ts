import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { email, name, phone, role, auth_id } = await request.json();

        if (!email || !name || !role) {
            return NextResponse.json(
                { success: false, error: 'Email, name, and role are required' },
                { status: 400 }
            );
        }

        if (!['patient', 'doctor'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Role must be either "patient" or "doctor"' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('uid, email, role')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create user record
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
                email,
                name,
                phone,
                role,
                auth_id,
                is_verified: false,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('uid, email, name, role')
            .single();

        if (userError) {
            console.error('Error creating user:', userError);
            return NextResponse.json(
                { success: false, error: 'Failed to create user account' },
                { status: 500 }
            );
        }

        let profileData = null;

        // Create corresponding profile based on role
        if (role === 'patient') {
            const { data: newPatient, error: patientError } = await supabase
                .from('patients')
                .insert({
                    uid: newUser.uid,
                    allergies: [],
                    current_medications: [],
                    chronic_conditions: [],
                    country: 'India',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('pid, uid')
                .single();

            if (patientError) {
                console.error('Error creating patient profile:', patientError);
                // Rollback user creation
                await supabase.from('users').delete().eq('uid', newUser.uid);
                return NextResponse.json(
                    { success: false, error: 'Failed to create patient profile' },
                    { status: 500 }
                );
            }

            profileData = newPatient;
        } else if (role === 'doctor') {
            const { data: newDoctor, error: doctorError } = await supabase
                .from('doctors')
                .insert({
                    uid: newUser.uid,
                    specialization: 'General Medicine',
                    qualification: 'MBBS',
                    years_of_experience: 0,
                    consultation_fee: 500,
                    languages: ['English'],
                    country: 'India',
                    is_verified: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('did, uid, specialization, qualification')
                .single();

            if (doctorError) {
                console.error('Error creating doctor profile:', doctorError);
                // Rollback user creation
                await supabase.from('users').delete().eq('uid', newUser.uid);
                return NextResponse.json(
                    { success: false, error: 'Failed to create doctor profile' },
                    { status: 500 }
                );
            }

            profileData = newDoctor;
        }

        return NextResponse.json({
            success: true,
            message: 'User and profile created successfully',
            data: {
                user: newUser,
                profile: profileData
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}