"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import BackButton from "@/components/dom/BackButton";

import { pastEvents } from "@/data/events";

export default function PastEvents() {
  return (
    <>
      <Nav />
      <div className="w-full relative z-10 pt-40 pb-32 px-6 min-h-screen bg-gradient-to-b from-transparent to-background via-background/80">
        <div className="max-w-6xl mx-auto">
          <BackButton fallback="/events" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-accent">
              Past Events
            </h1>
            <p className="text-xl text-white/60 font-light max-w-2xl mx-auto mb-8">
              Celebrating the achievements and impact of our community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastEvents.map((event, index) => {
              const hasMedia = event.media && event.media.length > 0;
              return (
                <Link href={`/past-events/${event.slug}`} key={index} className="block h-full">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`glass-panel p-8 rounded-3xl transition-colors flex flex-col h-full group hover:border-primary/50 cursor-pointer`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl md:text-2xl font-bold leading-tight pr-4 transition-colors group-hover:text-primary`}>{event.title}</h3>
                      <span className="text-2xl shrink-0">{event.type === 'hackathon' ? '🏆' : '📚'}</span>
                    </div>
                    
                    <div className="text-primary font-semibold mb-6 flex items-center gap-2">
                      📅 <span>{event.date}</span>
                    </div>
                    
                    <p className="text-white/70 mb-8 flex-grow leading-relaxed text-sm">
                      {event.description}
                    </p>
                    
                    <div>
                      <div className={`flex items-center gap-2 mb-4 text-sm font-medium text-primary`}>
                        {hasMedia ? `View ${event.media!.length} photos` : `View full details`}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
