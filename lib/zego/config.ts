// ZEGO Cloud Web UI Kit Configuration
// The UI Kit handles token generation automatically for testing

const ZEGO_APP_ID = process.env.NEXT_PUBLIC_ZEGO_APP_ID!;
const ZEGO_SERVER_SECRET = process.env.ZEGO_SERVER_SECRET!;

export const zegoConfig = {
    appId: parseInt(ZEGO_APP_ID),
    serverSecret: ZEGO_SERVER_SECRET,
};

/**
 * Generate a unique meeting ID for an appointment
 */
export function generateMeetingId(appointmentId: string): string {
    return `appointment_${appointmentId}_${Date.now()}`;
}

/**
 * ZEGO Cloud Web UI Kit Configuration
 * The UI Kit uses these values for automatic token generation in test mode
 */
export const zegoUIKitConfig = {
    appId: 1200963791,
    serverSecret: "efa1221bda70ba86f1124cff9bed296c",
};
