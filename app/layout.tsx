import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GitGud | Your AI Open Source Mentor",
    template: "%s | GitGud",
  },
  description: "Master open source contributions with GitGud. Get AI-powered guidance on GitHub issues, real-time code mentorship, and a seamless developer workspace.",
  keywords: [
    "Open Source",
    "AI Coding Mentor",
    "GitHub Issue Solver",
    "Developer Tools",
    "Coding Mentorship",
    "Software Engineering",
    "GitGud AI",
  ],
  authors: [{ name: "GitGud Team" }],
  creator: "GitGud",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gitgud.ai", // Replace with your actual domain
    siteName: "GitGud",
    title: "GitGud | Your AI Open Source Mentor",
    description: "Level up your coding skills by solving real-world GitHub issues with an AI mentor by your side.",
    images: [
      {
        url: "/og-image.png", // Ensure you have an OG image in your public folder
        width: 1200,
        height: 630,
        alt: "GitGud Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitGud | AI-Powered GitHub Issue Solver",
    description: "The easiest way to start contributing to open source. Guided AI mentorship for every pull request.",
    images: ["/og-image.png"],
    creator: "@gitgud_ai", // Replace with your twitter handle
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white`}
        >
          {/* 
            Wrap everything in ThemeProvider to force dark mode (or handle system preference).
            'attribute="class"' is required for Tailwind dark mode.
            'defaultTheme="dark"' makes it dark by default to match Aceternity UI.
          */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header: Positioned Absolute so it overlays the Hero background */}
            {/* <header className="absolute top-0 right-0 z-50 flex items-center justify-end gap-4 p-6">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10",
                    },
                  }}
                />
              </SignedIn>
            </header> */}

            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}