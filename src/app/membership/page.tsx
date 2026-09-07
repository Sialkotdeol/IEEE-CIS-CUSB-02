"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  UserPlus, 
  MousePointerClick, 
  GraduationCap, 
  MapPin, 
  Search, 
  BookOpen, 
  Gift, 
  ShoppingCart, 
  CreditCard, 
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";

const steps = [
  {
    id: 1,
    title: "Sign In to Your IEEE Account",
    icon: UserPlus,
    description: "Open your browser and navigate to https://www.ieee.org/. Click 'Sign In' at the top-right and enter your registered email and password. You must have already created your IEEE account.",
    details: [
      "URL: https://www.ieee.org/",
      "Action: Click 'Sign In'",
      "Prerequisite: Pre-existing IEEE account (refer to Account Creation Guide if needed)"
    ]
  },
  {
    id: 2,
    title: "Click the 'JOIN IEEE' Button",
    icon: MousePointerClick,
    description: "Once signed in, locate and click the bright 'JOIN IEEE' button in the top navigation bar of the IEEE homepage.",
    details: [
      "Location: Top right navigation bar"
    ]
  },
  {
    id: 3,
    title: "Select 'Join as a Student'",
    icon: GraduationCap,
    description: "You will be redirected to the 'Learn About IEEE Membership' page. Scroll down to find and click the 'Join as a Student' button.",
    details: [
      "Action: Click 'Join as a Student' (do not select professional membership)"
    ]
  },
  {
    id: 4,
    title: "Fill in Contact Information",
    icon: MapPin,
    description: "Fill out the Contact Information page exactly as specified for Chandigarh University students to ensure correct processing.",
    details: [
      "Organization / Dept Name: Chandigarh University",
      "Address Type: University/College",
      "Address Line 1: Gharuan Mohali",
      "City/Locality: Mohali",
      "State: Punjab",
      "Pin Code: 140413",
      "Telephone: +91XXXXXXXXXX (use +91 prefix)"
    ]
  },
  {
    id: 5,
    title: "Profile Summary — Find Your School",
    icon: Search,
    description: "On the Profile Summary page, search and select your university.",
    details: [
      "Country/Region: India",
      "State: Punjab",
      "Action: Click the SEARCH button",
      "Selection: Select 'Chandigarh University' from the dropdown list"
    ]
  },
  {
    id: 6,
    title: "Complete Your Academic Profile Details",
    icon: BookOpen,
    description: "Fill in your academic profile based on your current enrollment status.",
    details: [
      "Student Status: Undergraduate (may vary)",
      "Degree Being Pursued: Bachelor of Engineering (or specific degree)",
      "Academic Program: Computer Science & Engrg (adjust for branch)",
      "Graduation Month: July",
      "Graduation Year: 2026 (1st yr), 2025 (2nd yr), 2024 (3rd yr), 2023 (4th yr)",
      "Is University Accredited: Yes"
    ]
  },
  {
    id: 7,
    title: "Fill in Referral Details (IMPORTANT!)",
    icon: Gift,
    description: "This is a critical step to unlock a special discount. After entering valid referral details from an existing IEEE CUSB member, your IEEE Student Membership fee will reduce from $14 to $7.",
    details: [
      "Member Directories: Select Yes",
      "How did you hear about IEEE: Select Member referral",
      "Referral code/name: Enter the details provided in the IEEE CUSB Google Sheet/Email",
      "Discount: Reduces base fee by 50%!"
    ]
  },
  {
    id: 8,
    title: "Add CIS Society Membership",
    icon: MousePointerClick,
    description: "This is the KEY step for CIS Membership. As a student IEEE member, the Computational Intelligence Society (CIS) costs only $2.00.",
    details: [
      "Action: Go to the Catalog page",
      "Search: Type 'computational'",
      "Select: Click the 'Societies' tab",
      "Add: Click 'IEEE Computational Intelligence Society Membership'",
      "Price check: Ensure it shows US $2.00"
    ]
  },
  {
    id: 9,
    title: "Review Your Cart",
    icon: ShoppingCart,
    description: "After adding CIS, proceed to the cart and verify your total.",
    details: [
      "IEEE Student Membership: $7.00 (after CUSB referral)",
      "CIS Society Membership: $2.00",
      "Total Amount: $9.00 (+ any applicable taxes)"
    ]
  },
  {
    id: 10,
    title: "Complete the Payment",
    icon: CreditCard,
    description: "Choose your preferred payment method to finalize the membership.",
    details: [
      "Credit/Debit Card: VISA / Mastercard accepted (Ensure international transactions are enabled!)",
      "UPI / Challan: Supported for Indian students (Select 'Challan')",
      "PayPal / Alipay / WeChat: Accepted",
      "NOT Accepted: Rupay cards"
    ]
  },
  {
    id: 11,
    title: "Alternative Payment Method",
    icon: HelpCircle,
    description: "If you are unable to complete the payment independently due to card issues, the IEEE CUSB Team can process it on your behalf.",
    details: [
      "Action: Fill out the joining form",
      "Link: https://bit.ly/Joiningform_IEEECUSB",
      "Contact: Reach out to the IEEE CUSB team via email for any queries"
    ]
  }
];

export default function MembershipGuidePage() {
  const [activeStep, setActiveStep] = useState(1);

  const nextStep = () => {
    if (activeStep < steps.length) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  return (
    <div className="relative min-h-screen font-sans gaming-bg-mesh">
      <Nav />
      
      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full section-eyebrow text-sm font-bold mb-6 tracking-wide uppercase">
            <CheckCircle2 className="w-4 h-4" />
            Chandigarh University Student Branch
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 gradient-text drop-shadow-sm pb-2">
            IEEE CIS Student Membership
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            A step-by-step visual guide to successfully applying for your IEEE Computational Intelligence Society student membership.
          </p>
        </motion.div>

        {/* Pricing Summary Cards */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16"
        >
          <div className="hud-card p-6 flex flex-col items-center justify-center text-center">
            <div className="text-slate-500 font-bold text-sm mb-2 uppercase tracking-wide">Base Cost</div>
            <div className="text-3xl font-bold text-slate-400 line-through opacity-70">$14.00</div>
            <div className="text-xs text-slate-500 font-medium mt-2">Regular student price</div>
          </div>
          <div className="hud-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden border-[#00629b] border-2 shadow-[0_4px_20px_rgba(0,98,155,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00629b]/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="text-[#00629b] font-bold text-sm mb-2 uppercase tracking-wide">With CUSB Referral</div>
              <div className="text-4xl font-extrabold text-[#00629b] drop-shadow-sm">$7.00</div>
              <div className="text-xs text-[#00629b]/80 font-bold mt-2 bg-[#00629b]/10 px-2 py-1 rounded-md inline-block">Additional 50% off</div>
            </div>
          </div>
          <div className="hud-card p-6 flex flex-col items-center justify-center text-center">
            <div className="text-cyan-600 font-bold text-sm mb-2 uppercase tracking-wide">Total (+ CIS Add-on)</div>
            <div className="text-4xl font-extrabold text-cyan-600 drop-shadow-sm">$9.00</div>
            <div className="text-xs text-cyan-700/80 font-bold mt-2">Includes $2 CIS Society</div>
          </div>
        </motion.div>

        {/* Interactive Steps Section */}
        <div className="w-full max-w-5xl glass-surface rounded-[24px] p-6 md:p-10 shadow-xl relative">
          <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
            <div className="text-lg font-bold text-slate-700">
              Step <span className="text-[#00629b] font-extrabold text-xl">{activeStep}</span> of {steps.length}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={prevStep}
                disabled={activeStep === 1}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextStep}
                disabled={activeStep === steps.length}
                className="p-2 rounded-full bg-[#00629b]/10 hover:bg-[#00629b]/20 text-[#00629b] disabled:opacity-40 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {steps.map((step) => (
                step.id === activeStep && (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row gap-8 items-start"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00629b] to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 border-2 border-white">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-slate-800 tracking-tight">
                        {step.title}
                      </h2>
                      <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                        {step.description}
                      </p>
                      
                      <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Key Details
                        </h3>
                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#00629b]"></div>
                              <span className="text-slate-700 font-medium">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {step.id === 11 && (
                        <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3 shadow-sm">
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-orange-800 font-medium">
                            If you use the alternative method, make sure to fill in the Google Form mentioned in the CUSB email with the details of the member whose referral you used.
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="mt-12 w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00629b] to-cyan-400"
              initial={{ width: `${(1 / steps.length) * 100}%` }}
              animate={{ width: `${(activeStep / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                  activeStep === step.id 
                    ? "bg-[#00629b] scale-125" 
                    : activeStep > step.id 
                      ? "bg-[#00629b]/40 hover:bg-[#00629b]/60" 
                      : "bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to step ${step.id}`}
              />
            ))}
          </div>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}
