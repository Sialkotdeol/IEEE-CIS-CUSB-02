"use client";

import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Users, Calendar, Award, Sparkles } from "lucide-react";

const STATS = [
  { icon: <Users size={22} className="text-primary" />, number: "45", label: "Active Members" },
  { icon: <Calendar size={22} className="text-cyan-600" />, number: "25+", label: "Events & Workshops" },
  { icon: <Sparkles size={22} className="text-amber-500" />, number: "100%", label: "Peer Innovation" },
];

export default function About() {
  return (
    <section
      id="about"
      data-reveal
      className="reveal-section light-panel relative w-full flex flex-col items-center justify-center overflow-hidden py-24 md:py-32 bg-gradient-to-b from-slate-50 via-white to-slate-50"
    >
      <div className="relative w-full flex flex-col items-center justify-center max-w-6xl mx-auto px-6">
        
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="section-eyebrow inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase shadow-sm">
            <Sparkles size={14} className="text-primary animate-pulse" />
            About IEEE CIS CUSB
          </div>
        </motion.div>

        {/* Dynamic Phrases */}
        <div className="text-center flex flex-col items-center max-w-4xl mx-auto mb-16 space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-[1.1]"
          >
            We are a community of innovators exploring the frontiers of intelligence.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 font-normal leading-relaxed max-w-3xl"
          >
            We organize workshops, competitions, and technical sessions bridging theory and real-world impact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mt-4"
          >
            <GradientText animated={true}>
              Our mission is to empower students to build the future of AI & Machine Learning.
            </GradientText>
          </motion.div>
        </div>

        {/* Interactive Stats Grid with Spotlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <SpotlightCard
                glowHue={205}
                spotSize={220}
                borderSize={2}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md text-center group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/6 border border-primary/15 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {stat.number}
                </p>
                <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider font-mono">
                  {stat.label}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
