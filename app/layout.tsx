import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { ClerkProvider } from '@clerk/nextjs'
import { SubscriptionProvider } from "@/components/providers/subscription-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Shortlist | Build resumes that get you hired",
  description: "ATS-safe, modern, and effective resumes for early-career professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&family=Merriweather:wght@300;400;700;900&family=Source+Sans+3:wght@200..900&display=swap" rel="stylesheet" />
        </head>
        <body
          className={`font-sans antialiased bg-background text-foreground`}
          style={{
            fontFamily: "'Inter', sans-serif",
            // @ts-ignore
            "--font-outfit": "'Outfit', sans-serif"
          }}
        >
          <ConvexClientProvider>
            <SubscriptionProvider>
              <Header />
              {children}
              <Toaster />
            </SubscriptionProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
