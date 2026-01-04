import { createServerClient } from '@/lib/supabase/server';

export interface UserProfileData {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    role: 'patient' | 'doctor';
    auth_id?: string;
}

export interface PatientProfileData {
    allergies?: string[];
    current_medications?: string[];
    chronic_conditions?: string[];
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
}

export interface DoctorProfileData {
    specialization?: string;
    qualification?: string;
    years_of_experience?: number;
    consultation_fee?: number;
    languages?: string[];
    bio?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    is_verified?: boolean;
}

/**
 * Ensures a user has both a user record and corresponding profile record
 */
export async function ensureUserProfile(
    userData: UserProfileData,
    profileData?: PatientProfileData | DoctorProfileData
) {
    const supabase = createServerClient();

    try {
        // Check if user exists
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('uid, email, role')
            .eq('email', userData.email)
            .single();

        // Create user if doesn't exist
        if (userError && userError.code === 'PGRST116') {
            const { data: newUser, error: createUserError } = await supabase
                .from('users')
                .insert({
                    email: userData.email,
                    name: userData.name,
                    phone: userData.phone,
                    role: userData.role,
                    auth_id: userData.auth_id,
                    is_verified: false,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('uid, email, role')
                .single();

            if (createUserError) {
                throw new Error(`Failed to create user: ${createUserError.message}`);
            }

            user = newUser;
        } else if (userError) {
            throw new Error(`Failed to query user: ${userError.message}`);
        }

        if (!user) {
            throw new Error('Failed to retrieve or create user');
        }

        // Ensure profile exists based on role
        if (userData.role === 'patient') {
            const { data: existingPatient } = await supabase
                .from('patients')
                .select('pid')
                .eq('uid', user.uid)
                .single();

            if (!existingPatient) {
                const patientData = {
                    uid: user.uid,
                    allergies: [],
                    current_medications: [],
                    chronic_conditions: [],
                    country: 'India',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    ...(profileData as PatientProfileData || {})
                };

                const { data: newPatient, error: patientError } = await supabase
                    .from('patients')
                    .insert(patientData)
                    .select('pid')
                    .single();

                if (patientError) {
                    throw new Error(`Failed to create patient profile: ${patientError.message}`);
                }

                return { user, profile: newPatient, created: true };
            }
        } else if (userData.role === 'doctor') {
            const { data: existingDoctor } = await supabase
                .from('doctors')
                .select('did')
                .eq('uid', user.uid)
                .single();

            if (!existingDoctor) {
                const doctorData = {
                    uid: user.uid,
                    specialization: 'General Medicine',
                    qualification: 'MBBS',
                    years_of_experience: 0,
                    consultation_fee: 500,
                    languages: ['English'],
                    country: 'India',
                    is_verified: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    ...(profileData as DoctorProfileData || {})
                };

                const { data: newDoctor, error: doctorError } = await supabase
                    .from('doctors')
                    .insert(doctorData)
                    .select('did')
                    .single();

                if (doctorError) {
                    throw new Error(`Failed to create doctor profile: ${doctorError.message}`);
                }

                return { user, profile: newDoctor, created: true };
            }
        }

        return { user, profile: null, created: false };

    } catch (error) {
        console.error('Profile sync error:', error);
        throw error;
    }
}

/**
 * Fixes missing profiles for existing users
 */
export async function fixMissingProfiles() {
    const supabase = createServerClient();

    try {
        // Get all users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('uid, email, name, role');

        if (usersError) {
            throw new Error(`Failed to fetch users: ${usersError.message}`);
        }

        const results = {
            usersProcessed: 0,
            patientsCreated: 0,
            doctorsCreated: 0,
            errors: [] as string[]
        };

        for (const user of users || []) {
            try {
                results.usersProcessed++;

                if (user.role === 'patient') {
                    const { data: existingPatient } = await supabase
                        .from('patients')
                        .select('pid')
                        .eq('uid', user.uid)
                        .single();

                    if (!existingPatient) {
                        const { error: patientError } = await supabase
                            .from('patients')
                            .insert({
                                uid: user.uid,
                                allergies: [],
                                current_medications: [],
                                chronic_conditions: [],
                                country: 'India',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });

                        if (patientError) {
                            results.errors.push(`Failed to create patient for ${user.email}: ${patientError.message}`);
                        } else {
                            results.patientsCreated++;
                        }
                    }
                } else if (user.role === 'doctor') {
                    const { data: existingDoctor } = await supabase
                        .from('doctors')
                        .select('did')
                        .eq('uid', user.uid)
                        .single();

                    if (!existingDoctor) {
                        const { error: doctorError } = await supabase
                            .from('doctors')
                            .insert({
                                uid: user.uid,
                                specialization: 'General Medicine',
                                qualification: 'MBBS',
                                years_of_experience: 0,
                                consultation_fee: 500,
                                languages: ['English'],
                                country: 'India',
                                is_verified: false,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });

                        if (doctorError) {
                            results.errors.push(`Failed to create doctor for ${user.email}: ${doctorError.message}`);
                        } else {
                            results.doctorsCreated++;
                        }
                    }
                }
            } catch (error: any) {
                results.errors.push(`Error processing user ${user.email}: ${error.message}`);
            }
        }

        return results;

    } catch (error: any) {
        console.error('Profile fix error:', error);
        throw error;
    }
}