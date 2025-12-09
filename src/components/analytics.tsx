"use client";

import { useEffect } from "react";

export function Analytics() {
    useEffect(() => {
        // This is a stub for Google Analytics / Umami.
        // In production, we would inject a script tag here or initialize the library.
        if (process.env.NODE_ENV === "production") {
            console.log("Analytics initialized.");
        }
    }, []);

    return null;
}
