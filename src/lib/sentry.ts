// This is a stub for Sentry initialization.
// We are expecting the SENTRY_DSN environment variable to be set.
// If it is not set, we simply log a warning and do nothing.

export const initSentry = () => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) {
        console.warn("Sentry DSN not found. Sentry is disabled.");
        return;
    }

    // In a real implementation, we would import * as Sentry from "@sentry/nextjs"
    // and call Sentry.init({ dsn });
    console.log("Sentry initialized with DSN:", dsn);
};
