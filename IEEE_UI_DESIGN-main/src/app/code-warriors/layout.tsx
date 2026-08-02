"use client";

import { CodeWarriorsAuthProvider } from "@/context/CodeWarriorsAuthContext";
import { Toaster } from "@/components/ui/sonner";

export default function CodeWarriorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CodeWarriorsAuthProvider>
      <div className="dark min-h-screen bg-[#050505] text-white antialiased">
        {children}
        <Toaster theme="dark" position="top-right" closeButton richColors />
      </div>
    </CodeWarriorsAuthProvider>
  );
}
