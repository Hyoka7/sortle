"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

export function ThemeToggleButton() {
    const { setTheme, theme } = useTheme();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setTheme(theme === "light" ? "dark" : "light");
        e.currentTarget.blur();
    };

    return (
        <button
            onClick={handleClick}
            className={clsx(
                "p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500",
                "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
            aria-label="Toggle theme"
        >
            <span className="w-5 h-5 flex items-center justify-center text-lg">
                <span className="dark:hidden">💡</span>
                <span className="hidden dark:inline">🌙</span>
            </span>
        </button>
    );
}
