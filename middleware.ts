import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect video call routes - require session for /call/*
    if (pathname.startsWith('/call/')) {
        const patientSessionCookie = request.cookies.get('patient_session');
        const doctorSessionCookie = request.cookies.get('doctor_session');
        
        if (!patientSessionCookie && !doctorSessionCookie) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            let session = null;
            
            if (patientSessionCookie) {
                session = JSON.parse(patientSessionCookie.value);
            } else if (doctorSessionCookie) {
                session = JSON.parse(doctorSessionCookie.value);
            }
            
            // Validate session has required fields
            if (!session || !session.uid || !session.role) {
                return NextResponse.redirect(new URL('/', request.url));
            }
            
            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/call/:path*'],
};
