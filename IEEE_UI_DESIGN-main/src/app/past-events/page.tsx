"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import BackButton from "@/components/dom/BackButton";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";
import { pastEvents } from "@/data/events";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function PastEvents() {
  return (
    <>
      <Nav />
      <div className="w-full relative z-10 pt-36 pb-32 px-6 min-h-screen pixel-grid-bg text-slate-900">
        <div className="max-w-6xl mx-auto">
          <BackButton fallback="/events" />
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="section-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
              <Sparkles size={14} className="text-primary animate-pulse" /> Event Hall of Fame
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-slate-900">
              Past Events & Archives
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto">
              Celebrating the milestones, hackathons, workshops, and achievements of IEEE CIS CUSB.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastEvents.map((event, index) => {
              const hasMedia = event.media && event.media.length > 0;
              return (
                <SpotlightCard
                  key={index}
                  glowHue={205}
                  spotSize={260}
                  borderSize={2}
                  className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md group hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <Link href={`/past-events/${event.slug}`} className="p-8 flex flex-col h-full block">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl md:text-2xl font-bold leading-tight text-slate-900 group-hover:text-primary transition-colors pr-4">
                        {event.title}
                      </h3>
                      <span className="text-2xl shrink-0">{event.type === 'hackathon' ? '🏆' : '📚'}</span>
                    </div>
                    
                    <div className="text-primary font-bold text-xs mb-4 flex items-center gap-2 font-mono">
                      <Calendar size={14} /> <span>{event.date}</span>
                    </div>
                    
                    <p className="text-slate-600 mb-6 flex-grow leading-relaxed text-xs md:text-sm font-normal">
                      {event.description}
                    </p>
                    
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-primary uppercase tracking-wider">
                        {hasMedia ? `View ${event.media!.length} photos` : `View full details`}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {event.tags?.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
