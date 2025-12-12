"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    className?: string;
    children: React.ReactNode;
}

export function LoadingButton({ href, variant = "primary", className = "", children, ...props }: LoadingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (href) {
            e.preventDefault();
            setIsLoading(true);
            router.push(href);
        }
        if (props.onClick) {
            props.onClick(e);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || props.disabled}
            className={`relative flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute left-1/2 -ml-2" />}
            <span className={isLoading ? "opacity-0" : "opacity-100"}>{children}</span>
        </button>
    );
}
