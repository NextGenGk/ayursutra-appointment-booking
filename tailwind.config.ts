import type { Config } from "tailwindcss"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                'sans': ['Poppins', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Health-specific colors
                health: {
                    primary: "#10B981",
                    secondary: "#F59E0B", 
                    accent: "#3B82F6",
                },
                // Status colors for appointments
                status: {
                    confirmed: "#10B981",
                    pending: "#EAB308",
                    cancelled: "#EF4444",
                    completed: "#3B82F6",
                },
                // Extended green palette
                'primary-green': {
                    DEFAULT: "#10B981",
                    hover: "#059669",
                },
                'secondary-green': "#34D399",
                'tertiary-green': "#6EE7B7",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(-10px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "slide-in": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(0)" },
                },
                "slide-up": {
                    from: { opacity: "0", transform: "translateY(20px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "pulse-green": {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)" },
                    "70%": { boxShadow: "0 0 0 10px rgba(16, 185, 129, 0)" },
                },
                "bounce-gentle": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5px)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "slide-in": "slide-in 0.3s ease-out",
                "slide-up": "slide-up 0.3s ease-out",
                "pulse-green": "pulse-green 2s infinite",
                "bounce-gentle": "bounce-gentle 2s infinite",
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, rgb(240 253 244) 0%, rgb(209 250 229) 50%, rgb(204 251 241) 100%)',
                'button-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'button-gradient-hover': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
            boxShadow: {
                'green-sm': '0 1px 2px 0 rgba(16, 185, 129, 0.05)',
                'green-md': '0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06)',
                'green-lg': '0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
