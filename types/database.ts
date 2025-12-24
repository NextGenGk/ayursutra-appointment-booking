// Database Types
export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentMode = 'online' | 'offline';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'rescheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
    uid: string;
    email: string;
    phone: string | null;
    password_hash: string;
    role: UserRole;
    name: string;
    profile_image_url: string | null;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login: string | null;
}

export interface Patient {
    pid: string;
    uid: string;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
    allergies: string[] | null;
    current_medications: string[] | null;
    chronic_conditions: string[] | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface Doctor {
    did: string;
    uid: string;
    specialization: string;
    qualification: string;
    registration_number: string | null;
    years_of_experience: number | null;
    consultation_fee: number | null;
    bio: string | null;
    clinic_name: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    languages: string[] | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface Appointment {
    aid: string;
    pid: string;
    did: string;
    mode: AppointmentMode;
    status: AppointmentStatus;
    scheduled_date: string;
    scheduled_time: string;
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    token_number: number | null;
    queue_position: number | null;
    estimated_wait_minutes: number | null;
    meeting_link: string | null;
    meeting_id: string | null;
    meeting_password: string | null;
    chief_complaint: string;
    symptoms: string[] | null;
    doctor_notes: string | null;
    cancellation_reason: string | null;
    cancelled_by: string | null;
    cancelled_at: string | null;
    patient_name: string;
    patient_age: number;
    created_at: string;
    updated_at: string;
}

// Extended types with joins
export interface DoctorWithUser extends Doctor {
    user: User;
}

export interface AppointmentWithDetails extends Appointment {
    doctor?: DoctorWithUser;
    patient?: Patient & { user: User };
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface LoginResponse {
    user: User;
    patient?: Patient;
    doctor?: Doctor;
}
