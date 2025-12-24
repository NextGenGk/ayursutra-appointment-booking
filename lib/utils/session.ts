import { cookies } from 'next/headers';
import { UserSession, PatientSession, DoctorSession } from '@/types/session';

const PATIENT_SESSION_COOKIE_NAME = 'patient_session';
const DOCTOR_SESSION_COOKIE_NAME = 'doctor_session';

/**
 * Create a session cookie for patient
 */
export async function createPatientSession(sessionData: PatientSession): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(PATIENT_SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Create a session cookie for doctor
 */
export async function createDoctorSession(sessionData: DoctorSession): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(DOCTOR_SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Create a session cookie (legacy function - determines type automatically)
 */
export async function createSession(sessionData: UserSession): Promise<void> {
    if (sessionData.role === 'patient') {
        await createPatientSession(sessionData as PatientSession);
    } else if (sessionData.role === 'doctor') {
        await createDoctorSession(sessionData as DoctorSession);
    }
}

/**
 * Get the current session (checks both patient and doctor cookies)
 */
export async function getSession(): Promise<UserSession | null> {
    const patientSession = await getPatientSession();
    if (patientSession) return patientSession;

    const doctorSession = await getDoctorSession();
    if (doctorSession) return doctorSession;

    return null;
}

/**
 * Get patient session
 */
export async function getPatientSession(): Promise<PatientSession | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(PATIENT_SESSION_COOKIE_NAME);

    if (!sessionCookie) {
        return null;
    }

    try {
        const session = JSON.parse(sessionCookie.value) as PatientSession;
        return session.role === 'patient' ? session : null;
    } catch {
        return null;
    }
}

/**
 * Get doctor session
 */
export async function getDoctorSession(): Promise<DoctorSession | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(DOCTOR_SESSION_COOKIE_NAME);

    if (!sessionCookie) {
        return null;
    }

    try {
        const session = JSON.parse(sessionCookie.value) as DoctorSession;
        return session.role === 'doctor' ? session : null;
    } catch {
        return null;
    }
}

/**
 * Clear patient session cookie
 */
export async function clearPatientSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(PATIENT_SESSION_COOKIE_NAME);
}

/**
 * Clear doctor session cookie
 */
export async function clearDoctorSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(DOCTOR_SESSION_COOKIE_NAME);
}

/**
 * Clear all session cookies
 */
export async function clearSession(): Promise<void> {
    await clearPatientSession();
    await clearDoctorSession();
}
