'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBannerProps {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    onClose?: () => void;
    autoClose?: boolean;
    duration?: number;
}

export function NotificationBanner({
    message,
    type = 'info',
    onClose,
    autoClose = true,
    duration = 5000,
}: NotificationBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    if (!isVisible) return null;

    const bgColors = {
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
    };

    return (
        <div
            className={cn(
                'flex items-center justify-between p-4 border rounded-lg shadow-sm animate-slide-in',
                bgColors[type]
            )}
        >
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    onClose?.();
                }}
                className="ml-4 hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
