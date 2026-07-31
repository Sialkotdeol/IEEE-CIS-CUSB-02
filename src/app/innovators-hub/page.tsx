"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Lightbulb, Users, Rocket, Target, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FEATURES = [
  {
    icon: <Lightbulb className="text-yellow-400 w-6 h-6" />,
    title: "Ideathon Screening",
    description: "Submit your problem statement and proposed solution. Best ideas get shortlisted."
  },
  {
    icon: <Users className="text-blue-400 w-6 h-6" />,
    title: "Team Formation",
    description: "Got an idea but no team? We'll help you find like-minded collaborators."
  },
  {
    icon: <Target className="text-green-400 w-6 h-6" />,
    title: "Structured Mentorship",
    description: "Get technical guidance from seniors, faculty, and IEEE mentors."
  },
  {
    icon: <Rocket className="text-purple-400 w-6 h-6" />,
    title: "Hackathon Exposure",
    description: "Represent IEEE CIS in Smart India Hackathon and international competitions."
  }
];

export default function InnovatorsHubPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    uid: "",
    department: "",
    year: "",
    participation_type: "",
    team_name: "",
    team_members: "",
    project_idea: "",
    preferred_domain: ""
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("page-leave"));
    setTimeout(() => {
      router.push(path);
    }, 400);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      // 1. Send to Supabase
      const { error } = await supabase
        .from('innovators_hub_registrations')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            uid: formData.uid,
            department: formData.department,
            year: formData.year,
            participation_type: formData.participation_type,
            team_name: formData.team_name,
            team_members: formData.team_members,
            project_idea: formData.project_idea,
            preferred_domain: formData.preferred_domain
          }
        ]);

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message || "Failed to register. Please check your Supabase table schema.");
      }

      // 2. Send confirmation email (fire-and-forget, don't block success)
      try {
        await fetch('/api/send-innovators-hub-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: formData.name, 
            email: formData.email,
            type: formData.participation_type
          })
        });
      } catch (emailErr) {
        console.warn("Confirmation email failed (non-blocking):", emailErr);
      }

      setStatus("success");
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white pt-32 pb-24 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Back Button */}
        <Link 
          href="/" 
          onClick={(e) => handleNavigation(e, "/")}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group"
        >
          <span className="transform transition-transform group-hover:-translate-x-1">←</span> Back to Home
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-widest uppercase mb-6">
              IEEE CIS CUSB Presents
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
              <span className="text-white">CIS INNOVATORS</span><br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-200 to-white">
                HUB
              </span>
            </h1>
            
            <p className="text-xl text-white/70 font-light leading-relaxed mb-4">
              10 Teams. 10 Projects. One Vision — Innovation.
            </p>
            <p className="text-lg text-white/50 font-light leading-relaxed mb-8">
              A long-term innovation ecosystem where students build impactful projects, collaborate in teams, and represent IEEE CIS in national and international competitions.
            </p>

            <button 
              onClick={scrollToForm}
              className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold tracking-wide hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              REGISTER NOW
            </button>
          </motion.div>

          {/* Graphic Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="text-9xl font-black tracking-tighter opacity-5 font-mono absolute pointer-events-none select-none">
                  IDEATE
                </div>
                <div className="relative z-10 text-center">
                  <Lightbulb className="w-32 h-32 text-yellow-400/80 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]" />
                  <div className="text-2xl font-bold tracking-widest text-white/80">BUILD.</div>
                  <div className="text-2xl font-bold tracking-widest text-blue-400">INNOVATE.</div>
                  <div className="text-2xl font-bold tracking-widest text-white/80">RESEARCH.</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Innovation Journey</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">From an idea on paper to a fully functioning prototype at a national hackathon.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Registration Form Section */}
        <div ref={formRef} className="max-w-3xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-500"></div>
            
            {/* Form Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Join the Hub</h2>
              <p className="text-white/50">Register as a team with a project, or join individually to get matched.</p>
            </div>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Registration Complete!</h3>
                  <p className="text-white/60 mb-8">Welcome to CIS Innovators Hub. Check your email for next steps.</p>
                  
                  <button 
                    onClick={() => setStatus("idle")}
                    className="text-blue-400 hover:text-white transition-colors text-sm font-semibold uppercase tracking-widest"
                  >
                    Submit another response
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6 relative z-10"
                >
                  {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  )}

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Name (Leader / Individual) <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">UID <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="uid"
                        value={formData.uid}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                        placeholder="Your UID"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Mobile Number <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Department <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                        placeholder="e.g. CSE / AI&ML"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Year <span className="text-red-500">*</span></label>
                      <select 
                        required
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors appearance-none"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option className="bg-[#050505] text-white" value="" disabled>Choose</option>
                        <option className="bg-[#050505] text-white" value="1st Year">1st Year</option>
                        <option className="bg-[#050505] text-white" value="2nd Year">2nd Year</option>
                        <option className="bg-[#050505] text-white" value="3rd Year">3rd Year</option>
                        <option className="bg-[#050505] text-white" value="4th Year">4th Year</option>
                        <option className="bg-[#050505] text-white" value="Postgrad">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  {/* Participation Type Logic */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="space-y-2 mb-6">
                      <label className="text-sm font-medium text-white/80">Do you have a team? <span className="text-red-500">*</span></label>
                      <select 
                        required
                        name="participation_type"
                        value={formData.participation_type}
                        onChange={handleChange}
                        className="w-full bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:bg-blue-500/20 transition-colors appearance-none font-medium"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option className="bg-[#050505] text-white" value="" disabled>Select an option</option>
                        <option className="bg-[#050505] text-white" value="Team">Yes, I have a team (Max 5 members)</option>
                        <option className="bg-[#050505] text-white" value="Individual_Match">No, I want to be matched with teammates</option>
                        <option className="bg-[#050505] text-white" value="Individual_Later">No, I will form my team later</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional Fields: Team */}
                  {formData.participation_type === "Team" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Team Name <span className="text-red-500">*</span></label>
                          <input 
                            required
                            name="team_name"
                            value={formData.team_name}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Enter Team Name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Other Team Members (Names & UIDs)</label>
                        <textarea 
                          name="team_members"
                          value={formData.team_members}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors min-h-[100px]"
                          placeholder="List up to 4 other members (Max 5 total per team)"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Project Idea & Tech Stack <span className="text-red-500">*</span></label>
                        <textarea 
                          required
                          name="project_idea"
                          value={formData.project_idea}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors min-h-[150px]"
                          placeholder="Describe the Problem Statement, your Proposed Solution, and the Tech Stack you plan to use..."
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Conditional Fields: Individual_Match */}
                  {formData.participation_type === "Individual_Match" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">What kind of teammates are you looking for? (Domain/Skills) <span className="text-red-500">*</span></label>
                        <textarea 
                          required
                          name="preferred_domain"
                          value={formData.preferred_domain}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors min-h-[120px]"
                          placeholder="e.g. I am a Frontend Developer proficient in React, looking for AI/ML developers to build a smart web app..."
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Conditional Fields: Individual_Later */}
                  {formData.participation_type === "Individual_Later" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm text-yellow-100 font-medium">Team Formation</p>
                          <p className="text-sm text-yellow-200/70">
                            Register now to secure your spot. You will be given a deadline to finalize your team. If you haven't formed a team by the deadline, we will automatically match you with teammates based on your profile.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={status === "loading" || !formData.participation_type}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.98] touch-manipulation select-none relative z-50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Submit Registration"
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
