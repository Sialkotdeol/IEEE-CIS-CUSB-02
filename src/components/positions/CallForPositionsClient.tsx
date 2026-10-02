"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
  Crown,
  Code2,
  Palette,
  Megaphone,
  ChevronDown,
  Lock,
  type LucideIcon,
} from "lucide-react";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { isApplicationWindowOpen, type Position, type PositionCategory, type RecruitmentSettings } from "@/data/positions";

const CATEGORY_ICONS: Record<PositionCategory, LucideIcon> = {
  Executive: Crown,
  Technical: Code2,
  Creative: Palette,
  Operations: Megaphone,
};

const CATEGORIES: ("All" | PositionCategory)[] = ["All", "Executive", "Technical", "Creative", "Operations"];

const PROCESS = [
  { step: "01", title: "Apply", text: "Fill in the form below with your top two role preferences." },
  { step: "02", title: "Screening", text: "The core team reviews every application and shortlists candidates." },
  { step: "03", title: "Interview", text: "Shortlisted candidates are invited for a short interview or task." },
  { step: "04", title: "Onboarding", text: "Selected members are announced and onboarded for the tenure." },
];

const INITIAL_FORM = {
  full_name: "",
  uid: "",
  email: "",
  phone: "",
  department: "",
  year_of_study: "",
  is_ieee_member: "",
  ieee_member_id: "",
  first_preference: "",
  second_preference: "",
  why_this_role: "",
  relevant_experience: "",
  hours_per_week: "",
  linkedin_url: "",
  portfolio_url: "",

};

type FormState = typeof INITIAL_FORM;

const inputClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors";
const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-600 font-mono";

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export default function CallForPositionsClient({
  positions: POSITIONS,
  settings,
}: {
  positions: Position[];
  settings: RecruitmentSettings;
}) {
  const { tenure: TENURE, deadline: APPLICATION_DEADLINE } = settings;
  const formRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isOpen = isApplicationWindowOpen(settings) && POSITIONS.length > 0;

  const visiblePositions = useMemo(
    () => (category === "All" ? POSITIONS : POSITIONS.filter((p) => p.category === category)),
    [category, POSITIONS]
  );
  const totalOpenings = POSITIONS.reduce((sum, p) => sum + p.openings, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const applyFor = (positionId: string) => {
    setFormData((prev) => ({
      ...prev,
      first_preference: positionId,
      second_preference: prev.second_preference === positionId ? "" : prev.second_preference,
    }));
    if (status === "success") setStatus("idle");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/call-for-positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, is_ieee_member: formData.is_ieee_member === "yes" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFieldErrors(data.fieldErrors || {});
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData(INITIAL_FORM);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const positionTitle = (id: string) => POSITIONS.find((p) => p.id === id)?.title;

  return (
    <div className="relative min-h-screen font-sans pixel-grid-bg text-slate-900 overflow-x-hidden">
      <Nav />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-cyan-400/6 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="section-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
            <Sparkles size={14} className="text-primary" /> Tenure {TENURE}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6 text-slate-900">
            CALL FOR <span className="gaming-text-gradient">POSITIONS</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto mb-8">
            IEEE CIS CUSB is building its next core team. If you want to lead events, ship projects, and grow the
            computational intelligence community at Chandigarh University, we want to hear from you.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2.5 shadow-sm text-sm font-bold text-slate-700">
              <Briefcase className="w-4 h-4 text-primary" /> {POSITIONS.length} roles
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2.5 shadow-sm text-sm font-bold text-slate-700">
              <Users className="w-4 h-4 text-primary" /> {totalOpenings} openings
            </div>
            {APPLICATION_DEADLINE && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2.5 shadow-sm text-sm font-bold text-slate-700">
                <CalendarClock className="w-4 h-4 text-primary" /> Apply by {formatDeadline(APPLICATION_DEADLINE)}
              </div>
            )}
          </div>

          <button
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-full bg-primary hover:bg-[#00527f] text-white font-bold tracking-wide hover:scale-105 transition-all shadow-md"
          >
            {isOpen ? "APPLY NOW" : "APPLICATIONS CLOSED"}
          </button>
        </motion.div>

        {/* Open Positions */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <div className="section-eyebrow inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
              Open Roles
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Find your role</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Tap a role to see responsibilities and eligibility. You can apply for up to two.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                  category === c
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePositions.map((p, i) => {
              const Icon = CATEGORY_ICONS[p.category];
              const isExpanded = expanded === p.id;
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.06, duration: 0.4 }}
                >
                  <SpotlightCard
                    glowHue={205}
                    spotSize={220}
                    borderSize={2}
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/6 border border-primary/15 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{p.category}</span>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {p.openings} {p.openings === 1 ? "opening" : "openings"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-slate-900">{p.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm mb-4">{p.summary}</p>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors mb-4 self-start"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Hide details" : "View details"}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <ul className="space-y-2 mb-4">
                            {p.responsibilities.map((r) => (
                              <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                            <span className="font-bold text-slate-700">Eligibility: </span>
                            {p.eligibility}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => applyFor(p.id)}
                      disabled={!isOpen}
                      className="mt-auto w-full py-2.5 rounded-xl border-2 border-primary text-primary font-bold text-sm uppercase tracking-wider hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Apply for this role
                    </button>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Selection Process */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Selection process</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS.map((s) => (
              <div key={s.step} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl font-black text-primary/20 font-mono mb-2">{s.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <div ref={formRef} className="max-w-3xl mx-auto scroll-mt-28">
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden border border-slate-200 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-primary" />

            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Application Form</h2>
              <p className="text-slate-500 text-sm">One application per student. Fields marked * are required.</p>
            </div>

            {!isOpen ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-9 h-9 text-slate-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Applications are closed</h3>
                <p className="text-slate-600">Follow us on Instagram and LinkedIn to hear about the next call for positions.</p>
              </div>
            ) : (
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
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Application submitted!</h3>
                    <p className="text-slate-600 mb-8 max-w-md">
                      Thanks for applying to the IEEE CIS CUSB core team. Shortlisted candidates will be contacted by
                      email for the next round.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="text-primary hover:text-[#00527f] transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      Back to form
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
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{errorMessage}</p>
                      </div>
                    )}

                    {/* Personal details */}
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">Personal details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Full Name" required error={fieldErrors.full_name}>
                        <input required name="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} placeholder="Your full name" />
                      </Field>
                      <Field label="UID" required error={fieldErrors.uid}>
                        <input required name="uid" value={formData.uid} onChange={handleChange} className={inputClass} placeholder="e.g. 23BCS10001" />
                      </Field>
                      <Field label="Email Address" required error={fieldErrors.email}>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" />
                      </Field>
                      <Field label="Mobile Number" required error={fieldErrors.phone}>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                      </Field>
                      <Field label="Department" required error={fieldErrors.department}>
                        <input required name="department" value={formData.department} onChange={handleChange} className={inputClass} placeholder="e.g. CSE / AI&ML" />
                      </Field>
                      <Field label="Year of Study" required error={fieldErrors.year_of_study}>
                        <select required name="year_of_study" value={formData.year_of_study} onChange={handleChange} className={`${inputClass} appearance-none`}>
                          <option value="" disabled>Choose year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      </Field>
                      <Field label="Are you an IEEE member?" required error={fieldErrors.is_ieee_member}>
                        <select required name="is_ieee_member" value={formData.is_ieee_member} onChange={handleChange} className={`${inputClass} appearance-none`}>
                          <option value="" disabled>Select an option</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </Field>
                      {formData.is_ieee_member === "yes" && (
                        <Field label="IEEE Membership Number" error={fieldErrors.ieee_member_id}>
                          <input name="ieee_member_id" value={formData.ieee_member_id} onChange={handleChange} className={inputClass} placeholder="e.g. 99887766" />
                        </Field>
                      )}
                    </div>

                    {/* Role preferences */}
                    <div className="pt-4 border-t border-slate-100 space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-primary">Role preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="First Preference" required error={fieldErrors.first_preference}>
                          <select
                            required
                            name="first_preference"
                            value={formData.first_preference}
                            onChange={handleChange}
                            className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-primary transition-colors appearance-none font-bold"
                          >
                            <option value="" disabled>Select a role</option>
                            {POSITIONS.map((p) => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Second Preference" error={fieldErrors.second_preference} hint="Optional">
                          <select
                            name="second_preference"
                            value={formData.second_preference}
                            onChange={handleChange}
                            className={`${inputClass} appearance-none`}
                          >
                            <option value="">No second preference</option>
                            {POSITIONS.filter((p) => p.id !== formData.first_preference).map((p) => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <Field
                        label={`Why do you want to be ${positionTitle(formData.first_preference) ? `the ${positionTitle(formData.first_preference)}` : "part of the team"}?`}
                        required
                        error={fieldErrors.why_this_role}
                        hint={`${formData.why_this_role.trim().length}/50 characters minimum`}
                      >
                        <textarea
                          required
                          minLength={50}
                          name="why_this_role"
                          value={formData.why_this_role}
                          onChange={handleChange}
                          className={`${inputClass} min-h-[130px]`}
                          placeholder="What would you bring to this role, and what do you want to achieve during your tenure?"
                        />
                      </Field>

                      <Field label="Relevant Experience" required error={fieldErrors.relevant_experience}>
                        <textarea
                          required
                          minLength={20}
                          name="relevant_experience"
                          value={formData.relevant_experience}
                          onChange={handleChange}
                          className={`${inputClass} min-h-[110px]`}
                          placeholder="Clubs, events, projects, internships, or skills relevant to this role"
                        />
                      </Field>

                      <Field label="Hours you can commit per week" required error={fieldErrors.hours_per_week}>
                        <select required name="hours_per_week" value={formData.hours_per_week} onChange={handleChange} className={`${inputClass} appearance-none`}>
                          <option value="" disabled>Select hours</option>
                          <option value="2-4">2–4 hours</option>
                          <option value="4-6">4–6 hours</option>
                          <option value="6-8">6–8 hours</option>
                          <option value="8+">8+ hours</option>
                        </select>
                      </Field>
                    </div>

                    {/* Links */}
                    <div className="pt-4 border-t border-slate-100 space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-primary">Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="LinkedIn Profile" error={fieldErrors.linkedin_url}>
                          <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/..." />
                        </Field>
                        <Field label="Portfolio / GitHub" error={fieldErrors.portfolio_url}>
                          <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} className={inputClass} placeholder="https://github.com/..." />
                        </Field>
                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full mt-8 bg-primary hover:bg-[#00527f] active:bg-[#003d5e] text-white font-black py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md uppercase tracking-wider text-sm"
                    >
                      {status === "loading" ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Application"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
