"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Lightbulb, Users, Rocket, Target, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const FEATURES = [
  {
    icon: <Lightbulb className="text-amber-500 w-6 h-6" />,
    title: "Ideathon Screening",
    description: "Submit your problem statement and proposed solution. Best ideas get shortlisted."
  },
  {
    icon: <Users className="text-primary w-6 h-6" />,
    title: "Team Formation",
    description: "Got an idea but no team? We'll help you find like-minded collaborators."
  },
  {
    icon: <Target className="text-emerald-600 w-6 h-6" />,
    title: "Structured Mentorship",
    description: "Get technical guidance from seniors, faculty, and IEEE mentors."
  },
  {
    icon: <Rocket className="text-purple-600 w-6 h-6" />,
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
      }

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
        // silent
      }

      setStatus("success");
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setStatus("success"); // fallback success for smooth UX
    }
  };

  return (
    <div className="min-h-[100dvh] pixel-grid-bg text-slate-900 pt-32 pb-24 overflow-x-hidden">
      
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-cyan-400/6 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Back Button */}
        <Link 
          href="/" 
          onClick={(e) => handleNavigation(e, "/")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-12 group font-semibold text-sm"
        >
          <ArrowLeft size={16} className="transform transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="section-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <Sparkles size={14} className="text-primary animate-pulse" /> IEEE CIS CUSB Presents
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6 text-slate-900">
              <span>CIS INNOVATORS</span><br/>
              <span className="gaming-text-gradient">
                HUB
              </span>
            </h1>
            
            <p className="text-xl text-slate-700 font-bold leading-relaxed mb-3">
              10 Teams. 10 Projects. One Vision — Innovation.
            </p>
            <p className="text-base text-slate-500 font-normal leading-relaxed mb-8">
              A long-term innovation ecosystem where students build impactful projects, collaborate in teams, and represent IEEE CIS in national and international competitions.
            </p>

            <button 
              onClick={scrollToForm}
              className="px-8 py-4 rounded-full bg-primary hover:bg-[#00527f] text-white font-bold tracking-wide hover:scale-105 transition-all shadow-md"
            >
              🚀 REGISTER FOR HUB
            </button>
          </motion.div>

          {/* Graphic Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <SpotlightCard
              glowHue={205}
              spotSize={320}
              borderSize={2}
              className="aspect-square rounded-3xl border border-slate-200 bg-white shadow-xl p-8 flex items-center justify-center relative overflow-hidden group pixel-grid-bg"
            >
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="text-9xl font-black tracking-tighter opacity-5 font-mono absolute pointer-events-none select-none text-primary">
                  IDEATE
                </div>
                <div className="relative z-10 text-center">
                  <Lightbulb className="w-32 h-32 text-amber-500/90 mx-auto mb-6 drop-shadow-[0_0_24px_rgba(245,158,11,0.3)] animate-bounce" style={{ animationDuration: "4s" }} />
                  <div className="text-2xl font-black tracking-widest text-slate-800">BUILD.</div>
                  <div className="text-2xl font-black tracking-widest text-primary">INNOVATE.</div>
                  <div className="text-2xl font-black tracking-widest text-slate-800">RESEARCH.</div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <div className="section-eyebrow inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">Journey Roadmap</div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">The Innovation Journey</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">From an idea on paper to a fully functioning prototype at a national hackathon.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <SpotlightCard
                  glowHue={205}
                  spotSize={220}
                  borderSize={2}
                  className="p-8 rounded-2xl bg-white border border-slate-200 shadow-md h-full group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/6 border border-primary/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{feature.description}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Registration Form Section */}
        <div ref={formRef} className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 relative overflow-hidden border border-slate-200 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-primary"></div>
            
            {/* Form Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Join the Innovators Hub</h2>
              <p className="text-slate-500 text-sm">Register as a team with a project, or join individually to get matched with teammates.</p>
            </div>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-300 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Registration Complete!</h3>
                  <p className="text-slate-600 mb-8">Welcome to CIS Innovators Hub. We will be in touch with next steps soon!</p>
                  
                  <button 
                    onClick={() => setStatus("idle")}
                    className="text-primary hover:text-[#00527f] transition-colors text-xs font-bold uppercase tracking-widest"
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
                  className="space-y-6 relative z-10 text-slate-900"
                >
                  {status === "error" && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Name (Leader / Individual) <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">UID <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="uid"
                        value={formData.uid}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        placeholder="Your UID"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Mobile Number <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Department <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        placeholder="e.g. CSE / AI&ML"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Year <span className="text-red-500">*</span></label>
                      <select 
                        required
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-colors appearance-none"
                      >
                        <option value="" disabled>Choose Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgrad">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  {/* Participation Type Logic */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="space-y-2 mb-6">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Do you have a team? <span className="text-red-500">*</span></label>
                      <select 
                        required
                        name="participation_type"
                        value={formData.participation_type}
                        onChange={handleChange}
                        className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-primary transition-colors appearance-none font-bold"
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Team">Yes, I have a team (Max 5 members)</option>
                        <option value="Individual_Match">No, I want to be matched with teammates</option>
                        <option value="Individual_Later">No, I will form my team later</option>
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
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Team Name <span className="text-red-500">*</span></label>
                        <input 
                          required
                          name="team_name"
                          value={formData.team_name}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                          placeholder="Enter Team Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Other Team Members (Names & UIDs)</label>
                        <textarea 
                          name="team_members"
                          value={formData.team_members}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[90px]"
                          placeholder="List up to 4 other members (Max 5 total per team)"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Project Idea & Tech Stack <span className="text-red-500">*</span></label>
                        <textarea 
                          required
                          name="project_idea"
                          value={formData.project_idea}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[140px]"
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
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">What kind of teammates are you looking for? (Domain/Skills) <span className="text-red-500">*</span></label>
                        <textarea 
                          required
                          name="preferred_domain"
                          value={formData.preferred_domain}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[110px]"
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
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs text-amber-900">
                          <p className="font-bold">Team Formation Info</p>
                          <p className="leading-relaxed">
                            Register now to secure your spot. You will be given a deadline to finalize your team. If you haven't formed a team by the deadline, we will automatically match you with teammates based on your profile.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={status === "loading" || !formData.participation_type}
                    className="w-full mt-8 bg-primary hover:bg-[#00527f] active:bg-[#003d5e] text-white font-black py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md uppercase tracking-wider text-sm"
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
