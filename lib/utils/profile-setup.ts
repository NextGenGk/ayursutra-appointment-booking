import { createServerClient } from '@/lib/supabase/server';

export interface UserData {
    auth_id: string;
    email: string;
    name?: string;
    phone?: string;
    role: 'patient' | 'doctor';
}

export interface PatientData {
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
    allergies?: string[];
    current_medications?: string[];
    chronic_conditions?: string[];
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
}

export interface DoctorData {
    specialization?: string;
    qualification?: string;
    registration_number?: string;
    years_of_experience?: number;
    consultation_fee?: number;
    bio?: string;
    clinic_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    languages?: string[];
}

/**
 * Ensures a user exists in the users table and creates/updates their profile
 */
export async function ensureUserAndProfile(
    userData: UserData,
    profileData?: PatientData | DoctorData
) {
    const supabase = createServerClient();

    try {
        // Check if user exists by auth_id
        let { data: existingUser, error: userLookupError } = await supabase
            .from('users')
            .select('uid, role')
            .eq('auth_id', userData.auth_id)
            .single();

        // If not found by auth_id, try by email
        if (userLookupError || !existingUser) {
            const { data: userByEmail, error: emailError } = await supabase
                .from('users')
                .select('uid, role, auth_id, name, phone')
                .eq('email', userData.email)
                .single();

            if (userByEmail && !userByEmail.auth_id) {
                // Update existing user with auth_id
                const { data: updatedUser, error: updateError } = await supabase
                    .from('users')
                    .update({ 
                        auth_id: userData.auth_id,
                        role: userData.role,
                        name: userData.name || userByEmail.name,
                        phone: userData.phone || userByEmail.phone
                    })
                    .eq('uid', userByEmail.uid)
                    .select('uid, role')
                    .single();

                if (updateError) {
                    throw new Error(`Failed to update user: ${updateError.message}`);
                }

                existingUser = updatedUser;
            } else if (!userByEmail) {
                // Create new user
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        auth_id: userData.auth_id,
                        email: userData.email,
                        name: userData.name || userData.email.split('@')[0],
                        phone: userData.phone,
                        role: userData.role,
                        is_active: true
                    })
                    .select('uid, role')
                    .single();

                if (createError) {
                    throw new Error(`Failed to create user: ${createError.message}`);
                }

                existingUser = newUser;
            } else {
                existingUser = userByEmail;
            }
        }

        // Now ensure the profile exists
        if (userData.role === 'patient') {
            return await ensurePatientProfile(existingUser.uid, profileData as PatientData);
        } else if (userData.role === 'doctor') {
            return await ensureDoctorProfile(existingUser.uid, profileData as DoctorData);
        }

        return { user: existingUser };

    } catch (error: any) {
        console.error('Error in ensureUserAndProfile:', error);
        throw error;
    }
}

/**
 * Ensures a patient profile exists for the given user
 */
export async function ensurePatientProfile(uid: string, patientData?: PatientData) {
    const supabase = createServerClient();

    try {
        // Check if patient profile exists
        let { data: existingPatient, error: patientLookupError } = await supabase
            .from('patients')
            .select('pid')
            .eq('uid', uid)
            .single();

        if (patientLookupError || !existingPatient) {
            // Create patient profile
            const { data: newPatient, error: createError } = await supabase
                .from('patients')
                .insert({
                    uid: uid,
                    date_of_birth: patientData?.date_of_birth,
                    gender: patientData?.gender,
                    blood_group: patientData?.blood_group,
                    allergies: patientData?.allergies || [],
                    current_medications: patientData?.current_medications || [],
                    chronic_conditions: patientData?.chronic_conditions || [],
                    address_line1: patientData?.address_line1,
                    address_line2: patientData?.address_line2,
                    city: patientData?.city,
                    state: patientData?.state,
                    country: patientData?.country || 'India',
                    postal_code: patientData?.postal_code,
                    emergency_contact_name: patientData?.emergency_contact_name,
                    emergency_contact_phone: patientData?.emergency_contact_phone
                })
                .select('pid')
                .single();

            if (createError) {
                throw new Error(`Failed to create patient profile: ${createError.message}`);
            }

            return { patient: newPatient };
        }

        return { patient: existingPatient };

    } catch (error: any) {
        console.error('Error in ensurePatientProfile:', error);
        throw error;
    }
}

/**
 * Ensures a doctor profile exists for the given user
 */
export async function ensureDoctorProfile(uid: string, doctorData?: DoctorData) {
    const supabase = createServerClient();

    try {
        // Check if doctor profile exists
        let { data: existingDoctor, error: doctorLookupError } = await supabase
            .from('doctors')
            .select('did')
            .eq('uid', uid)
            .single();

        if (doctorLookupError || !existingDoctor) {
            // Create doctor profile
            const { data: newDoctor, error: createError } = await supabase
                .from('doctors')
                .insert({
                    uid: uid,
                    specialization: doctorData?.specialization || 'General Medicine',
                    qualification: doctorData?.qualification || 'MBBS',
                    registration_number: doctorData?.registration_number,
                    years_of_experience: doctorData?.years_of_experience || 0,
                    consultation_fee: doctorData?.consultation_fee || 500,
                    bio: doctorData?.bio,
                    clinic_name: doctorData?.clinic_name,
                    address_line1: doctorData?.address_line1,
                    address_line2: doctorData?.address_line2,
                    city: doctorData?.city,
                    state: doctorData?.state,
                    country: doctorData?.country || 'India',
                    postal_code: doctorData?.postal_code,
                    languages: doctorData?.languages || ['English'],
                    is_verified: false
                })
                .select('did')
                .single();

            if (createError) {
                throw new Error(`Failed to create doctor profile: ${createError.message}`);
            }

            return { doctor: newDoctor };
        }

        return { doctor: existingDoctor };

    } catch (error: any) {
        console.error('Error in ensureDoctorProfile:', error);
        throw error;
    }
}