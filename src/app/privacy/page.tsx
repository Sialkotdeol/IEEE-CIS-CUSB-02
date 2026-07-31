"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: <Eye className="w-6 h-6 text-indigo-400" />,
      content: (
        <ul className="list-disc pl-5 space-y-2 text-white/70">
          <li><strong>Personal Information:</strong> When you sign in via Google to use the Code Warriors Portal or other features, we collect your name and email address.</li>
          <li><strong>Platform Data:</strong> For the Code Warriors portal, we collect links to your external coding profiles (e.g., LeetCode) and your submitted solutions.</li>
          <li><strong>Usage Data:</strong> We track your streak, leaderboard rankings, and participation in IEEE CIS CUSB events.</li>
        </ul>
      )
    },
    {
      title: "2. How We Use Your Information",
      icon: <Server className="w-6 h-6 text-purple-400" />,
      content: (
        <ul className="list-disc pl-5 space-y-2 text-white/70">
          <li>To provide and maintain the Warriors Portal, including the global leaderboard and personal streaks.</li>
          <li>To verify your identity and manage your access to our systems securely.</li>
          <li>To communicate with you regarding upcoming events, hackathons, and important community updates.</li>
          <li>To improve our platform and ensure a safe, competitive environment for all members.</li>
        </ul>
      )
    },
    {
      title: "3. Data Security & Storage",
      icon: <Lock className="w-6 h-6 text-rose-400" />,
      content: (
        <p className="text-white/70 leading-relaxed">
          Your data is securely stored using industry-standard encryption through our backend provider (Supabase). We do not store your passwords, as all authentication is securely handled by Google OAuth. We implement strict access controls to ensure your personal information remains confidential.
        </p>
      )
    },
    {
      title: "4. Third-Party Sharing",
      icon: <Shield className="w-6 h-6 text-green-400" />,
      content: (
        <p className="text-white/70 leading-relaxed">
          We strictly respect your privacy. We <strong>do not</strong> sell, rent, or trade your personal information to outside parties. Your data is only shared with our trusted infrastructure partners (like Google Cloud and Supabase) strictly for the purpose of operating this website and its features.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white py-20 px-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group"
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
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 max-w-2xl"
          >
            At IEEE Computational Intelligence Society CUSB, we are committed to protecting your personal information and your right to privacy.
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-white/30 mt-4"
          >
            Last updated: June 2026
          </motion.p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div 
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
              className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden"
            >
              {/* Decorative Top Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                  {section.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-white/40 text-sm"
        >
          <p>If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact the IEEE CIS CUSB webmaster team.</p>
        </motion.div>

      </div>
    </div>
  );
}
