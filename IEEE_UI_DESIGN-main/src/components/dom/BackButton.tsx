"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ fallback = "/events" }: { fallback?: string }) {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => {
        window.dispatchEvent(new CustomEvent("page-leave"));
        setTimeout(() => {
          if (window.history.length > 2) {
            router.back();
          } else {
            router.push(fallback);
          }
        }, 400);
      }} 
      className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-12 group bg-transparent border-none cursor-pointer p-0"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span>Go Back</span>
    </button>
  );
}
