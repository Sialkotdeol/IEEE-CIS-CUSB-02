"use client";

import { useState } from "react";
import { Check, Copy, PlusSquare } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

// Share / add-to-LinkedIn buttons for badge and wallet pages.
export default function ShareActions({ url, linkedInAddUrl, shareLabel = "Share on LinkedIn" }: { url: string; linkedInAddUrl?: string; shareLabel?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const btn = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors";
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {linkedInAddUrl && (
        <a href={linkedInAddUrl} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#0a66c2] hover:bg-[#004182] text-white`}>
          <PlusSquare className="w-4 h-4" /> Add to LinkedIn profile
        </a>
      )}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btn} ${linkedInAddUrl ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-[#0a66c2] hover:bg-[#004182] text-white"}`}
      >
        <FaLinkedin className="w-4 h-4" /> {shareLabel}
      </a>
      <button onClick={copy} className={`${btn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`}>
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
