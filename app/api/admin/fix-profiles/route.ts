import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = createServerClient();

        console.log('🔧 Starting profile fix process...');

        // Get all users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('uid, email, name, role, auth_id');

        if (usersError) {
            throw new Error(`Failed to fetch users: ${usersError.message}`);
        }

        console.log(`📊 Found ${users?.length || 0} users`);

        const results = {
            usersProcessed: 0,
            patientsCreated: 0,
            doctorsCreated: 0,
            errors: [] as string[]
        };

        for (const user of users || []) {
            try {
                results.usersProcessed++;
                console.log(`👤 Processing user: ${user.email} (${user.role})`);

                if (user.role === 'patient') {
                    // Check if patient profile exists
                    const { data: existingPatient } = await supabase
                        .from('patients')
                        .select('pid')
                        .eq('uid', user.uid)
                        .single();

                    if (!existingPatient) {
                        // Create patient profile
                        const { data: newPatient, error: patientError } = await supabase
                            .from('patients')
                            .insert({
                                uid: user.uid,
                                allergies: [],
                                current_medications: [],
                                chronic_conditions: [],
                                country: 'India'
                            })
                            .select('pid')
                            .single();

                        if (patientError) {
                            results.errors.push(`Failed to create patient for ${user.email}: ${patientError.message}`);
                        } else {
                            results.patientsCreated++;
                            console.log(`✅ Created patient profile for ${user.email}`);
                        }
                    } else {
                        console.log(`ℹ️ Patient profile already exists for ${user.email}`);
                    }
                }

                if (user.role === 'doctor') {
                    // Check if doctor profile exists
                    const { data: existingDoctor } = await supabase
                        .from('doctors')
                        .select('did')
                        .eq('uid', user.uid)
                        .single();

                    if (!existingDoctor) {
                        // Create doctor profile
                        const { data: newDoctor, error: doctorError } = await supabase
                            .from('doctors')
                            .insert({
                                uid: user.uid,
                                specialization: 'General Medicine',
                                qualification: 'MBBS',
                                years_of_experience: 0,
                                consultation_fee: 500,
                                languages: ['English'],
                                country: 'India',
                                is_verified: false
                            })
                            .select('did')
                            .single();

                        if (doctorError) {
                            results.errors.push(`Failed to create doctor for ${user.email}: ${doctorError.message}`);
                        } else {
                            results.doctorsCreated++;
                            console.log(`✅ Created doctor profile for ${user.email}`);
                        }
                    } else {
                        console.log(`ℹ️ Doctor profile already exists for ${user.email}`);
                    }
                }

            } catch (error: any) {
                results.errors.push(`Error processing user ${user.email}: ${error.message}`);
                console.error(`❌ Error processing user ${user.email}:`, error);
            }
        }

        console.log('🎉 Profile fix process completed:', results);

        return NextResponse.json({
            success: true,
            message: 'Profile fix process completed',
            results: results
        });

    } catch (error: any) {
        console.error('Profile fix error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}