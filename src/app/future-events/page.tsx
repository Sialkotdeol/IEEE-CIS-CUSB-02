"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Calendar } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function FutureEvents() {
  return (
    <>
      <Nav />
      <div className="w-full relative z-10 pt-40 pb-32 px-6 min-h-screen pixel-grid-bg text-slate-900 flex flex-col justify-between">
        <div className="max-w-4xl mx-auto text-center w-full my-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <Sparkles size={14} className="text-primary animate-pulse" /> Upcoming Horizons
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-slate-900">
              Future <span className="gaming-text-gradient">Events</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto mb-12">
              Stay tuned for our upcoming flagship hackathons, workshops, and AI innovation days!
            </p>
          </motion.div>

          <SpotlightCard
            glowHue={205}
            spotSize={300}
            borderSize={2}
            className="p-12 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-xl mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6">
              <Calendar size={28} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">New Events Coming Soon!</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Our team is curating the next set of hands-on workshops and contests. Check back shortly for registration links.
            </p>
            <Link href="/" className="inline-block px-8 py-3.5 rounded-full bg-primary hover:bg-[#00527f] text-white font-bold text-sm tracking-wide transition-all shadow-md">
              Return Home
            </Link>
          </SpotlightCard>
        </div>
      </div>
      <Footer />
    </>
  );
}
