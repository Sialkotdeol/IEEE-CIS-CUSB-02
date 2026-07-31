import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import SceneWrapper from "@/components/canvas/SceneWrapper";
import PageLoader from "@/components/dom/PageLoader";
import { cn } from "../lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IEEE CIS CUSB",
  description: "Advancing AI, ML & Intelligent Systems at Chandigarh University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground`} suppressHydrationWarning>
        <PageLoader />
        <div className="relative w-full min-h-[100dvh]">
          <div className="fixed inset-0 z-0 pointer-events-none">
             <SceneWrapper />
          </div>
          <main className="relative z-10 w-full min-h-[100dvh] flex flex-col">
            {children}
          </main>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
