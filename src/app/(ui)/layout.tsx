"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { useGetQueryClient } from "@/hooks/query/useGetQueryClient";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = useGetQueryClient()

  useEffect(() => {
    document.title = "Caddy Control";
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.className = `${geistSans.variable} ${geistMono.variable} antialiased`;
    }
  }, []);

  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <main>
              {children}
            </main>
          </TooltipProvider>

          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
