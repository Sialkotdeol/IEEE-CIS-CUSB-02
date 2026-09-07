"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, ArrowLeft } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: <Eye className="w-6 h-6 text-primary" />,
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Personal Information:</strong> When you sign in to use the Code Warriors Portal or other features, we collect your name and email address.</li>
          <li><strong>Platform Data:</strong> For the Code Warriors portal, we collect links to your external coding profiles (e.g., LeetCode) and your submitted solutions.</li>
          <li><strong>Usage Data:</strong> We track your streak, leaderboard rankings, and participation in IEEE CIS CUSB events.</li>
        </ul>
      )
    },
    {
      title: "2. How We Use Your Information",
      icon: <Server className="w-6 h-6 text-cyan-600" />,
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>To provide and maintain the Warriors Portal, including the global leaderboard and personal streaks.</li>
          <li>To verify your identity and manage your access to our systems securely.</li>
          <li>To communicate with you regarding upcoming events, hackathons, and important community updates.</li>
          <li>To improve our platform and ensure a safe, competitive environment for all members.</li>
        </ul>
      )
    },
    {
      title: "3. Data Security & Storage",
      icon: <Lock className="w-6 h-6 text-indigo-600" />,
      content: (
        <p className="text-slate-600 leading-relaxed">
          Your data is securely stored using industry-standard encryption through our backend provider (Supabase). We do not store plain-text passwords. We implement strict access controls to ensure your personal information remains confidential.
        </p>
      )
    },
    {
      title: "4. Third-Party Sharing",
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      content: (
        <p className="text-slate-600 leading-relaxed">
          We strictly respect your privacy. We <strong>do not</strong> sell, rent, or trade your personal information to outside parties. Your data is only shared with our trusted infrastructure partners strictly for the purpose of operating this website and its features.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-[100dvh] pixel-grid-bg text-slate-900 py-24 px-6 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-400/6 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-12 group font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
          Back to Main Site
        </Link>

        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-16 h-16 bg-gradient-to-tr from-primary to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-md"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl font-light"
          >
            At IEEE Computational Intelligence Society CUSB, we are committed to protecting your personal information and your right to privacy.
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-slate-400 mt-3 font-mono font-bold"
          >
            Last updated: 2026
          </motion.p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div 
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
            >
              <SpotlightCard
                glowHue={205}
                spotSize={260}
                borderSize={2}
                className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/6 border border-primary/15 shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-3 text-slate-900">{section.title}</h2>
                    {section.content}
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-slate-500 text-xs font-medium"
        >
          <p>If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact the IEEE CIS CUSB webmaster team.</p>
        </motion.div>

      </div>
    </div>
  );
}
