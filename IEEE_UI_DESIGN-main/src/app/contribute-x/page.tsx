"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { motion } from "framer-motion";
import { MapPin, Calendar, BookOpen, GitMerge, Target, Rocket, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function ContributeX() {
  return (
    <>
      <Nav />
      <div className="w-full relative z-10 pt-36 pb-24 px-6 min-h-screen pixel-grid-bg text-slate-900">
        <div className="max-w-5xl mx-auto flex flex-col gap-20">
          
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 group font-semibold text-sm"
            >
              <ArrowLeft size={16} className="transform transition-transform group-hover:-translate-x-1" /> Back to Events
            </Link>

            <div className="section-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <Sparkles size={14} className="text-primary animate-pulse" /> IEEE CIS × IEEE RAS Collaboration
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-slate-900">
              CONTRIBUTE-<span className="gaming-text-gradient">X</span>
            </h1>

            <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
              Open Source Bootcamp & Contribution Challenge. From Learners to Contributors — Build, Collaborate, Contribute.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center text-slate-600 font-mono text-sm font-semibold mb-8">
              <div className="flex items-center gap-2 justify-center bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                <MapPin size={16} className="text-primary" /> <span>Chandigarh University (Offline)</span>
              </div>
              <div className="flex items-center gap-2 justify-center bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                <Calendar size={16} className="text-primary" /> <span>6th March 2026</span>
              </div>
            </div>
          </motion.section>

          {/* Phases Grid */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <SpotlightCard glowHue={205} spotSize={260} borderSize={2} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
              <BookOpen size={32} className="text-primary mb-5" />
              <h3 className="text-2xl font-bold mb-1 text-slate-900">Phase I</h3>
              <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3 font-mono">Expert-Led Open Source Masterclass</p>
              <p className="text-slate-600 text-sm leading-relaxed">A comprehensive 3-hour masterclass covering fundamentals, GitHub workflows, live demos, and beginner roadmaps.</p>
            </SpotlightCard>

            <SpotlightCard glowHue={192} spotSize={260} borderSize={2} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
              <GitMerge size={32} className="text-cyan-600 mb-5" />
              <h3 className="text-2xl font-bold mb-1 text-slate-900">Phase II</h3>
              <p className="text-cyan-600 font-bold text-sm uppercase tracking-wider mb-3 font-mono">Live Contribution Challenge</p>
              <p className="text-slate-600 text-sm leading-relaxed">A 2-hour hands-on challenge where participants submit real pull requests to beginner-friendly repositories.</p>
            </SpotlightCard>

            <SpotlightCard glowHue={205} spotSize={260} borderSize={2} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
              <Target size={32} className="text-primary mb-5" />
              <h3 className="text-2xl font-bold mb-1 text-slate-900">Objective</h3>
              <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3 font-mono">Transform Students</p>
              <p className="text-slate-600 text-sm leading-relaxed">Transition students from passive learners into active, confident open source contributors.</p>
            </SpotlightCard>

            <SpotlightCard glowHue={192} spotSize={260} borderSize={2} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
              <Rocket size={32} className="text-cyan-600 mb-5" />
              <h3 className="text-2xl font-bold mb-1 text-slate-900">Outcome</h3>
              <p className="text-cyan-600 font-bold text-sm uppercase tracking-wider mb-3 font-mono">Real-World Impact</p>
              <p className="text-slate-600 text-sm leading-relaxed">First-time PRs, improved GitHub profiles, and increased GSoC/GSSoC participation readiness.</p>
            </SpotlightCard>
          </motion.section>

          {/* Closed Status Banner */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-10 text-center rounded-3xl border border-amber-200 bg-amber-50/80 shadow-md relative overflow-hidden"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-3 text-amber-900">Registrations Closed</h2>
            <p className="text-amber-800 text-sm md:text-base mb-6 max-w-lg mx-auto leading-relaxed">
              Registrations are currently closed for this cohort, but wild card entries may open soon! Stay connected for updates.
            </p>
            <Link href="/events" className="inline-block px-8 py-3 rounded-full bg-primary hover:bg-[#00527f] text-white font-bold text-sm transition-all shadow-md">
              Return to Events
            </Link>
          </motion.section>
        </div>
      </div>
      <Footer />
    </>
  );
}
