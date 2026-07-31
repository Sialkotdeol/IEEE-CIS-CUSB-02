"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { motion } from "framer-motion";

export default function FutureEvents() {
  return (
    <>
      <Nav />
      <div className="w-full relative z-10 pt-40 pb-32 px-6 min-h-screen bg-gradient-to-b from-transparent to-background via-background/80">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-accent">
              Future Events
            </h1>
            <p className="text-xl text-white/60 font-light max-w-2xl mx-auto mb-16">
              Stay tuned for our next big event! Follow us for updates.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="glass-panel p-12 rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin mx-auto mb-8" />
            <a href="/" className="inline-block px-8 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform">
              Return Home
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
