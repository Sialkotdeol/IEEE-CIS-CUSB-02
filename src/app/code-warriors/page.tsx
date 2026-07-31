"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { Code2, Bug, Trophy, BookOpen, UserCircle, Rocket, CheckCircle2, AlertCircle, Loader2, LayoutDashboard, KeyRound, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FEATURES = [
  {
    icon: <Code2 className="text-indigo-400 w-6 h-6" />,
    title: "Daily POTD",
    description: "Handpicked LeetCode problems to build daily consistency."
  },
  {
    icon: <Bug className="text-red-500 w-6 h-6" />,
    title: "Weekly Bug Bounties",
    description: "Spot the flaw, claim the bragging rights. Master debugging."
  },
  {
    icon: <Trophy className="text-yellow-500 w-6 h-6" />,
    title: "Monthly Sprints",
    description: "Virtual mock contests to sharpen your speed and problem-solving."
  },
  {
    icon: <BookOpen className="text-blue-500 w-6 h-6" />,
    title: "Master DSA",
    description: "From Arrays to Dynamic Programming, break down complex concepts with peers."
  },
  {
    icon: <UserCircle className="text-green-500 w-6 h-6" />,
    title: "Build Your Profile",
    description: "Get step-by-step guidance on building a strong LeetCode profile and contest ratings."
  },
  {
    icon: <Rocket className="text-purple-500 w-6 h-6" />,
    title: "Competitive Edge",
    description: "Helps you prepare for IEEE Xtreme, ICPC, and top technical placements."
  }
];

export default function CodeWarriorsPage() {
  const { user, login, register, loading } = useCodeWarriorsAuth();
  const router = useRouter();
  const formSectionRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"register" | "login" | "mentor">("register");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resetMessage, setResetMessage] = useState("");

  // Registration Form State
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    uid: "",
    department: "",
    year: "",
    leetcode: "",   // LeetCode username — sent to API
    linkedin: "",
    referred_by: ""
  });

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Mentor Form State
  const [mentorData, setMentorData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    year: "",
    leetcode_handle: "",
    linkedin: "",
    resume_link: "",
    experience: "",
    mobile: ""
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
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "leetcode") {
      let processedValue = value;
      // Auto-extract username if a full URL is pasted
      const urlMatch = value.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)/i);
      if (urlMatch && urlMatch[1]) {
        processedValue = urlMatch[1];
      }
      setRegisterData({ ...registerData, [name]: processedValue });
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleMentorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setMentorData({ ...mentorData, [e.target.name]: e.target.value });
  };

  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const submissionData = {
      ...mentorData,
      uid: "N/A", // Always N/A as requested
      year: mentorData.role === "Working Professional" ? "N/A" : mentorData.year,
      department: `${mentorData.role} - ${mentorData.department}`
    };

    try {
      const res = await fetch("/api/code-warriors/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Failed to submit application.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // Guard: ensure LeetCode username is provided
    if (!registerData.leetcode.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your LeetCode username.");
      return;
    }

    try {
      const success = await register(registerData);
      if (success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage("Registration failed. Please check your LeetCode username and email are correct and unique.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage("Login failed. Check your credentials or register if you haven't yet.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetStatus("loading");
    setResetMessage("");
    try {
      const res = await fetch("/api/code-warriors/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot_password", email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResetStatus("success");
        setResetMessage(data.message || "Reset link sent!");
      } else {
        setResetStatus("error");
        setResetMessage(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      setResetStatus("error");
      setResetMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white pt-32 pb-24 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header / Back Link */}
        <div className="flex justify-between items-center mb-12">
          <Link 
            href="/" 
            onClick={(e) => handleNavigation(e, "/")}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
          >
            <span className="transform transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </Link>

          {user && (
            <Link
              href="/code-warriors/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all font-semibold text-sm"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-6">
              IEEE CIS CUSB Presents
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
              <span className="text-white">C1S C0DE</span><br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-indigo-500 to-indigo-400">
                WARR10RS
              </span>
            </h1>
            
            <p className="text-xl text-white/70 font-light leading-relaxed mb-8">
              Stop brute-forcing your code from <span className="font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded">O(N²)</span> to <span className="font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">O(N log N)</span>. 
              Learn how to optimize your logic and think like a grandmaster.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {user ? (
                <Link
                  href="/code-warriors/dashboard"
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-full bg-indigo-600 text-white font-bold tracking-wide hover:bg-indigo-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                >
                  ENTER YOUR DASHBOARD
                </Link>
              ) : (
                <>
                  <button 
                    onClick={scrollToForm}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-bold tracking-wide hover:bg-indigo-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                  >
                    JOIN NOW
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("login");
                      scrollToForm();
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-bold tracking-wide hover:bg-white/10 hover:scale-105 transition-all"
                  >
                    EXISTING DASHBOARD
                  </button>
                </>
              )}
            </div>

            {!user && (
              <div className="mt-8 flex justify-center lg:justify-start">
                <button
                  onClick={() => {
                    setActiveTab("mentor");
                    scrollToForm();
                  }}
                  className="group text-sm font-medium text-white/50 hover:text-white transition-colors flex items-center justify-center lg:justify-start gap-2"
                >
                  Are you a grandmaster? <span className="text-indigo-400 group-hover:text-indigo-300">Apply to be a Mentor &rarr;</span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Graphic Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              {/* Custom Helmet Visual / Text */}
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="text-9xl font-black tracking-tighter opacity-10 font-mono absolute pointer-events-none select-none">
                  {"</>"}
                </div>
                <div className="relative z-10 text-center">
                  <Bug className="w-32 h-32 text-indigo-500/80 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]" />
                  <div className="text-2xl font-bold tracking-widest text-white/80">CODE BETTER.</div>
                  <div className="text-2xl font-bold tracking-widest text-indigo-400">THINK SMARTER.</div>
                  <div className="text-2xl font-bold tracking-widest text-white/80">WIN TOGETHER.</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Become A Code Warrior?</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">A peer-learning ecosystem focused on building consistency, mastering DSA, and cracking technical placements.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-indigo-500/30 bg-white/5 backdrop-blur-md transition-colors"
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

        {/* Registration & Login Container */}
        <div ref={formSectionRef} className="max-w-2xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 bg-white/5 backdrop-blur-lg relative overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8">
              <button
                onClick={() => { setActiveTab("register"); setStatus("idle"); }}
                className={`flex-1 pb-4 text-lg font-bold transition-all relative ${
                  activeTab === "register" ? "text-indigo-400" : "text-white/50 hover:text-white"
                }`}
              >
                Register
                {activeTab === "register" && (
                  <motion.div layoutId="activeLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
                )}
              </button>
              <button
                onClick={() => { setActiveTab("login"); setStatus("idle"); }}
                className={`flex-1 pb-4 text-lg font-bold transition-all relative ${
                  activeTab === "login" ? "text-indigo-400" : "text-white/50 hover:text-white"
                }`}
              >
                Access Dashboard
                {activeTab === "login" && (
                  <motion.div layoutId="activeLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
                )}
              </button>
              <button
                onClick={() => { setActiveTab("mentor"); setStatus("idle"); }}
                className={`flex-1 pb-4 text-lg font-bold transition-all relative ${
                  activeTab === "mentor" ? "text-indigo-400" : "text-white/50 hover:text-white"
                }`}
              >
                Apply for Mentor
                {activeTab === "mentor" && (
                  <motion.div layoutId="activeLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
                )}
              </button>
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
                  <h3 className="text-2xl font-bold mb-2">
                    {activeTab === "register" ? "Registration Complete!" : activeTab === "mentor" ? "Application Received!" : "Access Granted!"}
                  </h3>
                  <p className="text-white/60 mb-8">
                    {activeTab === "register" 
                      ? "Welcome to Code Warriors. We've synchronized your LeetCode profile." 
                      : activeTab === "mentor"
                      ? "Your mentor application is under review. We will reach out soon!"
                      : "Redirecting you to your Code Warriors dashboard..."}
                  </p>

                  <Link
                    href="/code-warriors/dashboard"
                    className="w-full md:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide transition-all shadow-md mb-6"
                  >
                    Go to Dashboard
                  </Link>

                  {activeTab === "register" && (
                    <a 
                      href="https://chat.whatsapp.com/I6oYLe92o2UIMKhERnsxvN?mode=gi_t"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] active:scale-95 touch-manipulation text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 mb-6 shadow-lg shadow-[#25D366]/20"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Join WhatsApp Group
                    </a>
                  )}

                  <button 
                    onClick={() => setStatus("idle")}
                    className="text-indigo-400 hover:text-white transition-colors text-sm font-semibold uppercase tracking-widest"
                  >
                    Go Back
                  </button>
                </motion.div>
              ) : activeTab === "register" ? (
                <motion.form 
                  key="register-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleRegisterSubmit} 
                  className="space-y-6 relative z-10"
                >
                  {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Name <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="Your Full Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">UID (University ID) <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="uid"
                        value={registerData.uid}
                        onChange={handleRegisterChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="Your University ID"
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
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Mobile Number <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="tel"
                        name="mobile"
                        value={registerData.mobile}
                        onChange={handleRegisterChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
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
                        value={registerData.department}
                        onChange={handleRegisterChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="Computer Science, ECE, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Year <span className="text-red-500">*</span></label>
                      <select 
                        required
                        name="year"
                        value={registerData.year}
                        onChange={handleRegisterChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors appearance-none"
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">LeetCode Username or Profile URL <span className="text-red-500">*</span></label>
                    <input 
                      required
                      name="leetcode"
                      value={registerData.leetcode}
                      onChange={handleRegisterChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      placeholder="e.g. neal_wu or https://leetcode.com/neal_wu"
                    />
                    <p className="text-[11px] text-white/40">Enter your LeetCode username or paste your full profile URL.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        required
                        type={showPassword ? "text" : "password"}
                        name="password"
                        minLength={6}
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors pr-10"
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-white/40">You'll use this to log in to your dashboard.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">LinkedIn Profile (Optional)</label>
                    <input 
                      name="linkedin"
                      value={registerData.linkedin}
                      onChange={handleRegisterChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Referred By (Optional)</label>
                    <input 
                      name="referred_by"
                      value={registerData.referred_by}
                      onChange={handleRegisterChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      placeholder="Name of the team member"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] touch-manipulation select-none relative z-50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Submit Registration"
                    )}
                  </button>
                </motion.form>
              ) : activeTab === "mentor" ? (
                <motion.form 
                  key="mentor-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleMentorSubmit} 
                  className="space-y-6 relative z-10"
                >
                  {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Name <span className="text-red-500">*</span></label>
                      <input 
                        required
                        name="name"
                        value={mentorData.name}
                        onChange={handleMentorChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="Your Full Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Role <span className="text-red-500">*</span></label>
                      <select 
                        required
                        name="role"
                        value={mentorData.role || ""}
                        onChange={handleMentorChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors appearance-none"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option className="bg-[#050505] text-white" value="" disabled>Choose</option>
                        <option className="bg-[#050505] text-white" value="Student">Student</option>
                        <option className="bg-[#050505] text-white" value="Working Professional">Working Professional</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={mentorData.email}
                        onChange={handleMentorChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Mobile Number <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="tel"
                        name="mobile"
                        value={mentorData.mobile}
                        onChange={handleMentorChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 ${mentorData.role === "Working Professional" ? "" : "md:grid-cols-2"} gap-6`}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        {mentorData.role === "Working Professional" ? "Company / Role" : "Department"} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required
                        name="department"
                        value={mentorData.department}
                        onChange={handleMentorChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder={mentorData.role === "Working Professional" ? "e.g. SDE at Google" : "Computer Science, ECE, etc."}
                      />
                    </div>
                    {mentorData.role !== "Working Professional" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Year <span className="text-red-500">*</span></label>
                        <select 
                          required
                          name="year"
                          value={mentorData.year}
                          onChange={handleMentorChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors appearance-none"
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
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">LeetCode Username <span className="text-red-500">*</span></label>
                    <input 
                      required
                      name="leetcode_handle"
                      value={mentorData.leetcode_handle}
                      onChange={handleMentorChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      placeholder="e.g. neal_wu"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Resume Link (Google Drive / Portfolio) <span className="text-red-500">*</span></label>
                    <input 
                      required
                      name="resume_link"
                      value={mentorData.resume_link}
                      onChange={handleMentorChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      placeholder="https://drive.google.com/..."
                    />
                    <p className="text-[11px] text-white/40">Please ensure access is set to <strong>"Anyone with the link can view"</strong>.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Previous Mentoring Experience <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      name="experience"
                      value={mentorData.experience}
                      onChange={handleMentorChange}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors resize-none"
                      placeholder="Tell us about your previous experience mentoring or teaching others..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">LinkedIn Profile (Optional)</label>
                    <input 
                      name="linkedin"
                      value={mentorData.linkedin}
                      onChange={handleMentorChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] touch-manipulation select-none relative z-50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleLoginSubmit} 
                  className="space-y-6 relative z-10"
                >
                  {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                          required
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors pr-10"
                          placeholder="Your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] touch-manipulation select-none relative z-50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5" /> Access Dashboard
                      </div>
                    )}
                  </button>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setShowResetDialog(true)}
                      className="text-sm text-white/50 hover:text-indigo-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <AnimatePresence>
        {showResetDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowResetDialog(false);
                  setResetStatus("idle");
                  setResetEmail("");
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
              
              {resetStatus === "success" ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-white/80 leading-relaxed mb-6">{resetMessage}</p>
                  <button
                    onClick={() => {
                      setShowResetDialog(false);
                      setResetStatus("idle");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Got it
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p className="text-white/70 mb-6 leading-relaxed text-sm">
                    Enter the email address associated with your Code Warriors account, and we'll send you a link to reset your password.
                  </p>
                  
                  {resetStatus === "error" && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-3 py-2 rounded-lg flex items-start gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs">{resetMessage}</p>
                    </div>
                  )}

                  <div className="space-y-2 mb-6">
                    <input 
                      required
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetStatus === "loading"}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {resetStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
