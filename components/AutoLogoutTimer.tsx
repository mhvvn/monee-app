"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export function AutoLogoutTimer({ timeoutMinutes = 5 }: { timeoutMinutes?: number }) {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Convert minutes to milliseconds
        timeoutRef.current = setTimeout(async () => {
            // Logout user
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        // Redirect handled by middleware/global auth check, but just in case
                        router.push('/login');
                        // Optional: you could redirect to a specific page like /login?timeout=true
                    }
                }
            });
        }, timeoutMinutes * 60 * 1000); // Minutes to MS
    };

    useEffect(() => {
        // Events that indicate user activity
        const activities = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart'
        ];

        // Setup the initial timer
        resetTimer();

        // Attach event listeners to reset the timer on activity
        activities.forEach((activity) => {
            document.addEventListener(activity, resetTimer, { passive: true });
        });

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            activities.forEach((activity) => {
                document.removeEventListener(activity, resetTimer);
            });
        };
    }, [timeoutMinutes, router]); // Re-run if timeoutMinutes changes

    return null; // This component doesn't render anything
}
