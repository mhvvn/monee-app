import React from "react";

export default function CoinIcon({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer Circle (Darker Gold/Yellow) */}
            <circle cx="16" cy="16" r="16" fill="#FFC107" />

            {/* Inner Circle (Lighter Yellow) */}
            <circle cx="16" cy="16" r="12.5" fill="#FFD54F" />

            {/* Dollar Sign (Orange) */}
            <path
                d="M16 6.5v19m3.5-13.5c0-1.8-1.5-3-3.5-3-2 0-3.5 1.2-3.5 3 0 1.8 1.5 2.5 3.5 3 2.5.5 4 1.5 4 3.5 0 2-1.5 3.5-4 3.5-2 0-3.5-1-4-2.5"
                stroke="#FF9800"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
