"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, X } from "lucide-react";

// Home-page nudge for the Call for Positions. Shows only while applications are open
// (controlled from the admin portal) and only once per browser session.

const DISMISS_KEY = "cis-positions-popup-dismissed";

export default function PositionsPopup() {
  const [info, setInfo] = useState<{ tenure: string } | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // storage blocked — still show the popup
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/call-for-positions");
        const data = await res.json();
        if (!cancelled && data.open) setInfo({ tenure: data.tenure });
      } catch {
        // offline or API down — just don't show it
      }
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setInfo(null);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {info && (
        <motion.div
          role="dialog"
          aria-label="Call for positions"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[360px] z-[60] bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">We&apos;re recruiting · {info.tenure}</p>
              <h3 className="font-black text-slate-900 leading-snug mb-1">Join the IEEE CIS CUSB core team</h3>
              <p className="text-sm text-slate-500 mb-4">Applications for the next team are open. Pick up to two roles.</p>
              <Link
                href="/call-for-positions"
                onClick={dismiss}
                className="inline-block px-5 py-2.5 rounded-full bg-primary hover:bg-[#00527f] text-white text-sm font-bold transition-colors"
              >
                View open roles
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
