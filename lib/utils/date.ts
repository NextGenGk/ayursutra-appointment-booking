import { format, isPast, parseISO, addMinutes, isBefore, isAfter } from 'date-fns';

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string): boolean {
    return isPast(parseISO(date));
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
    return format(parseISO(date), 'MMM dd, yyyy');
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
    // Time is stored as HH:mm:ss, convert to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Check if the call button should be active
 * Active 15 minutes before scheduled time
 */
export function isCallButtonActive(scheduledDate: string, scheduledTime: string): boolean {
    const now = new Date();

    // Combine date and time
    const [hours, minutes] = scheduledTime.split(':');
    const scheduledDateTime = parseISO(scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate 15 minutes before scheduled time
    const activationTime = addMinutes(scheduledDateTime, -15);

    // Button is active if current time is after activation time and before scheduled time + 2 hours
    const expirationTime = addMinutes(scheduledDateTime, 120);

    return isAfter(now, activationTime) && isBefore(now, expirationTime);
}

/**
 * Combine date and time strings into ISO datetime
 */
export function combineDateAndTime(date: string, time: string): string {
    const [hours, minutes] = time.split(':');
    const dateTime = parseISO(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateTime.toISOString();
}

/**
 * Calculate duration in minutes between two timestamps
 */
export function calculateDuration(startTime: string, endTime: string): number {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return Math.floor((end.getTime() - start.getTime()) / 60000);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get minimum selectable date (today)
 */
export function getMinDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
}
