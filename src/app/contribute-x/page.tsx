"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { motion } from "framer-motion";
import { MapPin, Calendar, BookOpen, GitMerge, Target, Rocket } from "lucide-react";

export default function ContributeX() {
  return (
    <>
      <Nav />
      <div className="w-full relative z-10 pt-32 pb-20 px-6 min-h-screen bg-gradient-to-b from-transparent to-background via-background/80">
        <div className="max-w-5xl mx-auto flex flex-col gap-24">
          
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              IEEE CIS × IEEE RAS
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-accent">
              CONTRIBUTE-X
            </h1>
            <p className="text-xl text-white/60 font-light max-w-2xl mx-auto mb-8">
              Open Source Bootcamp & Contribution Challenge. From Learners to Contributors — Build, Collaborate, Contribute.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-white/60 mb-12">
              <div className="flex items-center gap-2 justify-center">
                <MapPin className="text-primary" /> <span>Chandigarh University (Offline)</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="text-primary" /> <span>6th March 2026</span>
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="glass-panel p-10 rounded-3xl hover:border-primary/50 transition-colors">
              <BookOpen size={32} className="text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-2">Phase I</h3>
              <p className="text-primary font-medium mb-4">Expert-Led Open Source Masterclass</p>
              <p className="text-white/60">A comprehensive 3-hour masterclass covering fundamentals, GitHub workflows, live demos, and beginner roadmaps.</p>
            </div>
            <div className="glass-panel p-10 rounded-3xl hover:border-accent/50 transition-colors">
              <GitMerge size={32} className="text-accent mb-6" />
              <h3 className="text-2xl font-bold mb-2">Phase II</h3>
              <p className="text-accent font-medium mb-4">Live Contribution Challenge</p>
              <p className="text-white/60">A 2-hour hands-on challenge where participants submit real pull requests to beginner-friendly repositories.</p>
            </div>
            <div className="glass-panel p-10 rounded-3xl hover:border-primary/50 transition-colors">
              <Target size={32} className="text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-2">Objective</h3>
              <p className="text-primary font-medium mb-4">Transform Students</p>
              <p className="text-white/60">Transition students from passive learners into active, confident open source contributors.</p>
            </div>
            <div className="glass-panel p-10 rounded-3xl hover:border-accent/50 transition-colors">
              <Rocket size={32} className="text-accent mb-6" />
              <h3 className="text-2xl font-bold mb-2">Outcome</h3>
              <p className="text-accent font-medium mb-4">Real-World Impact</p>
              <p className="text-white/60">First-time PRs, improved GitHub profiles, and increased GSoC/GSSoC participation readiness.</p>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel p-12 text-center rounded-3xl border-destructive/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-destructive/5" />
            <h2 className="relative z-10 text-3xl font-bold mb-6 text-destructive">Registrations Closed</h2>
            <p className="relative z-10 text-white/60 text-lg mb-8 max-w-lg mx-auto">
              Registrations are currently closed, but we may accept wild card entries! Stay connected for more updates.
            </p>
            <a href="/" className="relative z-10 inline-block px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10 font-semibold">
              Return Home
            </a>
          </motion.section>
        </div>
      </div>
      <Footer />
    </>
  );
}
