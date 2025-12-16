"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
    useEffect(() => {
        // Store original console.error
        const originalError = console.error;

        // Override console.error to filter out Supabase auth errors
        console.error = (...args: any[]) => {
            // Check if this is a Supabase refresh token error
            const errorString = args.join(' ');

            if (
                errorString.includes('Invalid Refresh Token') ||
                errorString.includes('refresh_token_not_found') ||
                errorString.includes('Refresh Token Not Found')
            ) {
                // Silently ignore these errors
                return;
            }

            // Log all other errors normally
            originalError.apply(console, args);
        };

        // Cleanup on unmount
        return () => {
            console.error = originalError;
        };
    }, []);

    return null;
}
