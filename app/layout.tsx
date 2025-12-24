import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'

const poppins = Poppins({ 
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins',
})

export const metadata: Metadata = {
    title: 'HealthCare - Appointment Booking System',
    description: 'Book appointments with doctors online or offline - Modern healthcare management platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} font-sans`}>
                {children}
                <Toaster />
            </body>
        </html>
    )
}
