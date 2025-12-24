import { User, Patient, Doctor } from './database';

export interface SessionData {
    uid: string;
    email: string;
    role: 'patient' | 'doctor';
    name: string;
}

export interface PatientSession extends SessionData {
    role: 'patient';
    pid: string;
}

export interface DoctorSession extends SessionData {
    role: 'doctor';
    did: string;
}

export type UserSession = PatientSession | DoctorSession;
