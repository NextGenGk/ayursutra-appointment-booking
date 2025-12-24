# Appointment Booking System

A complete appointment booking module built with Next.js 14, Supabase, and ZegoCloud for video conferencing.

## Features

- **Email-only Authentication** (Development mode)
- **Patient Features**:
  - Browse and book appointments with doctors
  - Online (video call) and offline (in-person) appointment modes
  - Real-time notifications for appointment updates
  - Join video consultations
- **Doctor Features**:
  - Manage appointment requests (approve/reschedule)
  - Tabbed dashboard (Pending, Confirmed, Rescheduled, Today's appointments)
  - Start and conduct video consultations
  - Token-based queue system for offline appointments
- **Real-time Updates** via Supabase subscriptions
- **Modern UI** with Tailwind CSS, glassmorphism, and animations

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Video Conferencing**: ZegoCloud
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **Supabase Account** with a project set up
3. **ZegoCloud Account** with App ID and Server Secret
4. **Database Schema** created in Supabase (see specification)

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:\Users\Mayank\Desktop\Appointment
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # ZegoCloud Configuration
   NEXT_PUBLIC_ZEGO_APP_ID=your_zego_app_id
   ZEGO_SERVER_SECRET=your_zego_server_secret

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**:
   
   Run the SQL schema provided in the specification to create:
   - `users` table
   - `patients` table
   - `doctors` table
   - `appointments` table

5. **Add sample data** (optional):
   
   Insert sample doctors and patients into your Supabase database for testing.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Application Flow

### For Patients

1. Navigate to `http://localhost:3000`
2. Click "Login as Patient"
3. Enter your email (must exist in database with role='patient')
4. Browse available doctors
5. Click "Book Appointment" on any doctor card
6. Fill in appointment details (name, age, mode, date, time, reason)
7. Submit booking request
8. Wait for doctor approval (real-time notification)
9. Join video call when doctor starts (for online appointments)

### For Doctors

1. Navigate to `http://localhost:3000`
2. Click "Login as Doctor"
3. Enter your email (must exist in database with role='doctor')
4. View appointment requests in tabs:
   - **Pending**: New appointment requests
   - **Confirmed**: Approved appointments
   - **Rescheduled**: Rescheduled appointments
   - **Today**: All appointments scheduled for today
5. Approve or reschedule appointments
6. Start video call (15 minutes before scheduled time for online appointments)
7. Complete appointment after consultation

## API Routes

### Authentication
- `POST /api/auth/patient/login` - Patient login
- `POST /api/auth/doctor/login` - Doctor login
- `POST /api/auth/logout` - Logout

### Patient APIs
- `GET /api/patient/doctors` - Get all active doctors
- `GET /api/patient/appointments` - Get patient's appointments
- `POST /api/patient/appointments` - Create new appointment

### Doctor APIs
- `GET /api/doctor/appointments` - Get doctor's appointments (with filters)
- `PUT /api/doctor/appointments/[aid]/approve` - Approve appointment
- `PUT /api/doctor/appointments/[aid]/reschedule` - Reschedule appointment
- `PUT /api/doctor/appointments/[aid]/start-call` - Start video call
- `PUT /api/doctor/appointments/[aid]/complete` - Complete appointment

## Key Features Explained

### Token Generation (Offline Appointments)
- Sequential token numbers generated per doctor per day
- Automatically incremented when booking offline appointments
- Regenerated when rescheduling to a different date

### Real-time Notifications
- Supabase real-time subscriptions for instant updates
- Patients notified when appointments are approved/rescheduled
- Patients notified when doctor starts video call

### Video Call Activation
- Call button becomes active 15 minutes before scheduled time
- Doctor initiates call, patient joins via notification
- Meeting ID and link generated dynamically

### Route Protection
- Middleware validates sessions and enforces role-based access
- Patients can only access `/patient/*` routes
- Doctors can only access `/doctor/*` routes

## Important Notes

⚠️ **Security Warning**: This implementation uses email-only authentication for development purposes. **DO NOT use in production** without implementing proper password-based authentication or OAuth.

⚠️ **ZegoCloud Integration**: The video call page includes a basic WebRTC implementation. For full ZegoCloud functionality, you need to:
1. Import the ZegoCloud SDK properly
2. Implement token generation on the server
3. Handle stream publishing and subscribing
4. Refer to ZegoCloud documentation for complete integration

## Project Structure

```
appointment-booking/
├── app/
│   ├── api/                    # API routes
│   ├── call/[meetingId]/      # Video call page
│   ├── doctor/dashboard/      # Doctor dashboard
│   ├── patient/dashboard/     # Patient dashboard
│   ├── doctor-login/          # Doctor login page
│   ├── patient-login/         # Patient login page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── ui/                    # Base UI components
│   ├── appointment-card.tsx   # Appointment display
│   ├── booking-modal.tsx      # Booking form
│   ├── doctor-card.tsx        # Doctor display
│   ├── notification-banner.tsx # Notifications
│   └── reschedule-modal.tsx   # Reschedule form
├── hooks/
│   └── use-realtime-appointments.ts # Real-time hook
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── utils/                 # Utility functions
│   └── zego/                  # ZegoCloud config
├── types/
│   ├── database.ts            # Database types
│   └── session.ts             # Session types
├── middleware.ts              # Route protection
└── package.json
```

## Troubleshooting

### "No patient/doctor account found"
- Ensure the email exists in the `users` table with the correct role
- Check that there's a corresponding entry in `patients` or `doctors` table

### Real-time notifications not working
- Verify Supabase real-time is enabled for your project
- Check browser console for connection errors
- Ensure Row Level Security (RLS) policies allow subscriptions

### Video call not starting
- Check ZegoCloud credentials are correct
- Ensure browser has camera/microphone permissions
- Verify meeting ID is being generated correctly

## License

This project is for educational/development purposes.
