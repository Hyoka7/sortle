import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ABC Sortle",
    description: "AtCoder Beginner Contest(ABC)の問題を難易度の順にに並び替えるゲーム",
    icons: {
        icon: {
            url: "/ice.svg",
            type: "image/svg+xml",
        },
        apple: "/ice.svg", // apple-touch-icon用
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
